
let estudiantes = [];
let modoOscuro = false;

document.addEventListener("DOMContentLoaded", () => {
    cargarEstudiantes();
    document.getElementById("modoOscuroBtn").addEventListener("click", toggleModoOscuro);
});

function agregarEstudiante() {
    const nombre = document.getElementById("nombre").value;
    const grupo = document.getElementById("grupo").value;
    const correo = document.getElementById("correo").value;
    if (nombre && grupo && correo) {
        estudiantes.push({ nombre, grupo, correo, riesgo: Math.random() < 0.3 });
        actualizarVista();
    }
}

function actualizarVista() {
    const tabla = document.getElementById("tabla-estudiantes");
    tabla.innerHTML = "";
    estudiantes.forEach(est => {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td>${est.nombre}</td><td>${est.grupo}</td><td>${est.correo}</td><td>${est.riesgo ? "En Riesgo" : "Bien"}</td>`;
        tabla.appendChild(fila);
    });
    document.getElementById("total-estudiantes").textContent = estudiantes.length;
    document.getElementById("total-riesgo").textContent = estudiantes.filter(e => e.riesgo).length;
}

function mostrarTodos() {
    actualizarVista();
}

function mostrarEnRiesgo() {
    const tabla = document.getElementById("tabla-estudiantes");
    tabla.innerHTML = "";
    const enRiesgo = estudiantes.filter(e => e.riesgo);
    enRiesgo.forEach(est => {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td>${est.nombre}</td><td>${est.grupo}</td><td>${est.correo}</td><td>En Riesgo</td>`;
        tabla.appendChild(fila);
    });
    document.getElementById("total-estudiantes").textContent = estudiantes.length;
    document.getElementById("total-riesgo").textContent = enRiesgo.length;
}

function toggleModoOscuro() {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle("oscuro", modoOscuro);
}

function cargarEstudiantes() {
    fetch("estudiantes.json")
        .then(res => res.json())
        .then(data => {
            estudiantes = data;
            actualizarVista();
        })
        .catch(() => actualizarVista());
}
