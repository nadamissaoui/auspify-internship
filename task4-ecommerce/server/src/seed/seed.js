const products = [
  { name: "Ordinateur Portable Pro 15", description: "PC portable 15 pouces, 16 Go RAM, SSD 512 Go, idéal pour le développement.", price: 2490.0, category: "Informatique", image: "", stock: 12, rating: 4.7, featured: true },
  { name: "Souris Sans Fil Ergo", description: "Souris ergonomique sans fil avec molette silencieuse.", price: 89.0, category: "Accessoires", image: "", stock: 45, rating: 4.5, featured: false },
  { name: "Clavier Mécanique RGB", description: "Clavier mécanique rétroéclairé, switches bleus.", price: 320.0, category: "Accessoires", image: "", stock: 20, rating: 4.8, featured: true },
  { name: "Casque Audio Bluetooth", description: "Casque sans fil avec réduction de bruit active.", price: 450.0, category: "Audio", image: "", stock: 18, rating: 4.6, featured: true },
  { name: "Écran 27\" 144Hz", description: "Moniteur IPS 27 pouces, 144 Hz, résolution QHD.", price: 1290.0, category: "Informatique", image: "", stock: 8, rating: 4.9, featured: false },
  { name: "Smartphone Flagship 5G", description: "Écran AMOLED 6.7\", 256 Go, triple caméra.", price: 3290.0, category: "Téléphonie", image: "", stock: 15, rating: 4.7, featured: true },
  { name: "Montre Connectée Sport", description: "Suivi d'activité, GPS, étanche 5 ATM.", price: 690.0, category: "Wearables", image: "", stock: 25, rating: 4.4, featured: false },
  { name: "Enceinte Bluetooth Portable", description: "Enceinte étanche, autonomie 20h, son puissant.", price: 210.0, category: "Audio", image: "", stock: 30, rating: 4.3, featured: false },
  { name: "Disque SSD Externe 1To", description: "SSD portable USB-C, lecture jusqu'à 1050 Mo/s.", price: 540.0, category: "Informatique", image: "", stock: 22, rating: 4.8, featured: false },
  { name: "Hub USB-C 7-en-1", description: "Hub multiport HDMI, USB 3.0, lecteur SD.", price: 150.0, category: "Accessoires", image: "", stock: 40, rating: 4.2, featured: false },
  { name: "Tablette Graphique Pro", description: "Tablette de dessin numérique, 8192 niveaux de pression.", price: 780.0, category: "Création", image: "", stock: 10, rating: 4.6, featured: false },
  { name: "Webcam Full HD 1080p", description: "Webcam avec micro intégré et autofocus.", price: 230.0, category: "Accessoires", image: "", stock: 35, rating: 4.1, featured: false },
];

async function seedIfEmpty() {
  const Product = require("../models/Product");
  const count = await Product.countDocuments();
  if (count > 0) return { inserted: 0 };

  const created = await Product.insertMany(products);

  const User = require("../models/User");
  const bcrypt = require("bcryptjs");
  const adminExists = await User.findOne({ email: "admin@auspify.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin Auspify",
      email: "admin@auspify.com",
      password: await bcrypt.hash("admin123", 12),
      role: "admin",
    });
  }

  return { inserted: created.length };
}

module.exports = { seedIfEmpty, products };
