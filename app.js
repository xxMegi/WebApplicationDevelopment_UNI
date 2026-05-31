const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for forms, JSON and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/shop');
});

app.use('/auth', authRoutes);
app.use('/shop', shopRoutes);

// 404
app.use((req, res) => {
  res.status(404).send('Nie znaleziono strony');
});

app.listen(PORT, () => {
  console.log(`Aplikacja działa na http://localhost:${PORT}`);
});