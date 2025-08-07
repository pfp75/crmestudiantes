
const content = document.getElementById('content');

function navigate(section) {
    fetch(`${section}.html`)
        .then(response => response.text())
        .then(html => {
            content.innerHTML = html;
        })
        .catch(err => {
            content.innerHTML = "<p>Error al cargar el contenido.</p>";
        });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}
