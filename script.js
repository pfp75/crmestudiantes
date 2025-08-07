document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("dark-mode-toggle");
    const body = document.body;

    toggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
    });
});

function showSection(id) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
}
