exports.seed = async function (knex) {
  const existingProducts = await knex('products').count('id as count').first();

  if (Number(existingProducts.count) > 0) {
    return;
  }

  await knex('categories').insert([
    { id: 1, name: 'Bluzy' },
    { id: 2, name: 'Sukienki' },
    { id: 3, name: 'Spodnie' },
    { id: 4, name: 'Koszule' },
    { id: 5, name: 'Marynarki' },
    { id: 6, name: 'Spódnice' },
    { id: 7, name: 'Swetry' },
    { id: 8, name: 'T-shirty' }
  ]);

  await knex('products').insert([
    { id: 1, category_id: 1, name: 'Casualowa bluza', description: 'Wygodna bluza na co dzień, idealna do miejskich stylizacji.', price: 129.99, image_url: '/images/bluza.jpg', stock: 20 },
    { id: 2, category_id: 2, name: 'Elegancka sukienka', description: 'Sukienka na specjalne okazje i wieczorne wyjścia.', price: 189.99, image_url: '/images/dress.jpg', stock: 12 },
    { id: 3, category_id: 3, name: 'Spodnie garniturowe', description: 'Klasyczne spodnie do stylizacji biurowych i eleganckich.', price: 159.99, image_url: '/images/garniturowe.jpg', stock: 15 },
    { id: 4, category_id: 3, name: 'Jeansy straight fit', description: 'Uniwersalne jeansy pasujące do codziennych zestawów.', price: 149.99, image_url: '/images/jeans.jpg', stock: 18 },
    { id: 5, category_id: 4, name: 'Biała koszula', description: 'Minimalistyczna koszula jako baza garderoby kapsułowej.', price: 119.99, image_url: '/images/koszula.jpg', stock: 16 },
    { id: 6, category_id: 5, name: 'Oversize marynarka', description: 'Marynarka w luźnym kroju do stylizacji smart casual.', price: 229.99, image_url: '/images/marynarka.jpg', stock: 10 },
    { id: 7, category_id: 6, name: 'Satynowa spódnica', description: 'Lekka spódnica midi do kobiecych stylizacji.', price: 139.99, image_url: '/images/spodnica.jpg', stock: 14 },
    { id: 8, category_id: 7, name: 'Miękki sweter', description: 'Ciepły sweter na sezon jesienno-zimowy.', price: 169.99, image_url: '/images/sweter.jpg', stock: 11 },
    { id: 9, category_id: 8, name: 'Basic T-shirt', description: 'Prosty T-shirt jako baza codziennych stylizacji.', price: 69.99, image_url: '/images/tshirt.jpg', stock: 30 }
  ]);

  const sizes = ['XS', 'S', 'M', 'L'];
  const productSizes = [];

  for (let productId = 1; productId <= 9; productId++) {
    for (const size of sizes) {
      productSizes.push({
        product_id: productId,
        size,
        available: true
      });
    }
  }

  await knex('product_sizes').insert(productSizes);

  await knex('blog_posts').insert([
    {
      id: 1,
      title: 'Jak zbudować garderobę kapsułową?',
      slug: 'garderoba-kapsulowa',
      content: 'Garderoba kapsułowa opiera się na uniwersalnych elementach, które można łatwo łączyć w wiele stylizacji.',
      image_url: '/images/koszula.jpg'
    },
    {
      id: 2,
      title: 'Smart casual w praktyce',
      slug: 'smart-casual',
      content: 'Smart casual pozwala łączyć wygodę z elegancją, dlatego świetnie sprawdza się w pracy i na spotkaniach.',
      image_url: '/images/marynarka.jpg'
    }
  ]);
};