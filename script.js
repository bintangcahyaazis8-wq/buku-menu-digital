let keranjang = JSON.parse(localStorage.getItem('keranjangBakso') || '[]');

const el = {
  cartList: document.getElementById('cartList'),
  totalHarga: document.getElementById('totalHarga'),
  btnWA: document.getElementById('btnWA'),
  btnClear: document.getElementById('btnClear'),
  toast: document.getElementById('toast'),
};

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

function save() {
  localStorage.setItem('keranjangBakso', JSON.stringify(keranjang));
}

function formatRp(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function showToast(msg = 'Ditambahkan ke keranjang') {
  if (!el.toast) return;
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 1400);
}

// ================= RENDER KERANJANG ==================
function renderCart() {
  if (!el.cartList) return;
  el.cartList.innerHTML = '';
  let total = 0;

  keranjang.forEach((item, idx) => {
    const sub = item.harga * item.jumlah;
    total += sub;

    const li = document.createElement('li');
    li.className = 'cart-item';

    li.innerHTML = `
      <div class="cart-name">
        <strong>${item.nama}</strong>
        <span>${formatRp(item.harga)} × ${item.jumlah} = <b>${formatRp(sub)}</b></span>
      </div>

      <div class="cart-ops">
        <div class="qty-group">
          <button class="btn qty-btn" data-action="minus">−</button>
          <span class="qty-num">${item.jumlah}</span>
          <button class="btn qty-btn" data-action="plus">+</button>
        </div>
        <button class="btn btn-ghost" data-action="remove">Hapus</button>
        <button class="btn btn-ghost note-btn" data-action="note" title="Tambah catatan">
          ${item.catatan ? '✏️' : '📝'}
        </button>
      </div>
    `;

    // tambahkan tampilan catatan di bawah item
    if (item.catatan && item.catatan.trim() !== '') {
      const noteEl = document.createElement('div');
      noteEl.style.fontSize = '13px';
      noteEl.style.color = '#555';
      noteEl.style.marginTop = '6px';
      noteEl.innerHTML = `📝 <em>Catatan:</em> ${item.catatan}`;
      li.appendChild(noteEl);
    }

    const btnMinus = li.querySelector('[data-action="minus"]');
    const btnPlus = li.querySelector('[data-action="plus"]');
    const btnRemove = li.querySelector('[data-action="remove"]');
    const btnNote = li.querySelector('[data-action="note"]');

    btnMinus.addEventListener('click', () => {
      if (keranjang[idx].jumlah > 1) keranjang[idx].jumlah--;
      else keranjang.splice(idx, 1);
      save(); renderCart();
    });

    btnPlus.addEventListener('click', () => {
      keranjang[idx].jumlah++;
      save(); renderCart();
    });

    btnRemove.addEventListener('click', () => {
      keranjang.splice(idx, 1);
      save(); renderCart();
    });

    btnNote.addEventListener('click', () => {
      const existingNote = keranjang[idx].catatan || '';
      const note = prompt('Masukkan catatan untuk item ini:', existingNote);
      if (note !== null) {
        keranjang[idx].catatan = note.trim();
        save(); renderCart();
      }
    });

    el.cartList.appendChild(li);
  });

  el.totalHarga.textContent = formatRp(total);
}

// ================= TAMBAH ITEM ==================
function tambahKeKeranjang(nama, harga) {
  const existing = keranjang.find(i => i.nama === nama);
  if (existing) existing.jumlah += 1;
  else keranjang.push({ nama, harga, jumlah: 1, catatan: '' });
  save(); renderCart(); showToast(`✅ ${nama} ditambahkan`);
}

// tombol tambah dari menu
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const nama = btn.dataset.name;
    const harga = parseInt(btn.dataset.price, 10);
    tambahKeKeranjang(nama, harga);
  });
});

// ================= TOMBOL UTAMA ==================
if (el.btnClear) {
  el.btnClear.addEventListener('click', () => {
    if (!keranjang.length) return;
    if (confirm('Kosongkan keranjang?')) {
      keranjang = [];
      save(); renderCart();
    }
  });
}

if (el.btnWA) {
  el.btnWA.addEventListener('click', () => {
    if (keranjang.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    const namaPemesan = prompt('Masukkan nama Anda:');
    if (!namaPemesan) return;

    let pesanText = `Halo, saya ingin memesan:\n\n`;
    keranjang.forEach(item => {
      pesanText += `🍜 ${item.nama} (${item.jumlah}x) - ${formatRp(item.harga * item.jumlah)}\n`;
      if (item.catatan && item.catatan.trim() !== '') {
        pesanText += `📝 Catatan: ${item.catatan}\n`;
      }
      pesanText += '\n';
    });

    const total = keranjang.reduce((s, i) => s + i.harga * i.jumlah, 0);
    pesanText += `Total: ${formatRp(total)}\nAtas nama: ${namaPemesan}`;

    const noWa = '6289693457312';
    const url = `https://wa.me/${noWa}?text=${encodeURIComponent(pesanText)}`;
    window.open(url, '_blank');
  });
}

// ================= INIT ==================
renderCart();
