let lastContent = "";
let lastTitle = "";
const SUPABASE_URL = "https://jbrgwyyaxklaxecrekff.supabase.co";
const SUPABASE_KEY = "sb_publishable_PUeEC04dQl1u0sun3hwCEw_HWm8IigR";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



let tasks = [];

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const progress = document.getElementById("progress");

// Carregar tarefas ao abrir
window.addEventListener("load", loadTasks);

// Adicionar tarefa
addTaskBtn.addEventListener("click", addTask);

async function loadTasks() {
    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*");

    if (error) {
        console.error("Erro ao carregar tarefas:", error);
        return;
    }

    tasks = data;
    renderTasks();
}

async function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Digite uma tarefa!");
        return;
    }

    const { error } = await supabaseClient
        .from("tasks")
        .insert([{
            text: taskText,
            completed: false
        }]);

    if (error) {
        console.error("Erro ao adicionar:", error);
        return;
    }

    taskInput.value = "";
    loadTasks();
}

// Renderizar tarefas
function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.add("task-item");

        li.innerHTML = `
            <span style="
                text-decoration: ${task.completed ? "line-through" : "none"};
                opacity: ${task.completed ? "0.6" : "1"};
            ">
                ${task.text}
            </span>

            <div>
                <button onclick="toggleTask(${task.id})">
                    ${task.completed ? "Desfazer" : "Concluir"}
                </button>

                <button onclick="deleteTask(${task.id})">
                    Excluir
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });

    updateStats();
}

// Concluir tarefa
async function toggleTask(id) {
    const task = tasks.find(t => t.id == id);

    const { error } = await supabaseClient
        .from("tasks")
        .update({
            completed: !task.completed
        })
        .eq("id", id);

    if (error) {
        console.error("Erro ao atualizar:", error);
        return;
    }

    loadTasks();
}

// Excluir tarefa
async function deleteTask(id) {
    const { error } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir:", error);
        return;
    }

    loadTasks();
}

// Atualizar estatísticas
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    progress.textContent = `${percentage}%`;
}

// API WIKIPEDIA
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchResult = document.getElementById("searchResult");

searchBtn.addEventListener("click", searchContent);

async function searchContent() {
    const query = searchInput.value.trim();

    if (query === "") {
        alert("Digite um assunto!");
        return;
    }

    searchResult.innerHTML = "Pesquisando...";

    try {
        const response = await fetch(
            `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("Conteúdo não encontrado");
        }

        const data = await response.json();

        searchResult.innerHTML = `
            <h3>${data.title}</h3>
            <p>${data.extract || "Sem resumo disponível."}</p>
        `;
    } catch (error) {
        searchResult.innerHTML = `
            <p>Não foi possível encontrar esse conteúdo.</p>
        `;
    }
}

lastContent = data.extract;

searchResult.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.extract}</p>
`;