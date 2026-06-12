const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        c.name AS category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        c.name AS category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [sizes] = await db.query(
      `
      SELECT size, available
      FROM product_sizes
      WHERE product_id = ?
      `,
      [req.params.id]
    );

    res.json({
      ...products[0],
      sizes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;