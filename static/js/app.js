let tasks = [];

const modal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");


// ==============================
// CARGAR TAREAS
// ==============================

async function loadTasks() {

    const response = await fetch("/api/tasks");

    tasks = await response.json();

    renderAll();
}


// ==============================
// CREAR TAREA
// ==============================

taskForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    const category = document.getElementById("taskCategory").value;

    const response = await fetch("/api/tasks", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title,
            description,
            priority,
            category
        })

    });

    if (response.ok) {

        taskForm.reset();

        closeModal();

        await loadTasks();

    }

});


// ==============================
// COMPLETAR TAREA
// ==============================

async function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    await fetch(`/api/tasks/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            completed: !task.completed
        })

    });

    await loadTasks();
}


// ==============================
// ELIMINAR TAREA
// ==============================

async function deleteTask(id) {

    const confirmDelete = confirm(
        "¿Seguro que quieres eliminar esta tarea?"
    );

    if (!confirmDelete) return;

    await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
    });

    await loadTasks();
}


// ==============================
// CREAR HTML DE UNA TAREA
// ==============================

function createTaskHTML(task) {

    return `

        <div class="task ${task.completed ? "completed" : ""}">

            <button
                class="check-task"
                onclick="toggleTask(${task.id})"
            >
                ${task.completed ? "✓" : ""}
            </button>


            <div class="task-content">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                <div class="task-description">
                    ${escapeHTML(task.description || "Sin descripción")}
                </div>

                <div class="task-meta">

                    <span class="badge priority-${task.priority}">
                        ${capitalize(task.priority)}
                    </span>

                    <span class="badge category">
                        ${escapeHTML(task.category)}
                    </span>

                </div>

            </div>


            <div class="task-actions">

                <button
                    class="icon-button delete-button"
                    onclick="deleteTask(${task.id})"
                    title="Eliminar"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </div>
    `;
}


// ==============================
// RENDERIZAR TAREAS
// ==============================

function renderAll() {

    updateStats();

    renderRecentTasks();

    renderAllTasks();

    renderCompletedTasks();

}


// ==============================
// ESTADÍSTICAS
// ==============================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);


    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("progressPercentage").textContent =
        percentage + "%";


    document.getElementById("circlePercentage").textContent =
        percentage + "%";

    document.getElementById("progressCompleted").textContent =
        completed;

    document.getElementById("progressPending").textContent =
        pending;


    const circle =
        document.querySelector(".progress-circle");

    circle.style.background =
        `conic-gradient(
            var(--primary) ${percentage * 3.6}deg,
            #eeeeee ${percentage * 3.6}deg
        )`;


    const high =
        tasks.filter(task => task.priority === "alta").length;

    const medium =
        tasks.filter(task => task.priority === "media").length;

    const low =
        tasks.filter(task => task.priority === "baja").length;


    document.getElementById("highPriority").textContent = high;

    document.getElementById("mediumPriority").textContent = medium;

    document.getElementById("lowPriority").textContent = low;
}


// ==============================
// TAREAS RECIENTES
// ==============================

function renderRecentTasks() {

    const container =
        document.getElementById("recentTasks");

    const recent =
        [...tasks]
            .reverse()
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-clipboard-list"></i>
                <p>No tienes tareas todavía.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        recent
            .map(createTaskHTML)
            .join("");
}


// ==============================
// TODAS LAS TAREAS
// ==============================

function renderAllTasks() {

    const container =
        document.getElementById("allTasks");

    const search =
        document.getElementById("searchInput").value
        .toLowerCase();

    const priority =
        document.getElementById("priorityFilter").value;

    const category =
        document.getElementById("categoryFilter").value;


    const filtered =
        tasks.filter(task => {

            const matchesSearch =
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search);


            const matchesPriority =
                priority === "all" ||
                task.priority === priority;


            const matchesCategory =
                category === "all" ||
                task.category === category;


            return (
                matchesSearch &&
                matchesPriority &&
                matchesCategory
            );

        });


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>No encontramos tareas.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(createTaskHTML)
            .join("");
}


// ==============================
// COMPLETADAS
// ==============================

function renderCompletedTasks() {

    const container =
        document.getElementById("completedList");

    const completed =
        tasks.filter(task => task.completed);


    if (completed.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-circle-check"></i>
                <p>Aún no tienes tareas completadas.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        completed
            .map(createTaskHTML)
            .join("");
}


// ==============================
// FILTROS
// ==============================

document
    .getElementById("searchInput")
    .addEventListener("input", renderAllTasks);


document
    .getElementById("priorityFilter")
    .addEventListener("change", renderAllTasks);


document
    .getElementById("categoryFilter")
    .addEventListener("change", renderAllTasks);


// ==============================
// MODAL
// ==============================

document
    .getElementById("newTaskButton")
    .addEventListener("click", openModal);


document
    .getElementById("closeModal")
    .addEventListener("click", closeModal);


document
    .getElementById("cancelButton")
    .addEventListener("click", closeModal);


function openModal() {

    modal.classList.add("active");

    document.getElementById("taskTitle").focus();
}


function closeModal() {

    modal.classList.remove("active");
}


// ==============================
// NAVEGACIÓN
// ==============================

const navItems =
    document.querySelectorAll(".nav-item");


navItems.forEach(button => {

    button.addEventListener("click", () => {

        navItems.forEach(item =>
            item.classList.remove("active")
        );

        button.classList.add("active");

        showSection(button.dataset.section);

    });

});


function showSection(section) {

    document
        .getElementById("dashboardSection")
        .classList.add("hidden");

    document
        .getElementById("tasksSection")
        .classList.add("hidden");

    document
        .getElementById("completedSection")
        .classList.add("hidden");


    if (section === "dashboard") {

        document
            .getElementById("dashboardSection")
            .classList.remove("hidden");

    }


    if (section === "tasks") {

        document
            .getElementById("tasksSection")
            .classList.remove("hidden");

    }


    if (section === "completed") {

        document
            .getElementById("completedSection")
            .classList.remove("hidden");

    }

}


// ==============================
// VER TODAS
// ==============================

document
    .getElementById("viewAllButton")
    .addEventListener("click", () => {

        showSection("tasks");

        navItems.forEach(item =>
            item.classList.remove("active")
        );

        document
            .querySelector('[data-section="tasks"]')
            .classList.add("active");

    });


// ==============================
// ELIMINAR COMPLETADAS
// ==============================

document
    .getElementById("clearCompleted")
    .addEventListener("click", async () => {

        const confirmDelete =
            confirm(
                "¿Quieres eliminar todas las tareas completadas?"
            );

        if (!confirmDelete) return;

        await fetch(
            "/api/tasks/clear-completed",
            {
                method: "DELETE"
            }
        );

        await loadTasks();

    });


// ==============================
// MODO OSCURO
// ==============================

document
    .getElementById("themeButton")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const icon =
            document.querySelector("#themeButton i");

        if (document.body.classList.contains("dark")) {

            icon.className = "fa-solid fa-sun";

        } else {

            icon.className = "fa-solid fa-moon";

        }

    });


// ==============================
// UTILIDADES
// ==============================

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
           text.slice(1);

}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==============================
// INICIAR
// ==============================

loadTasks();
