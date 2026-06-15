const { isAuthenticated } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Shop page
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT
        p.*,
        GROUP_CONCAT(ps.size, ':', ps.available) AS sizes
      FROM products p
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      GROUP BY p.id
    `);

    const processedProducts = products.map((product) => {
      const sizes = {};

      if (product.sizes) {
        product.sizes.split(',').forEach((sizeInfo) => {
          const [size, available] = sizeInfo.split(':');
          sizes[size] = available === '1';
        });
      }

      return { ...product, sizes };
    });

    res.render('shop', { title: 'Sklep', products: processedProducts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Cart page
router.get('/cart', isAuthenticated, async (req, res) => {
  try {
    const [cartItems] = await db.query(`
      SELECT
        ci.id,
        p.name,
        p.price,
        ci.size,
        ci.quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);

    res.render('cart', { title: 'Koszyk', cartItems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Add product to cart
router.post('/add-to-cart', isAuthenticated, async (req, res) => {
  const { productId, size } = req.body;

  try {
    await db.query(
      `
      INSERT INTO cart_items (product_id, size, quantity, session_id)
      VALUES (?, ?, 1, ?)
      `,
      [productId, size, req.sessionID]
    );

    res.redirect('/shop/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Remove product from cart
router.post('/remove-from-cart', isAuthenticated, async (req, res) => {
  const { cartId } = req.body;

  try {
    await db.query('DELETE FROM cart_items WHERE id = ?', [cartId]);
    res.redirect('/shop/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Checkout form
router.get('/checkout', isAuthenticated, (req, res) => {
  res.render('checkout', { title: 'Zamówienie' });
});

// Save customer details in session
router.post('/checkout', isAuthenticated, async (req, res) => {
  const { firstName, lastName, phone, email, street, postalCode, city } = req.body;

  req.session.orderDetails = {
    firstName,
    lastName,
    phone,
    email,
    street,
    postalCode,
    city
  };

  res.redirect('/shop/payment-delivery');
});

// Payment and delivery page
router.get('/payment-delivery', isAuthenticated, (req, res) => {
  if (!req.session.orderDetails) {
    return res.redirect('/shop/checkout');
  }

  res.render('payment-delivery', {
    title: 'Płatność i Dostawa',
    paymentMethods: [
      { id: 'blik', name: 'Blik', logo: 'blik.png' },
      { id: 'cash', name: 'Płatność przy odbiorze', logo: 'pobraniem.png' },
      { id: 'przelewy24', name: 'Przelewy24', logo: 'przelewy24.png' }
    ],
    deliveryMethods: [
      { id: 'address', name: 'Na podany adres', price: 15 },
      { id: 'paczkomat', name: 'Paczkomat', price: 10 },
      {
        id: 'personal',
        name: 'Odbiór osobisty',
        price: 0,
        address: 'Sklep ul. Przykładowa 1, Warszawa'
      }
    ]
  });
});

// Save payment and delivery method
router.post('/payment-delivery', isAuthenticated, (req, res) => {
  const { paymentMethod, deliveryMethod } = req.body;

  req.session.paymentMethod = paymentMethod;
  req.session.deliveryMethod = deliveryMethod;

  res.redirect('/shop/order-summary');
});

// Order summary
router.get('/order-summary', isAuthenticated, async (req, res) => {
  if (!req.session.orderDetails || !req.session.paymentMethod || !req.session.deliveryMethod) {
    return res.redirect('/shop/checkout');
  }

  try {
    const [cartItems] = await db.query(`
      SELECT
        ci.id,
        ci.product_id,
        p.name,
        p.price,
        ci.size,
        ci.quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);

    const deliveryPrice =
      req.session.deliveryMethod === 'address'
        ? 15
        : req.session.deliveryMethod === 'paczkomat'
          ? 10
          : 0;

    const productsTotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const totalPrice = productsTotal + deliveryPrice;

    res.render('order-summary', {
      title: 'Podsumowanie Zamówienia',
      orderDetails: req.session.orderDetails,
      cartItems,
      deliveryPrice,
      totalPrice: totalPrice.toFixed(2)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Confirm summary
router.post('/order-summary', isAuthenticated, async (req, res) => {
  if (!req.session.orderDetails) {
    return res.redirect('/shop/checkout');
  }

  res.redirect('/shop/order-confirmation');
});

// Create order
router.post('/order-confirmation', isAuthenticated, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { orderDetails, paymentMethod, deliveryMethod } = req.session;

    if (!orderDetails || !paymentMethod || !deliveryMethod) {
      connection.release();
      return res.redirect('/shop/checkout');
    }

    const [cartItems] = await connection.query(`
      SELECT
        ci.product_id,
        ci.size,
        ci.quantity,
        p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);

    if (cartItems.length === 0) {
      connection.release();
      return res.redirect('/shop/cart');
    }

    const deliveryPrice =
      deliveryMethod === 'address'
        ? 15
        : deliveryMethod === 'paczkomat'
          ? 10
          : 0;

    const productsTotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const totalPrice = productsTotal + deliveryPrice;

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (
        user_id,
        customer_email,
        customer_name,
        customer_address,
        payment_method,
        delivery_method,
        delivery_price,
        total_price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.session.user ? req.session.user.id : null,
        orderDetails.email,
        `${orderDetails.firstName} ${orderDetails.lastName}`,
        `${orderDetails.street}, ${orderDetails.postalCode}, ${orderDetails.city}`,
        paymentMethod,
        deliveryMethod,
        deliveryPrice,
        totalPrice
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          size,
          quantity,
          unit_price
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [orderId, item.product_id, item.size, item.quantity, item.price]
      );
    }

    await connection.query('DELETE FROM cart_items');

    await connection.commit();

    req.session.orderDetails = null;
    req.session.paymentMethod = null;
    req.session.deliveryMethod = null;

    res.render('order-confirmation', {
      title: 'Potwierdzenie Zamówienia',
      orderId
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).send('Błąd podczas składania zamówienia.');
  } finally {
    connection.release();
  }
});

router.get('/orders', isAuthenticated, async (req, res) => {
  try {
    const [orders] = await db.query(
      `
      SELECT
        id,
        customer_name,
        customer_email,
        delivery_method,
        payment_method,
        delivery_price,
        total_price,
        status,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.session.user.id]
    );

    res.render('orders', {
      title: 'Moje zamówienia',
      orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

module.exports = router;