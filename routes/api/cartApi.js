const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { isAuthenticated } = require('../../middleware/authMiddleware');

// GET /api/cart
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const [cartItems] = await db.query(
      `
      SELECT
        ci.id,
        ci.product_id,
        p.name AS product_name,
        p.price,
        p.image_url,
        ci.size,
        ci.quantity,
        (p.price * ci.quantity) AS line_total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
      `,
      [req.session.user.id]
    );

    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', isAuthenticated, async (req, res) => {
  const { productId, size, quantity = 1 } = req.body;

  try {
    const [products] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [existingItems] = await db.query(
      `
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ? AND product_id = ? AND size = ?
      `,
      [req.session.user.id, productId, size]
    );

    if (existingItems.length > 0) {
      await db.query(
        `
        UPDATE cart_items
        SET quantity = quantity + ?
        WHERE id = ?
        `,
        [quantity, existingItems[0].id]
      );

      return res.status(200).json({
        message: 'Cart item quantity updated',
        cartItemId: existingItems[0].id
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO cart_items (user_id, product_id, size, quantity)
      VALUES (?, ?, ?, ?)
      `,
      [req.session.user.id, productId, size, quantity]
    );

    res.status(201).json({
      message: 'Product added to cart',
      cartItemId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const [result] = await db.query(
      `
      DELETE FROM cart_items
      WHERE id = ? AND user_id = ?
      `,
      [req.params.id, req.session.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

module.exports = router;