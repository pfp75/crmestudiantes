
const clientes = [
  {
    nombre: "Carlos Méndez",
    metodoPago: "Tarjeta",
    productos: ["Arroz", "Frijoles"],
    factura: "001",
    estado: "Frecuente",
    notas: "Prefiere los lunes",
    historial: [
      { fecha: "2025-08-01", productos: ["Arroz", "Café"], total: 4500 },
      { fecha: "2025-08-05", productos: ["Frijoles"], total: 2000 }
    ]
  }
];

function mostrar(seccionId) {
  document.querySelectorAll('.seccion').forEach(div => div.style.display = 'none');
  document.getElementById(seccionId).style.display = 'block';
}

function renderClientes() {
  const contenedor = document.getElementById("lista-clientes");
  contenedor.innerHTML = "";
  clientes.forEach(cliente => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${cliente.nombre}</strong><br>
      Método de pago: ${cliente.metodoPago}<br>
      Productos: ${cliente.productos.join(", ")}<br>
      Factura: ${cliente.factura}<br>
      Estado: ${cliente.estado}<br>
      Notas: ${cliente.notas}<br>
      <hr>`;
    contenedor.appendChild(div);
  });
}

function exportarCSV() {
  let csv = "Nombre,Método de Pago,Productos,Factura,Estado,Notas\n";
  clientes.forEach(c => {
    csv += `${c.nombre},${c.metodoPago},"${c.productos.join(";")}",${c.factura},${c.estado},${c.notas}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "clientes.csv";
  link.click();
}

document.addEventListener("DOMContentLoaded", () => {
  renderClientes();
});
