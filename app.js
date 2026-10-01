// 1. Konfigurasi Supabase Client
const SUPABASE_URL = "https://rrynkagsswtvznoetzyi.supabase.co";
const SUPABASE_KEY = "sb_publishable_W0EE3XiiYGIdWTpEdp_UIg_4G_TG2Af";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Element Selectors (Safe null checks)
const buyMaterialSelect = document.getElementById('buy-material-id');
const sellProductSelect = document.getElementById('sell-product-id');
const stockTableBody = document.querySelector('#stock-table tbody');
const journalTableBody = document.querySelector('#journal-table tbody');

// 3. Init Load Data & Mobile Menu Handler
document.addEventListener('DOMContentLoaded', () => {
    // A. Setup Toggle Navigation Sidebar untuk Layar HP
    initMobileNavigation();

    // B. Deteksi Halaman Aktif berdasarkan atribut page-id pada tag <body>
    const pageId = document.body.getAttribute('page-id');

    if (pageId === 'dashboard') {
        loadDashboardMetrics();
    } else if (pageId === 'pembelian') {
        loadMaterialDropdown();
    } else if (pageId === 'penjualan') {
        loadProductDropdown();
    } else if (pageId === 'persediaan') {
        loadStockTable();
    } else if (pageId === 'jurnal') {
        loadJournalTable();
    }
});

// Handler Mobile Navigation (Sidebar Responsif HP)
function initMobileNavigation() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuBtn && sidebar && overlay) {
        // Buka / Tutup Sidebar saat tombol hamburger diklik
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        });

        // Tutup Sidebar saat area di luar menu diklik
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
    }
}

// 4. Function Load Data dari Supabase
async function loadDashboardMetrics() {
    const statMaterials = document.getElementById('stat-total-materials');
    const statAsset = document.getElementById('stat-total-asset');
    const statJournals = document.getElementById('stat-total-journals');

    const { data: materials, error: errMaterials } = await supabaseClient.from('raw_materials').select('*');
    const { data: journals, error: errJournals } = await supabaseClient.from('journal_entries').select('*');

    if (errMaterials) console.error("Error loading materials:", errMaterials);
    if (errJournals) console.error("Error loading journals:", errJournals);

    let totalAsset = 0;
    if (materials) {
        materials.forEach(m => totalAsset += ((m.stock_qty || 0) * (m.unit_cost || 0)));
        if (statMaterials) statMaterials.textContent = materials.length;
        if (statAsset) statAsset.textContent = `Rp ${totalAsset.toLocaleString('id-ID')}`;
    }

    if (journals && statJournals) {
        statJournals.textContent = journals.length;
    }
}

async function loadMaterialDropdown() {
    if (!buyMaterialSelect) return;
    const { data: materials, error } = await supabaseClient.from('raw_materials').select('*');
    
    if (error) {
        console.error("Error loading materials:", error);
        buyMaterialSelect.innerHTML = `<option value="">-- Gagal Memuat Data --</option>`;
        return;
    }

    if (materials && materials.length > 0) {
        buyMaterialSelect.innerHTML = materials.map(m => `<option value="${m.id}">${m.name} (${m.unit})</option>`).join('');
    } else {
        buyMaterialSelect.innerHTML = `<option value="">-- Data Bahan Baku Kosong --</option>`;
    }
}

async function loadProductDropdown() {
    if (!sellProductSelect) return;
    const { data: products, error } = await supabaseClient.from('products').select('*');
    
    if (error) {
        console.error("Error loading products:", error);
        sellProductSelect.innerHTML = `<option value="">-- Gagal Memuat Data --</option>`;
        return;
    }

    if (products && products.length > 0) {
        sellProductSelect.innerHTML = products.map(p => `<option value="${p.id}">${p.name} - Rp${p.price.toLocaleString('id-ID')}</option>`).join('');
    } else {
        sellProductSelect.innerHTML = `<option value="">-- Data Menu Kosong --</option>`;
    }
}

async function loadStockTable() {
    if (!stockTableBody) return;
    const { data: materials, error } = await supabaseClient.from('raw_materials').select('*').order('code');
    
    if (error) {
        console.error("Error loading stock table:", error);
        stockTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Gagal mengambil data persediaan</td></tr>`;
        return;
    }

    if (materials && materials.length > 0) {
        stockTableBody.innerHTML = materials.map(m => {
            const totalValue = (m.stock_qty || 0) * (m.unit_cost || 0);
            return `
                <tr>
                    <td>${m.code}</td>
                    <td>${m.name}</td>
                    <td><strong>${Number(m.stock_qty).toLocaleString('id-ID')}</strong></td>
                    <td>${m.unit}</td>
                    <td>Rp${Number(m.unit_cost).toLocaleString('id-ID')}</td>
                    <td>Rp${totalValue.toLocaleString('id-ID')}</td>
                </tr>
            `;
        }).join('');
    } else {
        stockTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada data persediaan</td></tr>`;
    }
}

