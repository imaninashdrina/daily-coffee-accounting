-- 1. Tabel Bahan Baku (Raw Materials)
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock_qty NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Menu Produk
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Bill of Materials (Resep / Material Flow)
CREATE TABLE recipe_boms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    qty_required NUMERIC(10,2) NOT NULL
);

-- 4. Tabel Transaksi Penjualan
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    qty_sold INT NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    total_hpp NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Jurnal Umum Akuntansi
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT NOT NULL,
    account_debit VARCHAR(100) NOT NULL,
    account_credit VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL
);

-- Insert Bahan Baku
INSERT INTO raw_materials (code, name, unit, stock_qty, unit_cost) VALUES
('MAT-01', 'Biji Kopi Arabika', 'gram', 2000, 250),
('MAT-02', 'Susu UHT Fresh', 'ml', 5000, 20),
('MAT-03', 'Paper Cup 16oz', 'pcs', 200, 1500);

-- Insert Produk Menu
INSERT INTO products (name, price) VALUES
('Caffe Latte 16oz', 28000),
('Espresso Single', 18000);

-- Insert Resep BOM (Material Flow)
INSERT INTO recipe_boms (product_id, material_id, qty_required)
SELECT p.id, m.id, 18 FROM products p, raw_materials m WHERE p.name = 'Caffe Latte 16oz' AND m.code = 'MAT-01';

INSERT INTO recipe_boms (product_id, material_id, qty_required)
SELECT p.id, m.id, 200 FROM products p, raw_materials m WHERE p.name = 'Caffe Latte 16oz' AND m.code = 'MAT-02';

INSERT INTO recipe_boms (product_id, material_id, qty_required)
SELECT p.id, m.id, 1 FROM products p, raw_materials m WHERE p.name = 'Caffe Latte 16oz' AND m.code = 'MAT-03';

apakah seperti ini
