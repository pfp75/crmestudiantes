let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];

function guardarEstudiantes() {
  localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
}

function renderizarEstudiantes(filtro = "") {
  const lista = document.getElementById("lista-estudiantes");
  lista.innerHTML = "";

  estudiantes
    .filter(e => e.nombre.toLowerCase().includes(filtro.toLowerCase()))
    .forEach((est, index) => {
      lista.innerHTML += `
        <tr>
          <td>${est.nombre}</td>
          <td>${est.correo}</td>
          <td>${est.telefono}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarEstudiante(${index})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarEstudiante(${index})">Eliminar</button>
          </td>
        </tr>
      `;
    });
}

document.getElementById("formulario").addEventListener("submit", function(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (nombre && correo && telefono) {
    estudiantes.push({ nombre, correo, telefono });
    guardarEstudiantes();
    renderizarEstudiantes();
    this.reset();
  }
});

function eliminarEstudiante(index) {
  if (confirm("¿Estás seguro de eliminar este estudiante?")) {
    estudiantes.splice(index, 1);
    guardarEstudiantes();
    renderizarEstudiantes();
  }
}

function editarEstudiante(index) {
  const est = estudiantes[index];
  document.getElementById("nombre").value = est.nombre;
  document.getElementById("correo").value = est.correo;
  document.getElementById("telefono").value = est.telefono;

  estudiantes.splice(index, 1);
  guardarEstudiantes();
  renderizarEstudiantes();
}

document.getElementById("buscador").addEventListener("input", function () {
  renderizarEstudiantes(this.value);
});

renderizarEstudiantes();
