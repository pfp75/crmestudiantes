let estudiantes = [];
let modoOscuro = false;

document.getElementById("toggleDarkMode").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    modoOscuro = !modoOscuro;
});

function mostrarSeccion(id) {
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
    document.getElementById(id).classList.remove("oculto");
}

function filtrarSegmento(tipo) {
    const lista = document.getElementById("lista-estudiantes");
    lista.innerHTML = "";

    const filtrados = tipo === "en_riesgo" ? estudiantes.filter(e => e.segmento === "en_riesgo") : estudiantes;

    filtrados.forEach(est => {
        const li = document.createElement("li");
        li.textContent = `${est.nombre} (${est.grupo})`;
        lista.appendChild(li);
    });
}

fetch("estudiantes.json")
    .then(resp => resp.json())
    .then(data => {
        estudiantes = data;
        filtrarSegmento("todos");
    });