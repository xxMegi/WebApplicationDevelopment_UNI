# Fashion & Beauty Shop

## Project Description

Fashion & Beauty Shop is a web application developed as part of the Web Application Development course.

The application allows users to browse products, create an account, log in, manage a shopping cart, and place orders. The project follows a classic e-commerce architecture based on a relational database and exposes a REST API for selected resources.

## Project Overview

Fashion & Beauty is a web application combining a fashion blog with a simple e-commerce platform.

The application allows users to:

- browse current fashion trends and styling inspirations,
- explore ready-to-use outfit ideas and clothing recommendations,
- browse products available in the online store,
- create an account and log in,
- add products to a shopping cart,
- place orders,
- view their order history.

---

## Technologies

### Backend

* Node.js
* Express.js
* Express Session
* MySQL
* Knex
* bcrypt

### Frontend

* EJS
* Bootstrap 5
* CSS

### Infrastructure

* Docker
* Docker Compose

---

## Main Features

### User Authentication

* User registration
* User login
* Password hashing with bcrypt
* Session-based authentication
* Protected routes

### Product Catalogue

* Product listing
* Product details
* Product images
* Product sizes

### Shopping Cart

* Add products to cart
* Remove products from cart
* View cart contents

### Orders

* Checkout process
* Order summary
* Order creation
* Order history

---
## Architecture

The application follows a modular monolithic architecture.

The system is implemented as a single Express.js application, but its functionality is separated into dedicated modules:

- routes
- middleware
- database
- configuration
- views

This approach keeps the project simple while maintaining a clear separation of responsibilities.

The repository follows a monorepo structure, where the backend, frontend templates, database migrations, seeds, Docker configuration, and documentation are stored in a single repository.

## Architecture Overview

The application follows a layered architecture:

```text
Client (Browser)
       │
       ▼
Express.js Routes
       │
       ▼
Business Logic
       │
       ▼
MySQL Database
```

The frontend communicates with the backend through Express routes and REST API endpoints.

The backend stores all persistent data in a MySQL relational database.

---

## Database

The application uses a MySQL relational database.

Database schema is managed using **Knex migrations**, while initial application data is provided through **Knex seeds**.

### Main Entities

* Users
* Categories
* Products
* Product Sizes
* Cart Items
* Orders
* Order Items

### Relationships

* Category → Products (1:N)
* Product → Product Sizes (1:N)
* User → Cart Items (1:N)
* User → Orders (1:N)
* Order → Order Items (1:N)
* Product → Order Items (1:N)

Foreign keys are used to ensure data consistency.

---

## REST API

### Products

```http
GET /api/products
GET /api/products/:id
```

Returns product information and available sizes.

### Cart

```http
GET /api/cart
POST /api/cart
DELETE /api/cart/:id
```

Allows authenticated users to manage shopping cart items.

### Orders

```http
GET /api/orders
GET /api/orders/:id
```

Returns orders belonging to the currently authenticated user.

---

## Authentication

The application uses session-based authentication.

Protected resources:

* Shopping cart
* Orders API
* User-specific functionality

Passwords are stored as bcrypt hashes.

---

## Running Locally

### Install dependencies

```bash
npm install
```

### Run database migrations

```bash
npm run migrate
```

### Populate database with initial data

```bash
npm run seed
```

### Start the application

```bash
npm run dev
```

Application URL:

```text
http://localhost:3000
```

---

## Running with Docker

Build and start the complete stack:

```bash
docker compose up --build
```

The application automatically:

* creates the MySQL database,
* runs Knex migrations,
* loads initial seed data,
* starts the Express application.

Application URL:

```text
http://localhost:3000
```

---

## Project Structure

```text
project/
│
├── config/
├── database/
│   ├── migrations/
│   └── seeds/
│
├── middleware/
├── public/
├── routes/
│   ├── api/
│   └── ...
├── views/
│
├── app.js
├── knexfile.js
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── package.json
└── README.md
```

---

## Architectural Decisions

Architectural decisions are documented separately using ADR (Architecture Decision Records).

Main documented decisions:

* Express.js as backend framework
* MySQL as relational database
* Session-based authentication
* REST API architecture
* Docker Compose deployment
