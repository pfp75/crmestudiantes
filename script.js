
let estudiantes = [];
document.addEventListener('DOMContentLoaded', () => {
    fetch('estudiantes.json')
        .then(res => res.json())
        .then(data => {
            estudiantes = data;
            renderTabla(estudiantes);
        });
    document.getElementById('modo-oscuro-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});

function renderTabla(lista) {
    const tabla = document.getElementById('tabla-estudiantes');
    tabla.innerHTML = '<tr><th>Nombre</th><th>Grupo</th><th>Estado</th></tr>';
    lista.forEach(est => {
        tabla.innerHTML += `<tr><td>${est.nombre}</td><td>${est.grupo}</td><td>${est.estado}</td></tr>`;
    });
}

function filtrarSegmento(tipo) {
    if (tipo === 'todos') {
        renderTabla(estudiantes);
    } else if (tipo === 'riesgo') {
        renderTabla(estudiantes.filter(e => e.estado === 'En riesgo'));
    }
}
