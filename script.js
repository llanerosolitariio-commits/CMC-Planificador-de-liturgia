const input = document.getElementById('taskInput');
const btn = document.getElementById('addBtn');
const list = document.getElementById('taskList');

// Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', getTasks);

btn.addEventListener('click', addTask);

function addTask() {
    if (input.value === '') return;

    createTaskElement(input.value);
    saveLocal(input.value);
    input.value = '';
}

function createTaskElement(text) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>> ${text}</span>
        <span class="delete-btn" onclick="removeTask(this)">[ELIMINAR]</span>
    `;
    list.appendChild(li);
}

function saveLocal(task) {
    let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasks() {
    let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    tasks.forEach(task => createTaskElement(task));
}

function removeTask(element) {
    const taskText = element.parentElement.innerText.replace('> ', '').replace(' [ELIMINAR]', '').trim();
    element.parentElement.remove();
    
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    const filteredTasks = tasks.filter(t => t !== taskText);
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));
}