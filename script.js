// CRM completo con: filtros, búsqueda, edición inline, import/export CSV, modo oscuro, historial, seguimiento.
const FORM = document.getElementById('formulario');
const tablaBody = document.querySelector('#tabla tbody');
const buscador = document.getElementById('buscador');
const filtroEstado = document.getElementById('filtroEstado');
const filtroCurso = document.getElementById('filtroCurso');
const contador = document.getElementById('contador');
const panelSeguimientos = document.getElementById('panelSeguimientos');
const historialUI = document.getElementById('historial');
const inputCSV = document.getElementById('inputCSV');
const toggleDark = document.getElementById('toggleDark');
const btnExport = document.getElementById('btnExport');

let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let editIndex = null;
let chartEstado, chartCurso;

// carga ejemplo si vacío
if(estudiantes.length===0){
  const ejemplo=[{"nombre":"Ana Gómez","correo":"ana.gomez@example.com","telefono":"88810001","curso":"Matemática","estado":"Interesado","proximoSeguimiento":"2025-08-05"},{"nombre":"Luis Pérez","correo":"luis.perez@example.com","telefono":"88810002","curso":"Programación","estado":"Primer contacto","proximoSeguimiento":"2025-08-01"},{"nombre":"María Ruiz","correo":"maria.ruiz@example.com","telefono":"88810003","curso":"Física","estado":"Matriculado","proximoSeguimiento":"2025-08-20"},{"nombre":"Carlos Díaz","correo":"carlos.diaz@example.com","telefono":"88810004","curso":"Química","estado":"Egresado","proximoSeguimiento":"2025-07-25"},{"nombre":"Sofía Morales","correo":"sofia.morales@example.com","telefono":"88810005","curso":"Biología","estado":"Evaluación","proximoSeguimiento":"2025-08-03"},{"nombre":"Diego Herrera","correo":"diego.herrera@example.com","telefono":"88810006","curso":"Programación","estado":"Matriculado","proximoSeguimiento":"2025-08-10"},{"nombre":"Lucía Castro","correo":"lucia.castro@example.com","telefono":"88810007","curso":"Matemática","estado":"Primer contacto","proximoSeguimiento":"2025-07-30"},{"nombre":"Jorge Vega","correo":"jorge.vega@example.com","telefono":"88810008","curso":"Física","estado":"Interesado","proximoSeguimiento":"2025-08-02"},{"nombre":"Elena Soto","correo":"elena.soto@example.com","telefono":"88810009","curso":"Química","estado":"Evaluación","proximoSeguimiento":"2025-08-04"},{"nombre":"Ricardo Flores","correo":"ricardo.flores@example.com","telefono":"88810010","curso":"Biología","estado":"Matriculado","proximoSeguimiento":"2025-08-12"},{"nombre":"Paola Jiménez","correo":"paola.jimenez@example.com","telefono":"88810011","curso":"Programación","estado":"Interesado","proximoSeguimiento":"2025-08-06"},{"nombre":"Fernando Ruiz","correo":"fernando.ruiz@example.com","telefono":"88810012","curso":"Matemática","estado":"Matriculado","proximoSeguimiento":"2025-08-15"},{"nombre":"Laura Méndez","correo":"laura.mendez@example.com","telefono":"88810013","curso":"Física","estado":"Primer contacto","proximoSeguimiento":"2025-08-08"},{"nombre":"Andrés López","correo":"andres.lopez@example.com","telefono":"88810014","curso":"Química","estado":"Evaluación","proximoSeguimiento":"2025-08-07"},{"nombre":"Verónica Salas","correo":"veronica.salas@example.com","telefono":"88810015","curso":"Biología","estado":"Interesado","proximoSeguimiento":"2025-08-09"},{"nombre":"Pablo Arias","correo":"pablo.arias@example.com","telefono":"88810016","curso":"Programación","estado":"Matriculado","proximoSeguimiento":"2025-08-11"},{"nombre":"Camila Ortiz","correo":"camila.ortiz@example.com","telefono":"88810017","curso":"Matemática","estado":"Egresado","proximoSeguimiento":"2025-07-20"},{"nombre":"Miguel Torres","correo":"miguel.torres@example.com","telefono":"88810018","curso":"Física","estado":"Matriculado","proximoSeguimiento":"2025-08-14"},{"nombre":"Natalia Peña","correo":"natalia.pena@example.com","telefono":"88810019","curso":"Química","estado":"Primer contacto","proximoSeguimiento":"2025-08-13"},{"nombre":"Oscar Rojas","correo":"oscar.rojas@example.com","telefono":"88810020","curso":"Biología","estado":"Evaluación","proximoSeguimiento":"2025-08-16"}];
  estudiantes=ejemplo;
  agregarHistorial('Se cargó lista de ejemplo inicial');
  guardarDatos();
}

