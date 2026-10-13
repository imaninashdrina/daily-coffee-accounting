# ☕ Daily Coffee Accounting

**Aplikasi Akuntansi dan Pengelolaan Persediaan Daily Coffee**

## 1. Deskripsi Proyek

Daily Coffee Accounting merupakan aplikasi berbasis web yang dirancang untuk membantu proses pencatatan transaksi dan pengelolaan persediaan bahan baku pada usaha kedai kopi. Aplikasi ini menggunakan Supabase sebagai database untuk menyimpan data bahan baku, menu produk, transaksi penjualan, serta jurnal umum akuntansi.

Aplikasi ini dikembangkan untuk membantu proses pencatatan akuntansi menjadi lebih terstruktur, mempermudah pemantauan stok bahan baku, serta menyajikan informasi penjualan dan laba kotor.

**Link aplikasi:** https://imaninashdrina.github.io/daily-coffee-accounting/

**Link repository GitHub:** https://github.com/imaninashdrina/daily-coffee-accounting

## 2. Identitas Pengembang

| Keterangan | Informasi |
|---|---|
| Nama Mahasiswa | [Imanina Nur Shadrina] |
| NIM | [12030124140230] |
| Kelas | [D] |
| Mata Kuliah | [Pengkodean dan Pemograman] |
| Dosen Pengampu | [Dr. Totok Dewayanto, S.E., M.Si., Akt.] |

## 3. Fitur Aplikasi

### A. Dashboard

- Menampilkan informasi persediaan bahan baku.
- Menghitung nilai aset persediaan.
- Menampilkan total penjualan dan laba kotor.
- Memberikan informasi bahan baku dengan stok rendah.
- Menampilkan transaksi penjualan terbaru.

### B. Pembelian Bahan Baku

- Mengambil data bahan baku dari database.
- Mencatat penambahan persediaan bahan baku.
- Memperbarui jumlah stok dan biaya per unit menggunakan metode rata-rata bergerak (*moving average*).
- Mencatat jurnal pembelian persediaan bahan baku.

### C. Penjualan Produk

- Mengambil data menu produk dan resep bahan baku.
- Memeriksa ketersediaan bahan baku sebelum penjualan diproses.
- Mengurangi stok berdasarkan kebutuhan bahan baku dalam resep.
- Menghitung total penjualan dan Harga Pokok Penjualan (HPP).
- Mencatat jurnal penjualan dan jurnal HPP.

### D. Persediaan

- Menampilkan data bahan baku.
- Menyajikan informasi jumlah stok, satuan, dan biaya per unit.
- Membantu memantau ketersediaan bahan baku.

### E. Jurnal Umum

- Menyimpan tanggal transaksi dan deskripsi transaksi.
- Mencatat akun debit dan akun kredit.
- Menyimpan nominal transaksi untuk dokumentasi akuntansi.

## 4. Teknologi yang Digunakan

- **HTML5** — membangun struktur halaman web.
- **CSS3** — mengatur tampilan dan tata letak aplikasi.
- **JavaScript** — menjalankan logika aplikasi dan pengolahan transaksi.
- **Supabase** — menyediakan database PostgreSQL dan akses data melalui Supabase JavaScript Client.
- **Font Awesome** — menyediakan ikon antarmuka.
- **GitHub** — menyimpan source code proyek.
- **GitHub Pages** — mempublikasikan aplikasi web.

## 5. Struktur Repository

```text
daily-coffee-accounting/
├── app.js
├── index.html
├── jurnal.html
├── pembelian.html
├── penjualan.html
├── persediaan.html
├── style.css
├── logo.jpeg
└── README.md
```

Keterangan:

- `index.html`: halaman dashboard aplikasi.
- `jurnal.html`: halaman jurnal umum.
- `pembelian.html`: halaman pembelian bahan baku.
- `penjualan.html`: halaman transaksi penjualan.
- `persediaan.html`: halaman persediaan bahan baku.
- `app.js`: logika aplikasi dan integrasi database Supabase.
- `style.css`: pengaturan tampilan aplikasi.
- `logo.jpeg`: gambar logo Daily Coffee.
- `README.md`: dokumentasi proyek.

