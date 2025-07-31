// Datos y DOM
const formulario = document.getElementById('formulario');
const tablaBody = document.querySelector('#tabla tbody');
const buscador = document.getElementById('buscador');
const filtroEstado = document.getElementById('filtroEstado');
const filtroCurso = document.getElementById('filtroCurso');
const contador = document.getElementById('contador');
const selectCurso = document.getElementById('curso');
const selectEstado = document.getElementById('estado');

let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
let editIndex = null;
let chartEstado, chartCurso;

// Utilidades
function guardar() {
  localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
  renderizar();
}

function obtenerCursos() {
  const cursos = [...new Set(estudiantes.map(e => e.curso).filter(c => c))].sort();
  filtroCurso.innerHTML = '<option value="">— Filtrar por curso —</option>';
  selectCurso.innerHTML = '<option value="">Curso o carrera</option>';
  cursos.forEach(c => {
    const o = document.createElement('option'); o.value = c; o.textContent = c; filtroCurso.append(o.cloneNode(true)); selectCurso.append(o.cloneNode(true));
  });
}

function obtenerEstados() {
  const estadosDef = ['Primer contacto','Interesado','Evaluación','Matriculado','Egresado'];
  filtroEstado.innerHTML = '<option value="">— Filtrar por estado —</option>';
  estadosDef.forEach(s => {
    const o1 = document.createElement('option'); o1.value = s; o1.textContent = s; filtroEstado.append(o1);
  });
}

// Render
function renderizar() {
  tablaBody.innerHTML = '';
  const bus = buscador.value.toLowerCase();
  const fe = filtroEstado.value;
  const fc = filtroCurso.value;

  let visibles = 0;
  estudiantes.forEach((e, i) => {
    if (
      (e.nombre.toLowerCase().includes(bus) || e.correo.toLowerCase().includes(bus))
      && (fe === '' || e.estado === fe)
      && (fc === '' || e.curso === fc)
    ) {
      visibles++;
      const tr = document.createElement('tr');
      tr.dataset.index = i;
      tr.innerHTML = `
        <td class="nombre">${escapeHTML(e.nombre)}</td>
        <td class="correo">${escapeHTML(e.correo)}</td>
        <td class="telefono">${escapeHTML(e.telefono || '')}</td>
        <td class="curso">${escapeHTML(e.curso)}</td>
        <td class="estado">${escapeHTML(e.estado)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary editar">Editar</button>
          <button class="btn btn-sm btn-outline-danger eliminar">Eliminar</button>
        </td>`;
      tablaBody.append(tr);
    }
  });
  contador.textContent = visibles;
  actualizarGraficos();
  obtenerCursos();
  obtenerEstados();
  attachRowHandlers();
}

function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function attachRowHandlers() {
  document.querySelectorAll('#tabla .editar').forEach(btn => {
    btn.onclick = function() {
      const tr = this.closest('tr');
      const idx = parseInt(tr.dataset.index);
      iniciarEdicion(idx, tr);
    };
  });
  document.querySelectorAll('#tabla .eliminar').forEach(btn => {
    btn.onclick = function() {
      const tr = this.closest('tr');
      const idx = parseInt(tr.dataset.index);
      if (confirm('Eliminar estudiante?')) {
        estudiantes.splice(idx,1);
        guardar();
      }
    };
  });
}

