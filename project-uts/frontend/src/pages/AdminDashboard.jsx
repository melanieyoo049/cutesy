import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Plus, Trash2, Edit3, CheckCircle, RotateCcw, BookOpen, Users, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'borrowings'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Teknologi & Pemrograman',
    stock: 1,
    cover_url: '',
    description: '',
  });

  const { token } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, lRes, cRes] = await Promise.all([
        api.getBooks(),
        api.getAllBorrowings(token),
        api.getCategories(),
      ]);
      if (bRes.success) setBooks(bRes.data);
      if (lRes.success) setBorrowings(lRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      category: 'Teknologi & Pemrograman',
      stock: 1,
      cover_url: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      stock: book.stock,
      cover_url: book.cover_url || '',
      description: book.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        const res = await api.updateBook(token, editingBook.id, formData);
        if (res.success) {
          setMessage({ type: 'success', text: 'Data buku berhasil diperbarui.' });
          setModalOpen(false);
          loadData();
        } else {
          setMessage({ type: 'error', text: res.message });
        }
      } else {
        const res = await api.createBook(token, formData);
        if (res.success) {
          setMessage({ type: 'success', text: 'Buku baru berhasil ditambahkan.' });
          setModalOpen(false);
          loadData();
        } else {
          setMessage({ type: 'error', text: res.message });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal memproses data buku.' });
    }
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('Yakin ingin menghapus buku ini?')) return;
    try {
      const res = await api.deleteBook(token, id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Buku berhasil dihapus..' });
        loadData();
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus buku.' });
    }
  };

  const handleReturnBook = async (borrowId) => {
    try {
      const res = await api.returnBook(token, borrowId);
      if (res.success) {
        setMessage({ type: 'success', text: 'Pengembalian buku berhasil dikonfirmasi. Stok bertambah.' });
        loadData();
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengonfirmasi pengembalian buku.' });
    }
  };

  const activeBorrowCount = borrowings.filter((b) => b.status === 'borrowed').length;
  const totalStockCount = books.reduce((acc, b) => acc + (b.stock || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel Manajemen Administrator
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pusat Kendali Perpustakaan
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition duration-150 active:scale-[0.96] w-fit"
        >
          <Plus className="w-4 h-4" />
          Tambah Buku Baru
        </button>
      </div>

      {/* Ringkasan Metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium">Total Judul Buku</p>
          <p className="text-2xl font-bold text-white font-mono mt-1">{books.length}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium">Buku Sedang Dipinjam</p>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{activeBorrowCount}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium">Total Stok Tersedia</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{totalStockCount}</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-[11px] opacity-75 hover:opacity-100 font-bold px-2"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Switcher Tab */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition duration-150 ${
            activeTab === 'books'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Daftar Buku ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('borrowings')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition duration-150 ${
            activeTab === 'borrowings'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Riwayat & Transaksi Peminjaman ({borrowings.length})
        </button>
      </div>

      {/* Konten Tab 1: Manajemen Buku */}
      {activeTab === 'books' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Buku</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Stok</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-slate-800 rounded overflow-hidden shrink-0 border border-slate-700">
                          {b.cover_url ? (
                            <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{b.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{b.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          b.stock > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {b.stock} unit
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition duration-150 active:scale-[0.96]"
                          title="Edit Buku"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition duration-150 active:scale-[0.96]"
                          title="Hapus Buku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Konten Tab 2: Transaksi Peminjaman */}
      {activeTab === 'borrowings' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Peminjam</th>
                  <th className="px-4 py-3 font-semibold">Judul Buku</th>
                  <th className="px-4 py-3 font-semibold">Tgl Pinjam</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {borrowings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{item.user_name}</p>
                      <p className="text-[11px] text-slate-400">{item.user_email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">{item.book_title}</td>
                    <td className="px-4 py-3 text-slate-400">{item.borrow_date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'borrowed'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {item.status === 'borrowed' ? 'Sedang Dipinjam' : 'Dikembalikan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'borrowed' ? (
                        <button
                          onClick={() => handleReturnBook(item.id)}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition duration-150 active:scale-[0.96]"
                        >
                          Konfirmasi Kembali
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Buku */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingBook ? 'Edit Data Buku' : 'Tambah Buku Baru'}
            </h2>

            <form onSubmit={handleSubmitBook} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Buku</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Clean Architecture"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Penulis</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Robert C. Martin"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kategori Buku
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Pilih saran atau ketik kategori baru
                  </span>
                </div>
                <input
                  type="text"
                  list="category-options"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ketik kategori baru atau pilih dari daftar..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <datalist id="category-options">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>

                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">
                      Kategori Tersedia:
                    </span>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition duration-150 active:scale-[0.96] ${
                          formData.category === cat
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL Gambar Sampul (Opsional)</label>
                <input
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan singkat mengenai isi buku..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-white transition duration-150 active:scale-[0.96]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition duration-150 active:scale-[0.96]"
                >
                  {editingBook ? 'Simpan Perubahan' : 'Tambahkan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
