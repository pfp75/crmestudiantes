
document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("listaEstudiantes");
  const form = document.getElementById("formEstudiante");
  const estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];

  function renderEstudiantes() {
    lista.innerHTML = "";
    estudiantes.forEach((e, index) => {
      const li = document.createElement("li");
      li.textContent = `${e.nombre} (${e.grupo}) - ${e.correo}`;
      lista.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nuevo = {
      nombre: document.getElementById("nombre").value,
      grupo: document.getElementById("grupo").value,
      correo: document.getElementById("correo").value,
    };
    estudiantes.push(nuevo);
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
    renderEstudiantes();
    form.reset();
  });

  renderEstudiantes();
});

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
