const formulario = document.getElementById("formulario");
const tabla = document.getElementById("tabla").getElementsByTagName("tbody")[0];
const contador = document.getElementById("contador");
const busqueda = document.getElementById("busqueda");

let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];

function guardarEstudiantes() {
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
}

function renderTabla() {
    tabla.innerHTML = "";
    let filtro = busqueda.value.toLowerCase();
    let visibles = 0;
    estudiantes.forEach((e, i) => {
        if (e.nombre.toLowerCase().includes(filtro) || e.correo.toLowerCase().includes(filtro)) {
            const fila = tabla.insertRow();
            fila.innerHTML = `
                <td>${e.nombre}</td>
                <td>${e.correo}</td>
                <td>${e.curso}</td>
                <td>${e.estado}</td>
                <td><button onclick="eliminar(${i})">Eliminar</button></td>`;
            visibles++;
        }
    });
    contador.textContent = visibles;
    actualizarGraficos();
}

formulario.addEventListener("submit", e => {
    e.preventDefault();
    const nuevo = {
        nombre: document.getElementById("nombre").value,
        correo: document.getElementById("correo").value,
        curso: document.getElementById("curso").value,
        estado: document.getElementById("estado").value
    };
    estudiantes.push(nuevo);
    guardarEstudiantes();
    formulario.reset();
    renderTabla();
});

busqueda.addEventListener("input", renderTabla);

function eliminar(index) {
    estudiantes.splice(index, 1);
    guardarEstudiantes();
    renderTabla();
}

function exportarCSV() {
    const filas = [["Nombre", "Correo", "Curso", "Estado"]];
    estudiantes.forEach(e => filas.push([e.nombre, e.correo, e.curso, e.estado]));
    const csv = filas.map(f => f.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "estudiantes.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// Chart.js
let chartEstado, chartCurso;
function actualizarGraficos() {
    const estados = {};
    const cursos = {};
    estudiantes.forEach(e => {
        estados[e.estado] = (estados[e.estado] || 0) + 1;
        cursos[e.curso] = (cursos[e.curso] || 0) + 1;
    });

    const estadoCtx = document.getElementById("graficoEstado").getContext("2d");
    const cursoCtx = document.getElementById("graficoCurso").getContext("2d");

    if (chartEstado) chartEstado.destroy();
    if (chartCurso) chartCurso.destroy();

    chartEstado = new Chart(estadoCtx, {
        type: "bar",
        data: {
            labels: Object.keys(estados),
            datasets: [{
                label: "Cantidad",
                data: Object.values(estados),
                backgroundColor: "#42a5f5"
            }]
        }
    });

    chartCurso = new Chart(cursoCtx, {
        type: "pie",
        data: {
            labels: Object.keys(cursos),
            datasets: [{
                label: "Cantidad",
                data: Object.values(cursos),
                backgroundColor: ["#66bb6a", "#ef5350", "#ffa726", "#ab47bc", "#29b6f6"]
            }]
        }
    });
}

renderTabla();
