const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { isAuthenticated } = require('../../middleware/authMiddleware');

// GET /api/orders
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const [orders] = await db.query(
      `
      SELECT
        id,
        customer_email,
        customer_name,
        customer_address,
        payment_method,
        delivery_method,
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

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const [orders] = await db.query(
      `
      SELECT
        id,
        customer_email,
        customer_name,
        customer_address,
        payment_method,
        delivery_method,
        delivery_price,
        total_price,
        status,
        created_at
      FROM orders
      WHERE id = ? AND user_id = ?
      `,
      [req.params.id, req.session.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [items] = await db.query(
      `
      SELECT
        oi.id,
        oi.product_id,
        p.name AS product_name,
        p.image_url,
        oi.size,
        oi.quantity,
        oi.unit_price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      `,
      [req.params.id]
    );

    res.json({
      ...orders[0],
      items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;