
// Load data and render UI
async function loadData() {
  const [clientes, productos, facturas] = await Promise.all([
    fetch('data_clientes.json').then(r=>r.json()),
    fetch('data_productos.json').then(r=>r.json()),
    fetch('data_facturas.json').then(r=>r.json())
  ]);
  window.APP = { clientes, productos, facturas };
  renderClientes();
  renderFacturas();
  renderProductos();
  renderReportes();
  document.getElementById('totalClients').textContent = clientes.length;
  document.getElementById('totalSpent').textContent = '₡' + clientes.reduce((s,c)=>s+c.total_gastado,0).toLocaleString();
}

// Navigation
document.addEventListener('click', (e)=>{
  if (e.target.matches('nav.menu button')) {
    document.querySelectorAll('nav.menu button').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    const sec = e.target.dataset.section || e.target.getAttribute('data-section') || e.target.textContent.trim().toLowerCase();
    showSectionByBtn(e.target);
  }
});

function showSectionByBtn(btn){
  const name = btn.dataset.section || btn.textContent.trim().toLowerCase();
  showSection(name);
}

function showSection(name){
  document.querySelectorAll('section.section').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(name);
  if (el) el.classList.add('active');
}

// Render functions
function renderClientes(){
  const tbody = document.querySelector('#tableClientes tbody');
  tbody.innerHTML = '';
  APP.clientes.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.id}</td><td>${c.nombre}</td><td>${c.correo}</td><td>${c.telefono}</td><td>${c.frecuencia}</td><td>${c.tipo}</td><td>₡${c.total_gastado.toLocaleString()}</td><td>${c.metodo_pago}</td>`;
    tbody.appendChild(tr);
  });
}

function renderFacturas(){
  const tbody = document.querySelector('#tableFacturas tbody');
  tbody.innerHTML = '';
  APP.facturas.forEach(f=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${f.numero}</td><td>${f.cliente}</td><td>${f.fecha}</td><td>${f.productos.join(', ')}</td><td>₡${f.total.toLocaleString()}</td><td>${f.metodo_pago}</td><td>${f.estado}</td>`;
    tbody.appendChild(tr);
  });
}

function renderProductos(){
  const tbody = document.querySelector('#tableProductos tbody');
  tbody.innerHTML = '';
  APP.productos.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.codigo}</td><td>${p.nombre}</td><td>₡${p.precio.toLocaleString()}</td><td>${p.stock}</td>`;
    tbody.appendChild(tr);
  });
}

function renderReportes(){
  // compute sales per product
  const counts = {};
  const totals = {};
  APP.productos.forEach(p=>{ counts[p.nombre]=0; totals[p.nombre]=0; });
  APP.facturas.forEach(f=>{
    f.productos.forEach(prod=>{
      counts[prod] = (counts[prod]||0) + 1;
      const prodObj = APP.productos.find(p=>p.nombre===prod);
      totals[prod] = (totals[prod]||0) + (prodObj ? prodObj.precio : 0);
    });
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  // render table
  const tbody = document.querySelector('#tableReport tbody');
  tbody.innerHTML = '';
  labels.forEach(l=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l}</td><td>${counts[l]}</td><td>₡${(totals[l]||0).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
  // chart
  const ctx = document.getElementById('chartProducts').getContext('2d');
  if (window._chart) window._chart.destroy();
  window._chart = new Chart(ctx, {
    type:'pie',
    data:{labels, datasets:[{data}]}
  });
}

// Search input
document.getElementById('searchInput').addEventListener('input', function(){
  const q = this.value.toLowerCase();
  if (!q) { renderClientes(); renderProductos(); return; }
  // filter clients and products
  const tbodyC = document.querySelector('#tableClientes tbody');
  tbodyC.innerHTML = '';
  APP.clientes.filter(c=> (c.nombre + ' ' + c.correo).toLowerCase().includes(q)).forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.id}</td><td>${c.nombre}</td><td>${c.correo}</td><td>${c.telefono}</td><td>${c.frecuencia}</td><td>${c.tipo}</td><td>₡${c.total_gastado.toLocaleString()}</td><td>${c.metodo_pago}</td>`;
    tbodyC.appendChild(tr);
  });
  const tbodyP = document.querySelector('#tableProductos tbody');
  tbodyP.innerHTML = '';
  APP.productos.filter(p=>p.nombre.toLowerCase().includes(q)).forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.codigo}</td><td>${p.nombre}</td><td>₡${p.precio.toLocaleString()}</td><td>${p.stock}</td>`;
    tbodyP.appendChild(tr);
  });
});

// Dark mode toggle
document.getElementById('darkToggle').addEventListener('click', ()=>{
  document.body.classList.toggle('dark');
});

// Export CSV (clients)
document.getElementById('exportCSV').addEventListener('click', ()=>{
  const rows = [
    ['ID','Nombre','Correo','Teléfono','Frecuencia','Tipo','Total gastado','Método de pago'],
    ...APP.clientes.map(c=>[c.id,c.nombre,c.correo,c.telefono,c.frecuencia,c.tipo,c.total_gastado,c.metodo_pago])
  ];
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'clientes.csv';
  a.click();
});

// Initialize
loadData();