async function loadJournalTable() {
    if (!journalTableBody) return;
    const { data: journals, error } = await supabaseClient.from('journal_entries').select('*').order('entry_date', { ascending: false });
    
    if (error) {
        console.error("Error loading journal table:", error);
        journalTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal mengambil data jurnal</td></tr>`;
        return;
    }

    if (journals && journals.length > 0) {
        journalTableBody.innerHTML = journals.map(j => `
            <tr>
                <td>${new Date(j.entry_date).toLocaleString('id-ID')}</td>
                <td>${j.description}</td>
                <td><strong>${j.account_debit}</strong></td>
                <td><strong>${j.account_credit}</strong></td>
                <td>Rp${Number(j.amount).toLocaleString('id-ID')}</td>
            </tr>
        `).join('');
    } else {
        journalTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada transaksi jurnal</td></tr>`;
    }
}

// 5. Event Handler Pembelian Bahan Baku
const buyForm = document.getElementById('buy-material-form');
if (buyForm) {
    buyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const materialId = buyMaterialSelect.value;
        const qtyPurchased = parseFloat(document.getElementById('buy-qty').value);
        const totalCost = parseFloat(document.getElementById('buy-cost').value);

        if (!materialId) {
            alert("Silakan pilih bahan baku terlebih dahulu!");
            return;
        }

        const { data: material, error: errFetch } = await supabaseClient.from('raw_materials').select('*').eq('id', materialId).single();
        if (errFetch || !material) {
            alert("Gagal mengambil data bahan baku!");
            return;
        }

        // Kalkulasi Moving Average Cost
        const currentTotalValue = (material.stock_qty || 0) * (material.unit_cost || 0);
        const newStockQty = (material.stock_qty || 0) + qtyPurchased;
        const newUnitCost = (currentTotalValue + totalCost) / newStockQty;

        // Update Stok & Cost di Supabase
        await supabaseClient.from('raw_materials').update({ 
            stock_qty: newStockQty, 
            unit_cost: newUnitCost 
        }).eq('id', materialId);

        // Catat Jurnal Umum Pembelian
        await supabaseClient.from('journal_entries').insert([{
            description: `Pembelian Bahan Baku: ${material.name} (${qtyPurchased} ${material.unit})`,
            account_debit: 'Persediaan Bahan Baku',
            account_credit: 'Kas',
            amount: totalCost
        }]);

        alert('Pembelian berhasil dicatat!');
        window.location.href = 'persediaan.html'; // Pindah ke halaman persediaan
    });
}

// 6. Event Handler Penjualan & Material Flow
const sellForm = document.getElementById('sell-product-form');
if (sellForm) {
    sellForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = sellProductSelect.value;
        const qtySold = parseInt(document.getElementById('sell-qty').value);

        if (!productId) {
            alert("Silakan pilih menu kopi terlebih dahulu!");
            return;
        }

        // Get Data Produk & BOM / Resep
        const { data: product, error: errProd } = await supabaseClient.from('products').select('*').eq('id', productId).single();
        const { data: boms, error: errBom } = await supabaseClient.from('recipe_boms').select('*, raw_materials(*)').eq('product_id', productId);

        if (errProd || !product) {
            alert("Gagal mengambil data menu!");
            return;
        }

        if (errBom || !boms || boms.length === 0) {
            alert("Resep (BOM) untuk menu ini belum dikonfigurasi di database!");
            return;
        }

        let totalHPP = 0;

        // Cek kecukupan stok seluruh bahan terlebih dahulu
        for (const item of boms) {
            const material = item.raw_materials;
            const totalQtyNeeded = item.qty_required * qtySold;

            if (material.stock_qty < totalQtyNeeded) {
                alert(`Stok bahan baku [${material.name}] tidak mencukupi! Sisa stok: ${material.stock_qty} ${material.unit}, dibutuhkan: ${totalQtyNeeded} ${material.unit}`);
                return;
            }
        }

        // Eksekusi Pemotongan Stok & Kalkulasi Total HPP
        for (const item of boms) {
            const material = item.raw_materials;
            const totalQtyNeeded = item.qty_required * qtySold;

            totalHPP += (totalQtyNeeded * (material.unit_cost || 0));
            await supabaseClient.from('raw_materials').update({ 
                stock_qty: material.stock_qty - totalQtyNeeded 
            }).eq('id', material.id);
        }

        const totalSalesPrice = product.price * qtySold;

        // Catat Transaksi Penjualan
        await supabaseClient.from('sales').insert([{ 
            product_id: productId, 
            qty_sold: qtySold, 
            total_price: totalSalesPrice, 
            total_hpp: totalHPP 
        }]);

        // Jurnal 1: Pendapatan Penjualan
        await supabaseClient.from('journal_entries').insert([{ 
            description: `Penjualan ${product.name} x${qtySold}`, 
            account_debit: 'Kas', 
            account_credit: 'Pendapatan Penjualan', 
            amount: totalSalesPrice 
        }]);

        // Jurnal 2: HPP & Pengurangan Persediaan
        await supabaseClient.from('journal_entries').insert([{ 
            description: `Penggunaan Material Flow HPP ${product.name} x${qtySold}`, 
            account_debit: 'Beban HPP', 
            account_credit: 'Persediaan Bahan Baku', 
            amount: totalHPP 
        }]);

        alert(`Penjualan ${product.name} Berhasil!`);
        window.location.href = 'jurnal.html'; // Pindah ke halaman jurnal
    });
}