## 6. Database Supabase

Aplikasi menggunakan Supabase untuk menyimpan dan mengambil data transaksi serta persediaan.

### A. Tabel `raw_materials`

Digunakan untuk menyimpan informasi bahan baku.

Kolom utama:
- `id`: identitas bahan baku.
- `code`: kode bahan baku.
- `name`: nama bahan baku.
- `unit`: satuan bahan baku.
- `stock_qty`: jumlah persediaan.
- `unit_cost`: biaya per satuan.
- `created_at`: waktu pembuatan data.

### B. Tabel `products`

Digunakan untuk menyimpan informasi menu produk.

Kolom utama:
- `id`: identitas produk.
- `name`: nama produk.
- `price`: harga jual.
- `created_at`: waktu pembuatan data.

### C. Tabel `recipe_boms`

Digunakan untuk menyimpan resep atau komposisi bahan baku yang diperlukan untuk membuat produk.

Kolom utama:
- `id`: identitas resep.
- `product_id`: referensi produk.
- `material_id`: referensi bahan baku.
- `qty_required`: jumlah bahan baku yang dibutuhkan.

### D. Tabel `sales`

Digunakan untuk menyimpan transaksi penjualan.

Kolom utama:
- `id`: identitas transaksi.
- `product_id`: referensi produk.
- `qty_sold`: jumlah produk terjual.
- `total_price`: total harga penjualan.
- `total_hpp`: total harga pokok penjualan.
- `created_at`: waktu transaksi.

### E. Tabel `journal_entries`

Digunakan untuk menyimpan jurnal umum akuntansi.

Kolom utama:
- `id`: identitas jurnal.
- `entry_date`: tanggal pencatatan.
- `description`: keterangan transaksi.
- `account_debit`: akun debit.
- `account_credit`: akun kredit.
- `amount`: nominal transaksi.

### F. Tabel `public.expense`

Tabel ini tersedia pada Supabase untuk data beban atau pengeluaran. Berdasarkan kondisi database yang diperiksa, tabel tersebut masih kosong. Penggunaan tabel ini dalam fitur laporan perlu disesuaikan dengan nama tabel dan kolom yang dipanggil oleh kode aplikasi.

## 7. Alur dan Logika Akuntansi

### A. Pembelian Bahan Baku

Pembelian menambah jumlah stok bahan baku. Sistem menghitung biaya rata-rata baru berdasarkan nilai persediaan sebelumnya dan biaya pembelian.

**Rumus biaya rata-rata:**

Biaya rata-rata baru = (Nilai persediaan lama + Nilai pembelian) / (Jumlah stok lama + Jumlah stok yang dibeli)

Pencatatan jurnal yang digunakan:

| Akun Debit | Akun Kredit |
|---|---|
| Persediaan Bahan Baku | Kas |

### B. Penjualan Produk

Ketika penjualan dilakukan, sistem mengambil resep produk untuk menghitung kebutuhan bahan baku dan memeriksa ketersediaan stok. Jika stok mencukupi, sistem mengurangi stok sesuai resep dan mencatat transaksi penjualan.

### C. Perhitungan Penjualan dan HPP

Total penjualan dihitung berdasarkan harga jual produk dikalikan jumlah produk yang terjual.

HPP dihitung berdasarkan biaya bahan baku yang digunakan dalam resep produk dikalikan jumlah produk yang terjual, sesuai perhitungan dalam aplikasi.

**Rumus laba kotor:**

Laba Kotor = Total Penjualan − Total HPP

### D. Pencatatan Jurnal Penjualan

| Akun Debit | Akun Kredit |
|---|---|
| Kas | Pendapatan Penjualan |

### E. Pencatatan Jurnal HPP

| Akun Debit | Akun Kredit |
|---|---|
| Beban HPP | Persediaan Bahan Baku |

## 8. Data Awal Bahan Baku dan Produk

