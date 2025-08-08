async function loadData() {
  const [clientes, productos, facturas] = await Promise.all([
    fetch('data_clientes.json').then(r=>r.json()),
    fetch('data_productos.json').then(r=>r.json()),
    fetch('data_facturas.json').then(r=>r.json())
  ]);
  window.APP = { clientes, productos, facturas };
  renderAll();
  document.getElementById('totalClients').textContent = clientes.length;
  document.getElementById('totalSpent').textContent = '₡' + clientes.reduce((s,c)=>s+c.total_gastado,0).toLocaleString();
}

function showSection(name){
  document.querySelectorAll('section.section').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(name);
  if(el) el.classList.add('active');
}

document.addEventListener('click',(e)=>{
  if (e.target.matches('nav.menu button')) {
    document.querySelectorAll('nav.menu button').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    const sec = e.target.dataset.section || e.target.textContent.trim().toLowerCase();
    showSection(sec);
  }
});

function renderAll(){
  renderClientes();
  renderFacturas();
  renderProductos();
  renderReportes();
}

function renderClientes(filterSucursal){ 
  const tbody = document.querySelector('#tableClientes tbody');
  tbody.innerHTML='';
  (window.APP.clientes || []).filter(c=> !filterSucursal || filterSucursal==='Todas' ? true : c.sucursal===filterSucursal).forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${c.id}</td><td>${c.nombre}</td><td>${c.correo}</td><td>${c.telefono}</td><td>${c.frecuencia}</td><td>${c.tipo}</td><td>₡${c.total_gastado.toLocaleString()}</td><td>${c.metodo_pago}</td><td>${c.sucursal}</td>`;
    tbody.appendChild(tr);
  });
}

function renderFacturas(filterSucursal){
  const tbody = document.querySelector('#tableFacturas tbody');
  tbody.innerHTML='';
  (window.APP.facturas || []).filter(f=> !filterSucursal || filterSucursal==='Todas' ? true : f.sucursal===filterSucursal).forEach(f=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${f.numero}</td><td>${f.cliente}</td><td>${f.fecha}</td><td>${f.productos.join(', ')}</td><td>₡${f.total.toLocaleString()}</td><td>${f.metodo_pago}</td><td>${f.estado}</td><td>${f.sucursal}</td>`;
    tbody.appendChild(tr);
  });
}

function renderProductos(filterSucursal){
  const tbody = document.querySelector('#tableProductos tbody');
  tbody.innerHTML='';
  (window.APP.productos || []).forEach(p=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${p.codigo}</td><td>${p.nombre}</td><td>₡${p.precio.toLocaleString()}</td><td>${p.stock}</td><td>-</td>`;
    tbody.appendChild(tr);
  });
}

function renderReportes(filterSucursal){
  const counts = {}; const totals = {};
  (window.APP.productos || []).forEach(p=>{ counts[p.nombre]=0; totals[p.nombre]=0; });
  (window.APP.facturas || []).filter(f=> !filterSucursal || filterSucursal==='Todas' ? true : f.sucursal===filterSucursal).forEach(f=>{
    f.productos.forEach(prod=>{
      counts[prod] = (counts[prod]||0) + 1;
      const prodObj = window.APP.productos.find(p=>p.nombre===prod);
      totals[prod] = (totals[prod]||0) + (prodObj ? prodObj.precio : 0);
    });
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const tbody = document.querySelector('#tableReport tbody'); tbody.innerHTML='';
  labels.forEach(l=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${l}</td><td>${counts[l]}</td><td>₡${(totals[l]||0).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
  const ctx = document.getElementById('chartProducts').getContext('2d');
  if (window._chartProd) window._chartProd.destroy();
  window._chartProd = new Chart(ctx,{type:'pie',data:{labels,datasets:[{data}]}});
  const branchTotals = {}; (window.APP.facturas || []).filter(f=> !filterSucursal || filterSucursal==='Todas' ? true : f.sucursal===filterSucursal).forEach(f=>{ branchTotals[f.sucursal]=(branchTotals[f.sucursal]||0)+f.total; });
  const bLabels = Object.keys(branchTotals); const bData = Object.values(branchTotals);
  const ctx2 = document.getElementById('chartByBranch').getContext('2d');
  if (window._chartBranch) window._chartBranch.destroy();
  window._chartBranch = new Chart(ctx2,{type:'bar',data:{labels:bLabels,datasets:[{label:'Ventas ₡',data:bData,backgroundColor:'rgba(11,110,216,0.7)'}]}});
}

document.getElementById('filterSucursal').addEventListener('change', function(){
  const s = this.value;
  renderClientes(s); renderFacturas(s); renderReportes(s);
});

document.getElementById('searchInput').addEventListener('input', function(){
  const q=this.value.toLowerCase();
  if(!q){ renderClientes(); renderProductos(); return; }
  const tbodyC = document.querySelector('#tableClientes tbody'); tbodyC.innerHTML='';
  window.APP.clientes.filter(c=> (c.nombre + ' ' + c.correo).toLowerCase().includes(q)).forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${c.id}</td><td>${c.nombre}</td><td>${c.correo}</td><td>${c.telefono}</td><td>${c.frecuencia}</td><td>${c.tipo}</td><td>₡${c.total_gastado.toLocaleString()}</td><td>${c.metodo_pago}</td><td>${c.sucursal}</td>`;
    tbodyC.appendChild(tr);
  });
  const tbodyP = document.querySelector('#tableProductos tbody'); tbodyP.innerHTML='';
  window.APP.productos.filter(p=>p.nombre.toLowerCase().includes(q)).forEach(p=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${p.codigo}</td><td>${p.nombre}</td><td>₡${p.precio.toLocaleString()}</td><td>${p.stock}</td><td>-</td>`;
    tbodyP.appendChild(tr);
  });
});

document.getElementById('darkToggle').addEventListener('click', ()=>document.body.classList.toggle('dark'));

document.getElementById('exportCSV').addEventListener('click', ()=>{
  const rows=[['ID','Nombre','Correo','Teléfono','Frecuencia','Tipo','Total gastado','Método de pago','Sucursal'], ...window.APP.clientes.map(c=>[c.id,c.nombre,c.correo,c.telefono,c.frecuencia,c.tipo,c.total_gastado,c.metodo_pago,c.sucursal])];
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='clientes.csv'; a.click();
});

// Initialize
loadData();
