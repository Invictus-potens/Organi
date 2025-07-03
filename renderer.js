document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoTasksContainer = document.getElementById('todo-tasks');
    const inprogressTasksContainer = document.getElementById('inprogress-tasks');
    const doneTasksContainer = document.getElementById('done-tasks');

    let tasks = {
        todo: [],
        inprogress: [],
        done: []
    };

    // Function to create a task element
    function createTaskElement(taskText, id) {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.setAttribute('draggable', true);
        taskElement.setAttribute('id', `task-${id}`);
        taskElement.textContent = taskText;
        // Add drag start listener later
        return taskElement;
    }

    // Function to render tasks in their respective columns
    function renderTasks() {
        // Clear existing tasks
        todoTasksContainer.innerHTML = '';
        inprogressTasksContainer.innerHTML = '';
        doneTasksContainer.innerHTML = '';

        tasks.todo.forEach((task, index) => {
            // For simplicity, using array index as part of ID for now.
            // A more robust ID system (e.g., UUID) would be better for a real app.
            const taskElement = createTaskElement(task.text, `todo-${index}`);
            todoTasksContainer.appendChild(taskElement);
        });

        tasks.inprogress.forEach((task, index) => {
            const taskElement = createTaskElement(task.text, `inprogress-${index}`);
            inprogressTasksContainer.appendChild(taskElement);
        });

        tasks.done.forEach((task, index) => {
            const taskElement = createTaskElement(task.text, `done-${index}`);
            doneTasksContainer.appendChild(taskElement);
        });

        // Add drag and drop listeners to tasks and columns after rendering
        addDragAndDropListeners();
    }

    // Function to add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        // Add to the 'todo' list by default
        // Simple ID generation for now
        const newTask = { id: Date.now().toString(), text: taskText, status: 'todo' };
        tasks.todo.push(newTask);

        taskInput.value = ''; // Clear input
        renderTasks();
        // saveTasksToLocalStorage(); // Will add later
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // --- Drag and Drop Functionality (Initial Placeholder) ---
    function addDragAndDropListeners() {
        const taskItems = document.querySelectorAll('.task-item');
        const columns = document.querySelectorAll('.tasks-container');

        taskItems.forEach(task => {
            task.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.target.classList.add('dragging');
                console.log('Drag Start:', e.target.id);
            });

            task.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                console.log('Drag End');
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow drop
                // console.log('Drag Over Column:', column.id);
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                const draggedElement = document.getElementById(taskId);
                const targetColumnId = e.target.closest('.kanban-column').id; // Get the main column ID
                const targetTasksContainer = e.target.closest('.tasks-container');


                if (draggedElement && targetTasksContainer) {
                    // Logic to update task status and re-render
                    const taskDataId = taskId.split('-')[1]; // e.g., "todo-0" -> "todo", "0"
                    const taskType = taskId.split('-')[0];


                    let taskIndex = -1;
                    let taskToMove;

                    // Find and remove task from original array
                    if (taskType === 'todo') {
                        taskIndex = tasks.todo.findIndex(t => t.id.toString().includes(taskDataId) || taskId.includes(t.id.toString())); // Looser match for initial simple IDs
                         // Fallback for simple index based IDs if full ID not matched
                        if(taskIndex === -1) taskIndex = tasks.todo.findIndex(t => `task-todo-${tasks.todo.indexOf(t)}` === taskId);
                        if (taskIndex > -1) {
                            taskToMove = tasks.todo.splice(taskIndex, 1)[0];
                        }
                    } else if (taskType === 'inprogress') {
                        taskIndex = tasks.inprogress.findIndex(t => t.id.toString().includes(taskDataId) || taskId.includes(t.id.toString()));
                        if(taskIndex === -1) taskIndex = tasks.inprogress.findIndex(t => `task-inprogress-${tasks.inprogress.indexOf(t)}` === taskId);
                        if (taskIndex > -1) {
                            taskToMove = tasks.inprogress.splice(taskIndex, 1)[0];
                        }
                    } else if (taskType === 'done') {
                        taskIndex = tasks.done.findIndex(t => t.id.toString().includes(taskDataId) || taskId.includes(t.id.toString()));
                         if(taskIndex === -1) taskIndex = tasks.done.findIndex(t => `task-done-${tasks.done.indexOf(t)}` === taskId);
                        if (taskIndex > -1) {
                            taskToMove = tasks.done.splice(taskIndex, 1)[0];
                        }
                    }

                    if (taskToMove) {
                        if (targetColumnId === 'todo-column') {
                            taskToMove.status = 'todo';
                            tasks.todo.push(taskToMove);
                        } else if (targetColumnId === 'inprogress-column') {
                            taskToMove.status = 'inprogress';
                            tasks.inprogress.push(taskToMove);
                        } else if (targetColumnId === 'done-column') {
                            taskToMove.status = 'done';
                            tasks.done.push(taskToMove);
                        }
                        renderTasks(); // Re-render all tasks
                        // saveTasksToLocalStorage(); // Will add later
                        console.log(`Moved task ${taskToMove.text} to ${targetColumnId}`);
                    } else {
                        console.error("Could not find task to move:", taskId, "Parsed type:", taskType, "Parsed ID part:", taskDataId);
                        console.log("Current tasks state:", JSON.parse(JSON.stringify(tasks)));
                         // If it was already in the target container (rare, but possible with fast drags)
                        if (e.target.contains(draggedElement)) {
                             targetTasksContainer.appendChild(draggedElement); // just ensure it's appended if it was somehow detached
                        }
                    }
                }
            });
        });
    }

    // Initial render
    renderTasks();
});
