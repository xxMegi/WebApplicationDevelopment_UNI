//IMPORTOWANIE MODUŁÓW
const express = require('express');
const session = require('express-session'); // Import middleware sesji
const bodyParser = require('body-parser');
const path = require('path');
const shopRoutes = require('./routes/shop');
const app = express();
// Połączenie z bazą danych
const db = require('./db');

//USTAWIENIE SCIEŻEK I WIDOKÓW
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware body-parser do obsługi danych z formularzy
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware dla plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

//KONFIGURACJA SESJI
app.use(
    session({
        secret: 'tajny_klucz', // Klucz używany do szyfrowania sesji
        resave: false, // Nie zapisuj sesji ponownie, jeśli nie było zmian
        saveUninitialized: false, // Nie zapisuj pustych sesji
        cookie: { secure: false } // Ustaw "secure: true" tylko przy HTTPS
    })
);

//TRASY
app.use('/shop', shopRoutes);

// Obsługa błędu 404
app.use((req, res) => {
    res.status(404).send('Nie znaleziono strony');
});

// Uruchomienie serwera
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Aplikacja działa na http://localhost:${PORT}`);
});