function guardarDatos(){
  localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
  localStorage.setItem('historial', JSON.stringify(historial));
}

function agregarHistorial(text){
  const ahora=new Date();
  historial.unshift({texto: text, cuando: ahora.toISOString()});
  if(historial.length>100) historial.pop();
  guardarDatos();
}

function aplicarTema(){
  if(localStorage.getItem('tema')==='oscuro'){
    document.body.classList.add('dark');
    toggleDark.textContent='🌞';
  } else {
    document.body.classList.remove('dark');
    toggleDark.textContent='🌙';
  }
}

toggleDark.addEventListener('click', () => {
  if(document.body.classList.toggle('dark')){
    localStorage.setItem('tema','oscuro');
    toggleDark.textContent='🌞';
    agregarHistorial('Se activó modo oscuro');
  } else {
    localStorage.setItem('tema','claro');
    toggleDark.textContent='🌙';
    agregarHistorial('Se desactivó modo oscuro');
  }
});

function escapeHTML(str){return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function renderizar(){
  tablaBody.innerHTML='';
  const bus=buscador.value.toLowerCase();
  const fe=filtroEstado.value;
  const fc=filtroCurso.value;
  let visibles=0;
  estudiantes.forEach((e,i)=>{
    if((e.nombre.toLowerCase().includes(bus)||e.correo.toLowerCase().includes(bus))
       && (fe===''||e.estado===fe)
       && (fc===''||e.curso===fc)){
      visibles++;
      const tr=document.createElement('tr');
      // seguimiento
      const hoy=new Date();
      let clase='';
      if(e.proximoSeguimiento){
        const f=new Date(e.proximoSeguimiento+'T00:00:00');
        const diff=(f-hoy)/(1000*60*60*24);
        if(f<hoy) clase='table-danger';
        else if(diff<=3) clase='table-warning';
      }
      if(clase) tr.classList.add(clase);
      tr.dataset.index=i;
      tr.innerHTML=`
        <td class="nombre">${escapeHTML(e.nombre)}</td>
        <td class="correo">${escapeHTML(e.correo)}</td>
        <td class="telefono">${escapeHTML(e.telefono||'')}</td>
        <td class="curso">${escapeHTML(e.curso)}</td>
        <td class="estado">${escapeHTML(e.estado)}</td>
        <td class="proximoSeguimiento">${escapeHTML(e.proximoSeguimiento||'')}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary editar">Editar</button>
          <button class="btn btn-sm btn-outline-danger eliminar">Eliminar</button>
        </td>`;
      tablaBody.appendChild(tr);
    }
  });
  contador.textContent=visibles;
  actualizarFiltros();
  actualizarGraficos();
  renderHistorial();
  renderPanelSeguimientos();
  attachHandlers();
}

function attachHandlers(){
  document.querySelectorAll('.editar').forEach(btn=>{
    btn.onclick=function(){
      const tr=this.closest('tr');
      const idx=parseInt(tr.dataset.index);
      iniciarEdicion(idx,tr);
    };
  });
  document.querySelectorAll('.eliminar').forEach(btn=>{
    btn.onclick=function(){
      const tr=this.closest('tr');
      const idx=parseInt(tr.dataset.index);
      if(confirm('Eliminar estudiante?')){
        agregarHistorial(`Se eliminó a ${estudiantes[idx].nombre}`);
        estudiantes.splice(idx,1);
        guardarDatos();
        renderizar();
      }
    };
  });
}

function iniciarEdicion(index,tr){
  const e=estudiantes[index];
  editIndex=index;
  tr.querySelector('.nombre').innerHTML=`<input class="form-control form-control-sm" data-field="nombre" value="${escapeHTML(e.nombre)}">`;
  tr.querySelector('.correo').innerHTML=`<input class="form-control form-control-sm" data-field="correo" value="${escapeHTML(e.correo)}">`;
  tr.querySelector('.telefono').innerHTML=`<input class="form-control form-control-sm" data-field="telefono" value="${escapeHTML(e.telefono||'')}">`;
  tr.querySelector('.curso').innerHTML=`<input class="form-control form-control-sm" data-field="curso" value="${escapeHTML(e.curso)}">`;
  tr.querySelector('.estado').innerHTML=`
    <select class="form-select form-select-sm" data-field="estado">
      <option value="Primer contacto"${e.estado==='Primer contacto'?' selected':''}>🟡 Primer contacto</option>
      <option value="Interesado"${e.estado==='Interesado'?' selected':''}>🟠 Interesado</option>
      <option value="Evaluación"${e.estado==='Evaluación'?' selected':''}>🔵 En evaluación</option>
      <option value="Matriculas">${e.estado}</option>
      <option value="Matriculado"${e.estado==='Matriculado'?' selected':''}>🟢 Matriculado</option>
      <option value="Egresado"${e.estado==='Egresado'?' selected':''}>⚪ Egresado</option>
    </select>`;
  tr.querySelector('.proximoSeguimiento').innerHTML=`<input class="form-control form-control-sm" data-field="proximoSeguimiento" type="date" value="${escapeHTML(e.proximoSeguimiento||'')}">`;
  const acciones=tr.querySelector('td:last-child');
  acciones.innerHTML=`<button class="btn btn-sm btn-success guardar">Guardar</button> <button class="btn btn-sm btn-secondary cancelar">Cancelar</button>`;
  acciones.querySelector('.guardar').onclick=function(){
    const updated={
      nombre: tr.querySelector('input[data-field=nombre]').value.trim(),
      correo: tr.querySelector('input[data-field=correo]').value.trim(),
      telefono: tr.querySelector('input[data-field=telefono]').value.trim(),
      curso: tr.querySelector('input[data-field=curso]').value.trim(),
      estado: tr.querySelector('select[data-field=estado]').value,
      proximoSeguimiento: tr.querySelector('input[data-field=proximoSeguimiento]').value
    };
    agregarHistorial(`Se editó a ${estudiantes[index].nombre} -> ${updated.nombre}`);
    estudiantes[index]=updated;
    editIndex=null;
    guardarDatos();
    renderizar();
  };
  acciones.querySelector('.cancelar').onclick=function(){
    editIndex=null;
    renderizar();
  };
}

FORM.addEventListener('submit',e=>{
  e.preventDefault();
  const nuevo={
    nombre: document.getElementById('nombre').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    curso: document.getElementById('curso').value.trim(),
    estado: document.getElementById('estado').value,
    proximoSeguimiento: document.getElementById('proximoSeguimiento').value
  };
  if(!nuevo.nombre||!nuevo.correo){alert('Nombre y correo requeridos'); return;}
  if(editIndex!==null){
    agregarHistorial(`Se actualizó a ${estudiantes[editIndex].nombre} -> ${nuevo.nombre}`);
    estudiantes[editIndex]=nuevo;
    editIndex=null;
  } else {
    estudiantes.push(nuevo);
    agregarHistorial(`Se agregó a ${nuevo.nombre}`);
  }
  guardarDatos();
  FORM.reset();
  renderizar();
});

[buscador,filtroEstado,filtroCurso].forEach(el=>el.addEventListener('input',renderizar));
document.getElementById('limpiarFiltros').addEventListener('click',()=>{
  buscador.value=''; filtroEstado.value=''; filtroCurso.value=''; renderizar();
});

function actualizarFiltros(){
  // poblar selects únicos
  const cursos=[...new Set(estudiantes.map(e=>e.curso).filter(c=>c))].sort();
  filtroCurso.innerHTML='<option value="">— Filtrar por curso —</option>';
  cursos.forEach(c=>{
    const o=document.createElement('option'); o.value=c; o.textContent=c; filtroCurso.append(o);
  });
  const estadosDef=['Primer contacto','Interesado','Evaluación','Matriculado','Egresado'];
  filtroEstado.innerHTML='<option value="">— Filtrar por estado —</option>';
  estadosDef.forEach(s=>{
    const o=document.createElement('option'); o.value=s; o.textContent=s; filtroEstado.append(o);
  });
}

function renderPanelSeguimientos(){
  const hoy=new Date();
  const proximos=[];
  const vencidos=[];
  estudiantes.forEach(e=>{
    if(!e.proximoSeguimiento) return;
    const f=new Date(e.proximoSeguimiento+'T00:00:00');
    const diff=(f-hoy)/(1000*60*60*24);
    if(f<hoy) vencidos.push(e);
    else if(diff<=3) proximos.push(e);
  });
  let html='';
  if(vencidos.length) html+=`<div><strong>Vencidos:</strong> ${vencidos.map(e=>`${e.nombre} (${e.proximoSeguimiento})`).join(', ')}</div>`;
  if(proximos.length) html+=`<div><strong>Próximos (3 días):</strong> ${proximos.map(e=>`${e.nombre} (${e.proximoSeguimiento})`).join(', ')}</div>`;
  if(!html) html='<div>No hay seguimientos urgentes.</div>';
  panelSeguimientos.innerHTML=html;
  if(vencidos.length) alert(`Hay ${vencidos.length} seguimientos vencidos: ${vencidos.map(e=>e.nombre).join(', ')}`);
}

function actualizarGraficos(){
  const estados={}; const cursos={};
  estudiantes.forEach(e=>{
    estados[e.estado]=(estados[e.estado]||0)+1;
    cursos[e.curso]=(cursos[e.curso]||0)+1;
  });
  const estadoCtx=document.getElementById('graficoEstado').getContext('2d');
  const cursoCtx=document.getElementById('graficoCurso').getContext('2d');
  if(chartEstado) chartEstado.destroy();
  if(chartCurso) chartCurso.destroy();
  chartEstado=new Chart(estadoCtx,{
    type:'bar',
    data:{labels:Object.keys(estados), datasets:[{label:'Cantidad',data:Object.values(estados),backgroundColor:['#f0ad4e','#5bc0de','#5cb85c','#337ab7','#d9534f']}]},
    options:{responsive:true, plugins:{legend:{display:false}}}
  });
  chartCurso=new Chart(cursoCtx,{
    type:'pie',
    data:{labels:Object.keys(cursos), datasets:[{data:Object.values(cursos),backgroundColor:['#8e44ad','#3498db','#27ae60','#f39c12','#c0392b']}]},
    options:{responsive:true}
  });
}

function renderHistorial(){
  historialUI.innerHTML='';
  historial.slice(0,50).forEach(item=>{
    const li=document.createElement('li');
    li.className='list-group-item small';
    const d=new Date(item.cuando);
    li.textContent=`[${d.toLocaleString()}] ${item.texto}`;
    historialUI.append(li);
  });
}

function exportarCSV(){
  const headers=['Nombre','Correo','Teléfono','Curso','Estado','Próximo seguimiento'];
  const rows=estudiantes.map(e=>[
    `"${e.nombre.replace(/"/g,'""')}"`,
    `"${e.correo.replace(/"/g,'""')}"`,
    `"${(e.telefono||'').replace(/"/g,'""')}"`,
    `"${(e.curso||'').replace(/"/g,'""')}"`,
    `"${(e.estado||'').replace(/"/g,'""')}"`,
    `"${(e.proximoSeguimiento||'').replace(/"/g,'""')}"`
  ].join(','));
  const csv=[headers.map(h=>`"${h}"`).join(','), ...rows].join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='estudiantes.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importarCSV(file){
  const reader=new FileReader();
  reader.onload=e=>{
    const text=e.target.result;
    const lines=text.trim().split('\n');
    const header=lines[0].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(h=>h.replace(/^"|"$/g,'').toLowerCase());
    for(let i=1;i<lines.length;i++){
      const parts=lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      const obj={};
      header.forEach((h,idx)=>{ obj[h]=parts[idx]?parts[idx].replace(/^"|"$/g,''):''; });
      if(!obj.nombre||!obj.correo) continue;
      const existe=estudiantes.find(e=>e.correo.toLowerCase()===obj.correo.toLowerCase());
      if(existe){ continue; }
      estudiantes.push({
        nombre:obj.nombre, correo:obj.correo, telefono:obj.telefono||'', curso:obj.curso||'', estado:obj.estado||'Primer contacto',
        proximoSeguimiento: obj['próximo seguimiento']||obj.proximoSeguimiento||''
      });
      agregarHistorial(`Se importó desde CSV a ${obj.nombre}`);
    }
    guardarDatos();
    renderizar();
  };
  reader.readAsText(file,'UTF-8');
}

inputCSV.addEventListener('change', ()=>{ if(inputCSV.files[0]) importarCSV(inputCSV.files[0]); });
btnExport.addEventListener('click', exportarCSV);

aplicarTema();
renderizar();
