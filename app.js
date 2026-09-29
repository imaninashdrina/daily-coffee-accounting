// 1. Konfigurasi Supabase Client (Perbaikan URL & Nama Variabel)
const SUPABASE_URL = "https://rrynkagsswtvznoetzyi.supabase.co"; // Diubah: Hapus /rest/v1/
const SUPABASE_KEY = "sb_publishable_W0EE3XiiYGIdWTpEdp_UIg_4G_TG2Af";

// Menggunakan nama 'supabaseClient' agar tidak bentrok dengan library global 'window.supabase'
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Element Selectors
const buyMaterialSelect = document.getElementById('buy-material-id');
const sellProductSelect = document.getElementById('sell-product-id');
const stockTableBody = document.querySelector('#stock-table tbody');
const journalTableBody = document.querySelector('#journal-table tbody');

// 3. Init Load Data
document.addEventListener('DOMContentLoaded', () => {
    loadDropdowns();
    loadStockTable();
    loadJournalTable();
});

async function loadDropdowns() {
    // Load Raw Materials
    const { data: materials, error: errMaterials } = await supabaseClient.from('raw_materials').select('*');
    if (errMaterials) {
        console.error("Error loading materials:", errMaterials);
    } else if (materials && materials.length > 0) {
        buyMaterialSelect.innerHTML = materials.map(m => `<option value="${m.id}">${m.name} (${m.unit})</option>`).join('');
    } else {
        buyMaterialSelect.innerHTML = `<option value="">-- Data Bahan Baku Kosong --</option>`;
    }

    // Load Products
    const { data: products, error: errProducts } = await supabaseClient.from('products').select('*');
    if (errProducts) {
        console.error("Error loading products:", errProducts);
    } else if (products && products.length > 0) {
        sellProductSelect.innerHTML = products.map(p => `<option value="${p.id}">${p.name} - Rp${p.price.toLocaleString()}</option>`).join('');
    } else {
        sellProductSelect.innerHTML = `<option value="">-- Data Menu Kosong --</option>`;
    }
}

