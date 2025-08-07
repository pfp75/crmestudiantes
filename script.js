
document.addEventListener('DOMContentLoaded', function () {
    mostrarClientes();

    // Al iniciar, mostrar sección de clientes
    mostrarSeccion('clientes');
});

function mostrarSeccion(id) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(s => s.classList.add('oculto'));
    document.getElementById(id).classList.remove('oculto');

    if (id === 'clientes') mostrarClientes();
    if (id === 'facturas') mostrarFacturas();
    if (id === 'productos') mostrarProductos();
}

function toggleModoOscuro() {
    document.body.classList.toggle('modo-oscuro');
}

function mostrarClientes() {
    const clientes = Array.from({ length: 50 }, (_, i) => ({
        nombre: `Cliente ${i + 1}`,
        telefono: `8888-00${i}`,
        correo: `cliente${i + 1}@correo.com`
    }));
    const contenedor = document.getElementById('lista-clientes');
    contenedor.innerHTML = clientes.map(c => `
        <div><strong>${c.nombre}</strong> - ${c.telefono} - ${c.correo}</div>
    `).join('');
}

function mostrarFacturas() {
    const facturas = Array.from({ length: 20 }, (_, i) => ({
        numero: 1000 + i,
        cliente: `Cliente ${i + 1}`,
        metodo: ['Efectivo', 'Tarjeta', 'Transferencia'][i % 3]
    }));
    const contenedor = document.getElementById('lista-facturas');
    contenedor.innerHTML = facturas.map(f => `
        <div><strong>Factura #${f.numero}</strong> - Cliente: ${f.cliente} - Pago: ${f.metodo}</div>
    `).join('');
}

function mostrarProductos() {
    const productos = ['Arroz', 'Frijoles', 'Leche', 'Pan', 'Jugo'];
    const contenedor = document.getElementById('lista-productos');
    contenedor.innerHTML = productos.map(p => `
        <div><strong>Producto:</strong> ${p}</div>
    `).join('');
}
