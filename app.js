// 1. Konfigurasi Supabase Client
const SUPABASE_URL = "https://rrynkagsswtvznoetzyi.supabase.co";
const SUPABASE_KEY = "sb_publishable_W0EE3XiiYGIdWTpEdp_UIg_4G_TG2Af";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Element Selectors (Safe null checks)
const buyMaterialSelect = document.getElementById('buy-material-id');
const sellProductSelect = document.getElementById('sell-product-id');
const stockTableBody = document.querySelector('#stock-table tbody');
const journalTableBody = document.querySelector('#journal-table tbody');

// 3. Init Load Data Berdasarkan Halaman
document.addEventListener('DOMContentLoaded', () => {
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

// Load Data Functions
async function loadDashboardMetrics() {
    const { data: materials } = await supabaseClient.from('raw_materials').select('*');
    const { data: journals } = await supabaseClient.from('journal_entries').select('*');

    let totalAsset = 0;
    if (materials) {
        materials.forEach(m => totalAsset += (m.stock_qty * m.unit_cost));
        document.getElementById('stat-total-materials').textContent = materials.length;
        document.getElementById('stat-total-asset').textContent = `Rp ${totalAsset.toLocaleString('id-ID')}`;
    }

    if (journals) {
        document.getElementById('stat-total-journals').textContent = journals.length;
    }
}

async function loadMaterialDropdown() {
    if (!buyMaterialSelect) return;
    const { data: materials } = await supabaseClient.from('raw_materials').select('*');
    if (materials && materials.length > 0) {
        buyMaterialSelect.innerHTML = materials.map(m => `<option value="${m.id}">${m.name} (${m.unit})</option>`).join('');
    } else {
        buyMaterialSelect.innerHTML = `<option value="">-- Data Bahan Baku Kosong --</option>`;
    }
}

async function loadProductDropdown() {
    if (!sellProductSelect) return;
    const { data: products } = await supabaseClient.from('products').select('*');
    if (products && products.length > 0) {
        sellProductSelect.innerHTML = products.map(p => `<option value="${p.id}">${p.name} - Rp${p.price.toLocaleString()}</option>`).join('');
    } else {
        sellProductSelect.innerHTML = `<option value="">-- Data Menu Kosong --</option>`;
    }
}

async function loadStockTable() {
    if (!stockTableBody) return;
    const { data: materials } = await supabaseClient.from('raw_materials').select('*').order('code');
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
    if (!journalTableBody) return;
    const { data: journals } = await supabaseClient.from('journal_entries').select('*').order('entry_date', { ascending: false });
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

// Event Handler Pembelian
const buyForm = document.getElementById('buy-material-form');
if (buyForm) {
    buyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const materialId = buyMaterialSelect.value;
        const qtyPurchased = parseFloat(document.getElementById('buy-qty').value);
        const totalCost = parseFloat(document.getElementById('buy-cost').value);

        const { data: material } = await supabaseClient.from('raw_materials').select('*').eq('id', materialId).single();
        
        const currentTotalValue = material.stock_qty * material.unit_cost;
        const newStockQty = material.stock_qty + qtyPurchased;
        const newUnitCost = (currentTotalValue + totalCost) / newStockQty;

        await supabaseClient.from('raw_materials').update({ stock_qty: newStockQty, unit_cost: newUnitCost }).eq('id', materialId);
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

// Event Handler Penjualan
const sellForm = document.getElementById('sell-product-form');
if (sellForm) {
    sellForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = sellProductSelect.value;
        const qtySold = parseInt(document.getElementById('sell-qty').value);

        const { data: product } = await supabaseClient.from('products').select('*').eq('id', productId).single();
        const { data: boms } = await supabaseClient.from('recipe_boms').select('*, raw_materials(*)').eq('product_id', productId);

        let totalHPP = 0;

        for (const item of boms) {
            const material = item.raw_materials;
            const totalQtyNeeded = item.qty_required * qtySold;

            if (material.stock_qty < totalQtyNeeded) {
                alert(`Stok bahan baku [${material.name}] tidak mencukupi!`);
                return;
            }

            totalHPP += (totalQtyNeeded * material.unit_cost);
            await supabaseClient.from('raw_materials').update({ stock_qty: material.stock_qty - totalQtyNeeded }).eq('id', material.id);
        }

        const totalSalesPrice = product.price * qtySold;

        await supabaseClient.from('sales').insert([{ product_id: productId, qty_sold: qtySold, total_price: totalSalesPrice, total_hpp: totalHPP }]);
        await supabaseClient.from('journal_entries').insert([{ description: `Penjualan ${product.name} x${qtySold}`, account_debit: 'Kas', account_credit: 'Pendapatan Penjualan', amount: totalSalesPrice }]);
        await supabaseClient.from('journal_entries').insert([{ description: `Penggunaan Material Flow HPP ${product.name} x${qtySold}`, account_debit: 'Beban HPP', account_credit: 'Persediaan Bahan Baku', amount: totalHPP }]);

        alert(`Penjualan ${product.name} Berhasil!`);
        window.location.href = 'jurnal.html'; // Pindah ke halaman jurnal
    });
}