async function loadStockTable() {
    const { data: materials, error } = await supabaseClient.from('raw_materials').select('*').order('code');
    if (error) {
        console.error("Error loading stock table:", error);
        return;
    }
    if (materials && materials.length > 0) {
        stockTableBody.innerHTML = materials.map(m => {
            const totalValue = (m.stock_qty || 0) * (m.unit_cost || 0);
            return `
                <tr>
                    <td>${m.code}</td>
                    <td>${m.name}</td>
                    <td><strong>${Number(m.stock_qty).toLocaleString()}</strong></td>
                    <td>${m.unit}</td>
                    <td>Rp${Number(m.unit_cost).toLocaleString()}</td>
                    <td>Rp${totalValue.toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    } else {
        stockTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada data persediaan</td></tr>`;
    }
}

async function loadJournalTable() {
    const { data: journals, error } = await supabaseClient.from('journal_entries').select('*').order('entry_date', { ascending: false });
    if (error) {
        console.error("Error loading journals:", error);
        return;
    }
    if (journals && journals.length > 0) {
        journalTableBody.innerHTML = journals.map(j => `
            <tr>
                <td>${new Date(j.entry_date).toLocaleString('id-ID')}</td>
                <td>${j.description}</td>
                <td><strong>${j.account_debit}</strong></td>
                <td><strong>${j.account_credit}</strong></td>
                <td>Rp${Number(j.amount).toLocaleString()}</td>
            </tr>
        `).join('');
    } else {
        journalTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada transaksi jurnal</td></tr>`;
    }
}

// 4. Handler Pembelian Bahan Baku (Goods Receipt)
document.getElementById('buy-material-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const materialId = buyMaterialSelect.value;
    const qtyPurchased = parseFloat(document.getElementById('buy-qty').value);
    const totalCost = parseFloat(document.getElementById('buy-cost').value);

    if (!materialId) {
        alert("Pilih bahan baku terlebih dahulu!");
        return;
    }

    // Get Current Stock & Cost
    const { data: material, error } = await supabaseClient.from('raw_materials').select('*').eq('id', materialId).single();
    if (error || !material) {
        alert("Gagal mengambil data bahan baku");
        return;
    }
    
    // Moving Average Cost Calculation
    const currentTotalValue = material.stock_qty * material.unit_cost;
    const newStockQty = material.stock_qty + qtyPurchased;
    const newUnitCost = (currentTotalValue + totalCost) / newStockQty;

    // Update DB Material
    await supabaseClient.from('raw_materials').update({
        stock_qty: newStockQty,
        unit_cost: newUnitCost
    }).eq('id', materialId);

    // Record Journal: Debit Persediaan, Kredit Kas
    await supabaseClient.from('journal_entries').insert([{
        description: `Pembelian Bahan Baku: ${material.name} (${qtyPurchased} ${material.unit})`,
        account_debit: 'Persediaan Bahan Baku',
        account_credit: 'Kas',
        amount: totalCost
    }]);

    alert('Pembelian berhasil dicatat dan disesuaikan ke stok!');
    e.target.reset();
    loadStockTable();
    loadJournalTable();
});

// 5. Handler Penjualan & Auto Material Flow
document.getElementById('sell-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = sellProductSelect.value;
    const qtySold = parseInt(document.getElementById('sell-qty').value);

    if (!productId) {
        alert("Pilih menu kopi terlebih dahulu!");
        return;
    }

    // 1. Get Product
    const { data: product, error: errProd } = await supabaseClient.from('products').select('*').eq('id', productId).single();
    if (errProd || !product) {
        alert("Gagal mengambil data menu");
        return;
    }
    
    // 2. Get BOM / Recipe
    const { data: boms, error: errBom } = await supabaseClient.from('recipe_boms').select('*, raw_materials(*)').eq('product_id', productId);
    if (errBom || !boms || boms.length === 0) {
        alert("Resep/BOM untuk menu ini belum dikonfigurasi di database!");
        return;
    }

    let totalHPP = 0;

    // 3. Process Material Flow (Deduct Stock & Calculate HPP)
    for (const item of boms) {
        const material = item.raw_materials;
        const totalQtyNeeded = item.qty_required * qtySold;

        // Validasi Stok Cukup
        if (material.stock_qty < totalQtyNeeded) {
            alert(`Stok bahan baku [${material.name}] tidak mencukupi! Sisa stok: ${material.stock_qty} ${material.unit}, dibutuhkan: ${totalQtyNeeded} ${material.unit}`);
            return;
        }

        const itemHPP = totalQtyNeeded * material.unit_cost;
        totalHPP += itemHPP;

        // Potong Stok
        await supabaseClient.from('raw_materials').update({
            stock_qty: material.stock_qty - totalQtyNeeded
        }).eq('id', material.id);
    }

    const totalSalesPrice = product.price * qtySold;

    // 4. Catat Penjualan
    await supabaseClient.from('sales').insert([{
        product_id: productId,
        qty_sold: qtySold,
        total_price: totalSalesPrice,
        total_hpp: totalHPP
    }]);

    // 5. Jurnal Akuntansi: Pendapatan Penjualan
    await supabaseClient.from('journal_entries').insert([{
        description: `Penjualan ${product.name} x${qtySold}`,
        account_debit: 'Kas',
        account_credit: 'Pendapatan Penjualan',
        amount: totalSalesPrice
    }]);

    // 6. Jurnal Akuntansi: Beban HPP vs Persediaan
    await supabaseClient.from('journal_entries').insert([{
        description: `Penggunaan Material Flow HPP ${product.name} x${qtySold}`,
        account_debit: 'Beban HPP',
        account_credit: 'Persediaan Bahan Baku',
        amount: totalHPP
    }]);

    alert(`Penjualan ${product.name} Berhasil! Stok bahan terpotong dan Jurnal HPP telah dibuat.`);
    e.target.reset();
    loadStockTable();
    loadJournalTable();
});