Database awal menyediakan contoh data berikut.

### Bahan Baku

| Kode | Nama Bahan Baku | Satuan | Stok Awal | Biaya per Satuan |
|---|---|---|---:|---:|
| MAT-01 | Biji Kopi Arabika | gram | 2.000 | Rp250 |
| MAT-02 | Susu UHT Fresh | ml | 5.000 | Rp20 |
| MAT-03 | Paper Cup 16oz | pcs | 200 | Rp1.500 |

### Menu Produk

| Nama Produk | Harga Jual |
|---|---:|
| Caffe Latte 16oz | Rp28.000 |
| Espresso Single | Rp18.000 |

Resep awal yang tersedia pada SQL mencakup Caffe Latte 16oz, dengan kebutuhan 18 gram biji kopi Arabika, 200 ml susu UHT Fresh, dan 1 buah Paper Cup 16oz. Resep Espresso Single perlu ditambahkan jika menu tersebut akan diproses melalui fitur penjualan berbasis resep.

## 9. Cara Menjalankan Aplikasi

1. Buka repository GitHub Daily Coffee Accounting.
2. Unduh atau salin seluruh source code.
3. Pastikan project Supabase sudah dibuat dan tabel yang diperlukan tersedia.
4. Sesuaikan konfigurasi koneksi Supabase pada `app.js` jika menggunakan project database yang berbeda.
5. Jalankan `index.html` melalui browser atau server lokal.
6. Buka halaman dashboard untuk melihat informasi persediaan dan penjualan.
7. Gunakan halaman pembelian, penjualan, persediaan, dan jurnal sesuai fungsi masing-masing.

Aplikasi yang telah dipublikasikan juga dapat diakses melalui GitHub Pages:

https://imaninashdrina.github.io/daily-coffee-accounting/

## 10. Pengujian Aplikasi

Pengujian dapat dilakukan melalui beberapa skenario berikut:

1. Memastikan dashboard dapat menampilkan data persediaan dan penjualan.
2. Memastikan pembelian menambah stok bahan baku dan memperbarui biaya rata-rata.
3. Memastikan penjualan berhasil jika stok bahan baku mencukupi.
4. Memastikan penjualan ditolak jika stok bahan baku tidak mencukupi.
5. Memastikan stok bahan baku berkurang berdasarkan resep produk.
6. Memastikan transaksi menghasilkan jurnal penjualan dan jurnal HPP.
7. Memastikan halaman jurnal menampilkan pencatatan yang tersimpan di database.

Hasil pengujian harus disesuaikan dengan hasil aktual ketika setiap skenario dijalankan.

## 11. Catatan Pengembangan

- Struktur tabel dan nama kolom pada dokumentasi mengikuti SQL database yang tersedia.
- Tabel `public.expense` masih kosong sehingga data beban belum dapat ditampilkan dari tabel tersebut sebelum tersedia transaksi.
- Nama tabel beban pada kode aplikasi dan Supabase perlu dipastikan konsisten.
- Operasi pembelian dan penjualan yang melibatkan beberapa perubahan database perlu dilindungi dengan transaksi database atau fungsi server agar konsistensi stok dan jurnal tetap terjaga jika terjadi kegagalan.
- Akses database perlu dilindungi menggunakan kebijakan keamanan Supabase yang sesuai.
- Dokumentasi ini menjelaskan fitur dan logika yang terdapat dalam proyek, bukan menyatakan bahwa aplikasi telah memenuhi seluruh standar akuntansi atau audit.

## 12. Kesimpulan

Daily Coffee Accounting merupakan aplikasi berbasis web untuk membantu pengelolaan persediaan bahan baku, transaksi penjualan, perhitungan HPP, dan pencatatan jurnal umum pada usaha kedai kopi. Integrasi dengan Supabase memungkinkan data aplikasi disimpan dan diakses melalui database terpusat.

Proyek ini menjadi penerapan teknologi web dalam mendukung proses administrasi dan pencatatan akuntansi usaha secara lebih terstruktur.
