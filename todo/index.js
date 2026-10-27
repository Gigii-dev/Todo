const todoForm = document.getElementById('todoForm');
const textarea = document.getElementById('todoInput');
const todoContainer = document.getElementById('todoContainer');

const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const remainingCount = document.getElementById('remainingCount');

const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');

const filterBtns = document.querySelectorAll('.filterBtn');

let todoList = [];
let currentFilter = 'all';
let editingId = null;


function initialLoad() {
    try {
        const savedData = JSON.parse(localStorage.getItem('todos'));

        if (savedData && Array.isArray(savedData.todoList)) {
            todoList = savedData.todoList.map((todo, index) => {
                if (typeof todo === 'string') {
                    return {
                        id: `old-${index}`,
                        text: todo,
                        completed: false
                    };
                }

                return {
                    id: todo.id ?? `old-${index}`,
                    text: todo.text ?? '',
                    completed: Boolean(todo.completed)
                };
            });
        }
    } catch (error) {
        console.error('Could not load saved tasks:', error);
        todoList = [];
    }

    updateUI();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify({ todoList }));
}


todoForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const text = textarea.value.trim();

    if (!text) {
        textarea.focus();
        return;
    }

    if (editingId !== null) {
        const task = todoList.find(todo => todo.id === editingId);

        if (task) {
            task.text = text;
        }

        editingId = null;
        document.querySelector('#addBtn span').textContent = 'Add Task';
        document.querySelector('#addBtn i').className = 'fa-solid fa-plus';
    } else {
        todoList.push({
            id: Date.now(),
            text: text,
            completed: false
        });
    }

    textarea.value = '';
    saveTodos();
    updateUI();
});


function editTodo(id) {
    const task = todoList.find(todo => todo.id === id);

    if (!task) return;

    textarea.value = task.text;
    editingId = id;

    document.querySelector('#addBtn span').textContent = 'Save Changes';
    document.querySelector('#addBtn i').className = 'fa-solid fa-check';

    textarea.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTodo(id) {
    todoList = todoList.filter(todo => todo.id !== id);

    if (editingId === id) {
        editingId = null;
        textarea.value = '';

        document.querySelector('#addBtn span').textContent = 'Add Task';
        document.querySelector('#addBtn i').className = 'fa-solid fa-plus';
    }

    saveTodos();
    updateUI();
}

function toggleTodo(id) {
    const task = todoList.find(todo => todo.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTodos();
    updateUI();
}

filterBtns.forEach(button => {
    button.addEventListener('click', function () {
        currentFilter = button.dataset.filter;

        filterBtns.forEach(btn => {
            const isActive = btn === button;

            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        updateUI();
    });
});


function updateStats() {
    const total = todoList.length;

    const completed = todoList.filter(todo => todo.completed).length;

    const remaining = total - completed;

    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalCount.textContent = total;
    completedCount.textContent = completed;
    remainingCount.textContent = remaining;

    progressText.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
}


function updateUI() {
    updateStats();

    let filteredTodos = todoList;

    if (currentFilter === 'active') {
        filteredTodos = todoList.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todoList.filter(todo => todo.completed);
    }

    todoContainer.replaceChildren();

    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'emptyMessage';

        const icon = document.createElement('i');
        icon.className = currentFilter === 'completed'
            ? 'fa-solid fa-circle-check'
            : 'fa-solid fa-clipboard-list';

        const message = document.createElement('p');

        if (currentFilter === 'completed') {
            message.textContent = 'No completed tasks yet.';
        } else if (currentFilter === 'active') {
            message.textContent = 'You have no active tasks. Great job!';
        } else {
            message.textContent = 'No tasks yet. Add your first task!';
        }

        emptyMessage.append(icon, message);
        todoContainer.appendChild(emptyMessage);
        saveTodos();
        return;
    }

    filteredTodos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = 'todo';

        if (todo.completed) {
            todoElement.classList.add('completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'taskCheckbox';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', 'Mark task as completed');

        checkbox.addEventListener('change', () => {
            toggleTodo(todo.id);
        });

        const taskText = document.createElement('p');
        taskText.className = 'taskText';
        taskText.textContent = todo.text;

        const taskContent = document.createElement('div');
        taskContent.className = 'taskContent';
        taskContent.append(checkbox, taskText);

        const btnContainer = document.createElement('div');
        btnContainer.className = 'btnContainer';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'iconBtn';
        editBtn.setAttribute('aria-label', 'Edit task');
        editBtn.title = 'Edit task';

        const editIcon = document.createElement('i');
        editIcon.className = 'fa-solid fa-pen-to-square';
        editBtn.appendChild(editIcon);

        editBtn.addEventListener('click', () => {
            editTodo(todo.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'iconBtn deleteBtn';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.title = 'Delete task';

        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fa-solid fa-trash';
        deleteBtn.appendChild(deleteIcon);

        deleteBtn.addEventListener('click', () => {
            deleteTodo(todo.id);
        });

        btnContainer.append(editBtn, deleteBtn);
        todoElement.append(taskContent, btnContainer);
        todoContainer.appendChild(todoElement);
    });

    saveTodos();
}

initialLoad();
