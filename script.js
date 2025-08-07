
const secciones = document.querySelectorAll('.seccion');

function mostrarSeccion(id) {
    secciones.forEach(sec => {
        sec.style.display = (sec.id === id) ? 'block' : 'none';
    });
}

document.getElementById('modoOscuroBtn').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Datos ficticios
const clientes = Array.from({length: 50}, (_, i) => ({
    nombre: `Cliente ${i+1}`,
    metodoPago: ['Efectivo', 'Tarjeta', 'Transferencia'][i % 3]
}));

const productos = ['Arroz', 'Frijoles', 'Leche', 'Pan', 'Huevos', 'Café'];
const facturas = clientes.map((cliente, i) => ({
    numero: 1000 + i,
    cliente: cliente.nombre,
    metodoPago: cliente.metodoPago,
    producto: productos[i % productos.length],
    cantidad: Math.floor(Math.random() * 5) + 1
}));

function cargarClientes() {
    const div = document.getElementById('tablaClientes');
    div.innerHTML = '<table><tr><th>Nombre</th><th>Método de Pago</th></tr>' +
        clientes.map(c => `<tr><td>${c.nombre}</td><td>${c.metodoPago}</td></tr>`).join('') +
        '</table>';
}

function cargarFacturas() {
    const div = document.getElementById('tablaFacturas');
    div.innerHTML = '<table><tr><th># Factura</th><th>Cliente</th><th>Método de Pago</th><th>Producto</th><th>Cantidad</th></tr>' +
        facturas.map(f => `<tr><td>${f.numero}</td><td>${f.cliente}</td><td>${f.metodoPago}</td><td>${f.producto}</td><td>${f.cantidad}</td></tr>`).join('') +
        '</table>';
}

function cargarProductos() {
    const div = document.getElementById('tablaProductos');
    div.innerHTML = '<ul>' +
        productos.map(p => `<li>${p}</li>`).join('') +
        '</ul>';
}

function cargarReportes() {
    const ctx = document.getElementById('graficoProductos').getContext('2d');
    const conteo = {};
    facturas.forEach(f => {
        conteo[f.producto] = (conteo[f.producto] || 0) + f.cantidad;
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(conteo),
            datasets: [{
                label: 'Productos vendidos',
                data: Object.values(conteo)
            }]
        }
    });
}

window.onload = function() {
    cargarClientes();
    cargarFacturas();
    cargarProductos();
    cargarReportes();
};
