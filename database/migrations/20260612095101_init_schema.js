exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.enu('role', ['customer', 'admin']).notNullable().defaultTo('customer');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
  });

  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table
      .integer('category_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('categories');
    table.string('name', 150).notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.string('image_url', 255).notNullable();
    table.integer('stock').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('product_sizes', (table) => {
    table.increments('id').primary();
    table
      .integer('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.string('size', 10).notNullable();
    table.boolean('available').notNullable().defaultTo(true);
    table.unique(['product_id', 'size']);
  });

  await knex.schema.createTable('cart_items', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('session_id', 255);
    table
      .integer('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.string('size', 10).notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('customer_email', 255).notNullable();
    table.string('customer_name', 255).notNullable();
    table.string('customer_address', 500).notNullable();
    table.string('payment_method', 100).notNullable();
    table.string('delivery_method', 100).notNullable();
    table.decimal('delivery_price', 10, 2).notNullable().defaultTo(0);
    table.decimal('total_price', 10, 2).notNullable();
    table.enu('status', ['new', 'paid', 'shipped', 'cancelled']).notNullable().defaultTo('new');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table
      .integer('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table
      .integer('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products');
    table.string('size', 10).notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
  });

  await knex.schema.createTable('blog_posts', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.text('content').notNullable();
    table.string('image_url', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('blog_posts');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('cart_items');
  await knex.schema.dropTableIfExists('product_sizes');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
};