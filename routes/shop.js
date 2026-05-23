//Importowanie modułów i inicjalizacja routera
const express = require('express');
const router = express.Router();
const db = require('../db'); // Import bazy danych

// Wyświetlanie strony sklepu
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, 
                   GROUP_CONCAT(ps.size, ':', ps.available) AS sizes 
            FROM products p 
            LEFT JOIN products_sizes ps ON p.id = ps.product_id 
            GROUP BY p.id
        `);

        // Przetworzenie rozmiarów na obiekt
        const processedProducts = products.map(product => {
            const sizes = {};
            product.sizes.split(',').forEach(sizeInfo => {
                const [size, available] = sizeInfo.split(':');
                sizes[size] = available === '1';
            });
            return { ...product, sizes };
        });

        res.render('shop', { title: 'Sklep', products: processedProducts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

// Wyświetlanie koszyka
router.get('/cart', async (req, res) => {
    try {
        const [cartItems] = await db.query(`
            SELECT cart.id, products.name, products.price, cart.size 
            FROM cart 
            JOIN products ON cart.product_id = products.id
        `);
        res.render('cart', { title: 'Koszyk', cartItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

// Dodawanie produktu do koszyka
router.post('/add-to-cart', async (req, res) => {
    const { productId, size } = req.body;

    try {
        await db.query('INSERT INTO cart (product_id, size) VALUES (?, ?)', [productId, size]);
        res.redirect('/shop/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

// Usuwanie produktu z koszyka
router.post('/remove-from-cart', async (req, res) => {
    const { cartId } = req.body;
    try {
        await db.query('DELETE FROM cart WHERE id = ?', [cartId]);
        res.redirect('/shop/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});


// Wyświetlanie formularza checkout (wprowadzanie danych klienta)
router.get('/checkout', (req, res) => {
    res.render('checkout', { title: 'Zamówienie' });
});

// Obsługa danych klienta i przejście do metod płatności i dostawy (Middleware obsługujące sesję)
router.post('/checkout', async (req, res) => {
    const { firstName, lastName, phone, email, street, postalCode, city } = req.body;

    // Zapisanie danych klienta w sesji
    req.session.orderDetails = { firstName, lastName, phone, email, street, postalCode, city };

    // Przekierowanie do wyboru metod płatności i dostawy
    res.redirect('/shop/payment-delivery');
});

// Wybór metody płatności i dostawy ( Middleware sprawdzające, czy użytkownik podał dane zamówienia)
router.get('/payment-delivery', (req, res) => {
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
            { id: 'personal', name: 'Odbiór osobisty', price: 0, address: 'Sklep ul. Przykladowa 1, Warszawa' }
        ]
    });
});

// Obsługa wyboru płatności i dostawy
router.post('/payment-delivery', (req, res) => {
    const { paymentMethod, deliveryMethod } = req.body;

    // Zapisanie wyborów płatności i dostawy w sesji
    req.session.paymentMethod = paymentMethod;
    req.session.deliveryMethod = deliveryMethod;

    // Przekierowanie do podsumowania zamówienia
    res.redirect('/shop/order-summary');
});

// Wyświetlanie podsumowania zamówienia
router.get('/order-summary', async (req, res) => {
    if (!req.session.orderDetails || !req.session.paymentMethod || !req.session.deliveryMethod) {
        return res.redirect('/shop/checkout');
    }

    try {
        const [cartItems] = await db.query(`
            SELECT cart.id, products.name, products.price, cart.size
            FROM cart
                     JOIN products ON cart.product_id = products.id
        `);

        const deliveryPrice =
            req.session.deliveryMethod === 'address'
                ? 15
                : req.session.deliveryMethod === 'paczkomat'
                    ? 10
                    : 0;


        const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0) + deliveryPrice;

        res.render('order-summary', {
            title: 'Podsumowanie Zamówienia',
            orderDetails: req.session.orderDetails,
            cartItems,
            deliveryPrice,
            totalPrice: totalPrice.toFixed(2) // Zaokrąglenie do 2 miejsc po przecinku
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

// Obsługa podsumowania zamówienia
router.post('/order-summary', async (req, res) => {
    const { paymentMethod, deliveryMethod } = req.body;

    // Pobranie danych zamówienia z sesji
    const orderDetails = req.session.orderDetails;

    if (!orderDetails) {
        return res.redirect('/shop/checkout'); // Jeśli brak danych, wróć do formularza
    }
    // Przekierowanie do potwierdzenia zamówienia
    res.redirect('/shop/order-confirmation');

});

// Potwierdzenie zamówienia
router.post('/order-confirmation', async (req, res) => {
    try {
        const { orderDetails, paymentMethod, deliveryMethod } = req.session;

        // Pobranie elementów z koszyka
        const [cartItems] = await db.query(`
            SELECT c.product_id, c.size
            FROM cart c
        `);

        // Tworzenie zamówienia w bazie danych
        let orderId = null; // Zmienna do przechowywania numeru zamówienia
        for (const item of cartItems) {
            const [result] = await db.query(
                'INSERT INTO orders (product_id, size, customer_name, customer_address, payment_method, delivery_method) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    item.product_id,
                    item.size,
                    `${orderDetails.firstName} ${orderDetails.lastName}`,
                    `${orderDetails.street}, ${orderDetails.postalCode}, ${orderDetails.city}`,
                    paymentMethod,
                    deliveryMethod
                ]
            );

            // Ustawienie orderId na identyfikator pierwszego wiersza
            if (!orderId) orderId = result.insertId;
        }

        // Opróżnianie koszyka
        await db.query('DELETE FROM cart');

        // Czyszczenie sesji
        req.session.orderDetails = null;
        req.session.paymentMethod = null;
        req.session.deliveryMethod = null;

        // Przekazanie orderId do widoku potwierdzenia zamówienia
        res.render('order-confirmation', { title: 'Potwierdzenie Zamówienia', orderId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd podczas składania zamówienia.');
    }
});

module.exports = router;