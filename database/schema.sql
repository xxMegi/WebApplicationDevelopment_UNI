CREATE DATABASE IF NOT EXISTS fashion_beauty
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fashion_beauty;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS blog_posts;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       first_name VARCHAR(100),
                       last_name VARCHAR(100),
                       role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          category_id INT NOT NULL,
                          name VARCHAR(150) NOT NULL,
                          description TEXT,
                          price DECIMAL(10,2) NOT NULL,
                          image_url VARCHAR(255) NOT NULL,
                          stock INT NOT NULL DEFAULT 0,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE product_sizes (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               product_id INT NOT NULL,
                               size VARCHAR(10) NOT NULL,
                               available BOOLEAN NOT NULL DEFAULT TRUE,
                               FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                               UNIQUE (product_id, size)
);

CREATE TABLE cart_items (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id INT,
                            session_id VARCHAR(255),
                            product_id INT NOT NULL,
                            size VARCHAR(10) NOT NULL,
                            quantity INT NOT NULL DEFAULT 1,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT,
                        customer_email VARCHAR(255) NOT NULL,
                        customer_name VARCHAR(255) NOT NULL,
                        customer_address VARCHAR(500) NOT NULL,
                        payment_method VARCHAR(100) NOT NULL,
                        delivery_method VARCHAR(100) NOT NULL,
                        delivery_price DECIMAL(10,2) NOT NULL DEFAULT 0,
                        total_price DECIMAL(10,2) NOT NULL,
                        status ENUM('new', 'paid', 'shipped', 'cancelled') NOT NULL DEFAULT 'new',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             order_id INT NOT NULL,
                             product_id INT NOT NULL,
                             size VARCHAR(10) NOT NULL,
                             quantity INT NOT NULL DEFAULT 1,
                             unit_price DECIMAL(10,2) NOT NULL,
                             FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                             FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE blog_posts (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            title VARCHAR(200) NOT NULL,
                            slug VARCHAR(220) NOT NULL UNIQUE,
                            content TEXT NOT NULL,
                            image_url VARCHAR(255),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name) VALUES
                                  ('Bluzy'),
                                  ('Sukienki'),
                                  ('Spodnie'),
                                  ('Koszule'),
                                  ('Marynarki'),
                                  ('Spódnice'),
                                  ('Swetry'),
                                  ('T-shirty');

INSERT INTO products (category_id, name, description, price, image_url, stock) VALUES
                                                                                   (1, 'Casualowa bluza', 'Wygodna bluza na co dzień, idealna do miejskich stylizacji.', 129.99, '/images/bluza.jpg', 20),
                                                                                   (2, 'Elegancka sukienka', 'Sukienka na specjalne okazje i wieczorne wyjścia.', 189.99, '/images/dress.jpg', 12),
                                                                                   (3, 'Spodnie garniturowe', 'Klasyczne spodnie do stylizacji biurowych i eleganckich.', 159.99, '/images/garniturowe.jpg', 15),
                                                                                   (3, 'Jeansy straight fit', 'Uniwersalne jeansy pasujące do codziennych zestawów.', 149.99, '/images/jeans.jpg', 18),
                                                                                   (4, 'Biała koszula', 'Minimalistyczna koszula jako baza garderoby kapsułowej.', 119.99, '/images/koszula.jpg', 16),
                                                                                   (5, 'Oversize marynarka', 'Marynarka w luźnym kroju do stylizacji smart casual.', 229.99, '/images/marynarka.jpg', 10),
                                                                                   (6, 'Satynowa spódnica', 'Lekka spódnica midi do kobiecych stylizacji.', 139.99, '/images/spodnica.jpg', 14),
                                                                                   (7, 'Miękki sweter', 'Ciepły sweter na sezon jesienno-zimowy.', 169.99, '/images/sweter.jpg', 11),
                                                                                   (8, 'Basic T-shirt', 'Prosty T-shirt jako baza codziennych stylizacji.', 69.99, '/images/tshirt.jpg', 30);

INSERT INTO product_sizes (product_id, size, available)
SELECT id, 'XS', TRUE FROM products
UNION ALL SELECT id, 'S', TRUE FROM products
UNION ALL SELECT id, 'M', TRUE FROM products
UNION ALL SELECT id, 'L', TRUE FROM products;

INSERT INTO blog_posts (title, slug, content, image_url) VALUES
                                                             ('Jak zbudować garderobę kapsułową?', 'garderoba-kapsulowa', 'Garderoba kapsułowa opiera się na uniwersalnych elementach, które można łatwo łączyć w wiele stylizacji.', '/images/koszula.jpg'),
                                                             ('Smart casual w praktyce', 'smart-casual', 'Smart casual pozwala łączyć wygodę z elegancją, dlatego świetnie sprawdza się w pracy i na spotkaniach.', '/images/marynarka.jpg');