function iniciarEdicion(index, tr) {
  const est = estudiantes[index];
  editIndex = index;
  tr.querySelector('.nombre').innerHTML = `<input class="form-control form-control-sm inline-input" value="${escapeHTML(est.nombre)}" data-field="nombre">`;
  tr.querySelector('.correo').innerHTML = `<input class="form-control form-control-sm inline-input" value="${escapeHTML(est.correo)}" data-field="correo">`;
  tr.querySelector('.telefono').innerHTML = `<input class="form-control form-control-sm inline-input" value="${escapeHTML(est.telefono||'')}" data-field="telefono">`;
  tr.querySelector('.curso').innerHTML = `<input class="form-control form-control-sm inline-input" value="${escapeHTML(est.curso)}" data-field="curso">`;
  tr.querySelector('.estado').innerHTML = `<select class="form-select form-select-sm" data-field="estado">
    <option value="Primer contacto"${est.estado==='Primer contacto'?' selected':''}>🟡 Primer contacto</option>
    <option value="Interesado"${est.estado==='Interesado'?' selected':''}>🟠 Interesado</option>
    <option value="Evaluación"${est.estado==='Evaluación'?' selected':''}>🔵 En evaluación</option>
    <option value="Matriculado"${est.estado==='Matriculado'?' selected':''}>🟢 Matriculado</option>
    <option value="Egresado"${est.estado==='Egresado'?' selected':''}>⚪ Egresado</option>
  </select>`;
  const actions = tr.querySelector('td:last-child');
  actions.innerHTML = `<button class="btn btn-sm btn-success guardar">Guardar</button> <button class="btn btn-sm btn-secondary cancelar">Cancelar</button>`;
  actions.querySelector('.guardar').onclick = function() {
    const updated = {
      nombre: tr.querySelector('input[data-field=nombre]').value,
      correo: tr.querySelector('input[data-field=correo]').value,
      telefono: tr.querySelector('input[data-field=telefono]').value,
      curso: tr.querySelector('input[data-field=curso]').value,
      estado: tr.querySelector('select[data-field=estado]').value
    };
    estudiantes[index] = updated;
    guardar();
    editIndex = null;
  };
  actions.querySelector('.cancelar').onclick = function() {
    editIndex = null;
    renderizar();
  };
}

formulario.addEventListener('submit', e => {
  e.preventDefault();
  const nuevo = {
    nombre: document.getElementById('nombre').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    curso: document.getElementById('curso').value.trim(),
    estado: document.getElementById('estado').value
  };
  if (!nuevo.nombre || !nuevo.correo) { alert('Nombre y correo requeridos'); return; }
  if (editIndex !== null) {
    estudiantes[editIndex] = nuevo;
    editIndex = null;
  } else {
    estudiantes.push(nuevo);
  }
  guardar();
  formulario.reset();
});

[buscador, filtroEstado, filtroCurso].forEach(el => el.addEventListener('input', renderizar));
function limpiarFiltros() { buscador.value=''; filtroEstado.value=''; filtroCurso.value=''; renderizar(); }

function actualizarGraficos() {
  const estados = {};
  const cursos = {};
  estudiantes.forEach(e => {
    estados[e.estado] = (estados[e.estado]||0)+1;
    cursos[e.curso] = (cursos[e.curso]||0)+1;
  });
  const estadoCtx = document.getElementById('graficoEstado').getContext('2d');
  const cursoCtx = document.getElementById('graficoCurso').getContext('2d');
  if (chartEstado) chartEstado.destroy();
  if (chartCurso) chartCurso.destroy();
  chartEstado = new Chart(estadoCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(estados),
      datasets: [{ label:'Cantidad', data: Object.values(estados), backgroundColor: ['#f0ad4e','#5bc0de','#5cb85c','#337ab7','#d9534f'] }]
    },
    options: { responsive:true, plugins:{legend:{display:false}} }
  });
  chartCurso = new Chart(cursoCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(cursos),
      datasets: [{ data: Object.values(cursos), backgroundColor: ['#8e44ad','#3498db','#27ae60','#f39c12','#c0392b'] }]
    },
    options: { responsive:true }
  });
}

function exportarCSV() {
  const cabeceras = ['Nombre','Correo','Teléfono','Curso','Estado'];
  const filas = estudiantes.map(e => [e.nombre,e.correo,e.telefono,e.curso,e.estado]);
  let csv = [cabeceras, ...filas].map(r => r.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='estudiantes.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

renderizar();
