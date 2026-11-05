require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/config/database');
const { seedInitialData } = require('./src/config/seed');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const borrowRoutes = require('./src/routes/borrowRoutes');
const productRoutes = require('./src/routes/productRoutes');
const testRoutes = require('./src/routes/test');

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Root Endpoint */
app.get('/', (req, res) => {
  res.json({
    message: 'Perpustakaan API is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registrasi pengunjung baru',
        'POST /api/auth/login': 'Masuk akun (Admin / Pengunjung)',
        'GET /api/auth/me': 'Cek profil login saat ini'
      },
      books: {
        'GET /api/books': 'Katalog buku (Filter: search, category)',
        'GET /api/books/:id': 'Detail buku',
        'POST /api/books': 'Tambah buku (Admin only)',
        'PUT /api/books/:id': 'Perbarui buku (Admin only)',
        'DELETE /api/books/:id': 'Hapus buku (Admin only)'
      },
      borrowings: {
        'POST /api/borrowings': 'Pinjam buku (Member only)',
        'GET /api/borrowings/my': 'Daftar pinjaman saya (Member only)',
        'GET /api/borrowings': 'Semua transaksi pinjaman (Admin only)',
        'PUT /api/borrowings/:id/return': 'Konfirmasi pengembalian buku (Admin only)'
      }
    }
  });
});

/* Register Routes */
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowRoutes);
app.use('/api/products', productRoutes);
app.use('/api/test', testRoutes);

/* 404 Handler */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

/* Start Server */
(async () => {
  try {
    await initializeDatabase();
    await seedInitialData();
    app.listen(PORT, () => {
      console.log(`🚀 Perpustakaan API Server aktif di: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Gagal menginisialisasi server:', err.message);
  }
})();
