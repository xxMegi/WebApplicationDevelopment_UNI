const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', { title: 'Rejestracja', error: null });
});

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.render('register', {
        title: 'Rejestracja',
        error: 'Konto z tym adresem e-mail już istnieje.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?)
      `,
      [email, passwordHash, firstName, lastName]
    );

    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Logowanie', error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.render('login', {
        title: 'Logowanie',
        error: 'Nieprawidłowy e-mail lub hasło.'
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.render('login', {
        title: 'Logowanie',
        error: 'Nieprawidłowy e-mail lub hasło.'
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };

    res.redirect('/shop');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/shop');
  });
});

module.exports = router;