// Kanban Task Manager Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    const app = new KanbanApp();
    app.init();
});

class KanbanApp {
    constructor() {
        // DOM Elements
        this.boardSelect = document.getElementById('board-select');
        this.newBoardBtn = document.getElementById('new-board-btn');
        this.boardTitle = document.getElementById('board-title');
        this.editBoardBtn = document.getElementById('edit-board-btn');
        this.deleteBoardBtn = document.getElementById('delete-board-btn');
        this.columnsContainer = document.getElementById('columns-container');
        this.addColumnBtn = document.getElementById('add-column-btn');
        this.themeSwitch = document.getElementById('theme-switch');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        
        // Modals
        this.boardModal = document.getElementById('board-modal');
        this.boardModalTitle = document.getElementById('board-modal-title');
        this.boardForm = document.getElementById('board-form');
        this.boardNameInput = document.getElementById('board-name');
        this.boardDescInput = document.getElementById('board-description');
        
        this.columnModal = document.getElementById('column-modal');
        this.columnModalTitle = document.getElementById('column-modal-title');
        this.columnForm = document.getElementById('column-form');
        this.columnNameInput = document.getElementById('column-name');
        this.columnColorInput = document.getElementById('column-color');
        
        this.taskModal = document.getElementById('task-modal');
        this.taskModalTitle = document.getElementById('task-modal-title');
        this.taskForm = document.getElementById('task-form');
        this.taskTitleInput = document.getElementById('task-title');
        this.taskDescInput = document.getElementById('task-description');
        this.taskPriorityInput = document.getElementById('task-priority');
        this.taskDueDateInput = document.getElementById('task-due-date');
        
        this.taskViewModal = document.getElementById('task-view-modal');
        this.taskViewTitle = document.getElementById('task-view-title');
        this.taskViewStatus = document.getElementById('task-view-status');
        this.taskViewPriority = document.getElementById('task-view-priority');
        this.taskViewDueDate = document.getElementById('task-view-due-date');
        this.taskViewCreated = document.getElementById('task-view-created');
        this.taskViewDescription = document.getElementById('task-view-description');
        this.editTaskBtn = document.getElementById('edit-task-btn');
        this.deleteTaskBtn = document.getElementById('delete-task-btn');
        
        this.confirmDialog = document.getElementById('confirm-dialog');
        this.confirmMessage = document.getElementById('confirm-message');
        this.confirmActionBtn = document.getElementById('confirm-action-btn');
        this.cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
        
        // Close modal buttons
        this.closeModalBtns = document.querySelectorAll('.close-modal-btn');
        this.cancelBtns = document.querySelectorAll('.cancel-btn');
        
        // Data
        this.boards = [];
        this.currentBoardId = null;
        this.currentColumnId = null;
        this.currentTaskId = null;
        this.editMode = false;
        
        // Confirmation callback
        this.confirmCallback = null;
    }
    
    init() {
        // Load data from localStorage
        this.loadData();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initialize theme
        this.initTheme();
        
        // Update UI
        this.updateBoardSelect();
    }
    
    loadData() {
        const savedBoards = localStorage.getItem('kanban_boards');
        if (savedBoards) {
            this.boards = JSON.parse(savedBoards);
        } else {
            // Create default board if no boards exist
            this.createDefaultBoard();
        }
    }
    
    saveData() {
        localStorage.setItem('kanban_boards', JSON.stringify(this.boards));
    }
    
    createDefaultBoard() {
        const defaultBoard = {
            id: this.generateId(),
            name: 'My First Board',
            description: 'A default board to get you started',
            columns: [
                {
                    id: this.generateId(),
                    name: 'To Do',
                    color: '#3498db',
                    tasks: []
                },
                {
                    id: this.generateId(),
                    name: 'In Progress',
                    color: '#f39c12',
                    tasks: []
                },
                {
                    id: this.generateId(),
                    name: 'Done',
                    color: '#2ecc71',
                    tasks: []
                }
            ]
        };
        
        this.boards.push(defaultBoard);
        this.saveData();
    }
    
    initEventListeners() {
        // Board select
        this.boardSelect.addEventListener('change', () => {
            const boardId = this.boardSelect.value;
            if (boardId) {
                this.loadBoard(boardId);
            } else {
                this.resetBoard();
            }
        });
        
        // New board button
        this.newBoardBtn.addEventListener('click', () => {
            this.openBoardModal();
        });
        
        // Edit board button
        this.editBoardBtn.addEventListener('click', () => {
            this.openBoardModal(this.currentBoardId);
        });
        
        // Delete board button
        this.deleteBoardBtn.addEventListener('click', () => {
            this.confirmAction(
                `Are you sure you want to delete the board "${this.getCurrentBoard().name}"? This action cannot be undone.`,
                () => this.deleteBoard(this.currentBoardId)
            );
        });
        
        // Add column button
        this.addColumnBtn.addEventListener('click', () => {
            this.openColumnModal();
        });
        
        // Board form submit
        this.boardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBoard();
        });
        
        // Column form submit
        this.columnForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveColumn();
        });
        
        // Task form submit
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Edit task button
        this.editTaskBtn.addEventListener('click', () => {
            this.closeModal(this.taskViewModal);
            this.openTaskModal(this.currentTaskId, this.currentColumnId);
        });
        
        // Delete task button
        this.deleteTaskBtn.addEventListener('click', () => {
            this.confirmAction(
                'Are you sure you want to delete this task? This action cannot be undone.',
                () => {
                    this.deleteTask(this.currentTaskId, this.currentColumnId);
                    this.closeModal(this.taskViewModal);
                }
            );
        });
        
        // Confirm action button
        this.confirmActionBtn.addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
            }
            this.closeModal(this.confirmDialog);
        });
        
        // Cancel confirm button
        this.cancelConfirmBtn.addEventListener('click', () => {
            this.closeModal(this.confirmDialog);
        });
        
        // Close modals
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        this.cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Theme switch
        this.themeSwitch.addEventListener('change', () => {
            this.toggleTheme();
        });
        
        // Mobile menu
        this.mobileMenuBtn.addEventListener('click', () => {
            this.navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                this.navLinks.classList.remove('active');
            });
        });
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeSwitch.checked = savedTheme === 'dark';
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    updateBoardSelect() {
        // Clear options
        this.boardSelect.innerHTML = '<option value="">Select a board...</option>';
        
        // Add board options
        this.boards.forEach(board => {
            const option = document.createElement('option');
            option.value = board.id;
            option.textContent = board.name;
            this.boardSelect.appendChild(option);
        });
        
        // Select current board if exists
        if (this.currentBoardId) {
            this.boardSelect.value = this.currentBoardId;
        }
    }
    
    loadBoard(boardId) {
        this.currentBoardId = boardId;
        
        // Update UI
        this.renderBoard();
        
        // Enable board actions
        this.editBoardBtn.disabled = false;
        this.deleteBoardBtn.disabled = false;
        this.addColumnBtn.disabled = false;
    }
    
    resetBoard() {
        this.currentBoardId = null;
        
        // Reset UI
        this.boardTitle.textContent = 'Select or Create a Board';
        this.columnsContainer.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-clipboard-list"></i>
                <p>Select a board from the dropdown or create a new one to get started.</p>
            </div>
        `;
        
        // Disable board actions
        this.editBoardBtn.disabled = true;
        this.deleteBoardBtn.disabled = true;
        this.addColumnBtn.disabled = true;
    }
    
    renderBoard() {
        const board = this.getCurrentBoard();
        if (!board) return;
        
        // Update title
        this.boardTitle.textContent = board.name;
        
        // Clear columns container
        this.columnsContainer.innerHTML = '';
        
        // Render columns
        board.columns.forEach(column => {
            this.renderColumn(column);
        });
    }
    
    renderColumn(column) {
        const columnEl = document.createElement('div');
        columnEl.className = 'column';
        columnEl.dataset.id = column.id;
        
        columnEl.innerHTML = `
            <div class="column-header">
                <div class="column-title">
                    <div class="column-marker" style="background-color: ${column.color}"></div>
                    <span>${column.name}</span>
                </div>
                <div class="column-actions">
                    <button class="column-action-btn edit-column-btn" title="Edit Column">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="column-action-btn delete-column-btn" title="Delete Column">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="column-tasks" data-column-id="${column.id}"></div>
            <div class="column-footer">
                <button class="add-task-btn">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            </div>
        `;
        
        // Append column to container
        this.columnsContainer.appendChild(columnEl);
        
        // Get column tasks container
        const tasksContainer = columnEl.querySelector('.column-tasks');
        
        // Add event listeners to column
        columnEl.querySelector('.edit-column-btn').addEventListener('click', () => {
            this.openColumnModal(column.id);
        });
        
        columnEl.querySelector('.delete-column-btn').addEventListener('click', () => {
            this.confirmAction(
                `Are you sure you want to delete the column "${column.name}"? All tasks in this column will be deleted.`,
                () => this.deleteColumn(column.id)
            );
        });
        
        columnEl.querySelector('.add-task-btn').addEventListener('click', () => {
            this.openTaskModal(null, column.id);
        });
        
        // Make column droppable
        this.makeDroppable(tasksContainer);
        
        // Render tasks
        column.tasks.forEach(task => {
            this.renderTask(task, tasksContainer);
        });
    }
    
    renderTask(task, container) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-card';
        taskEl.dataset.id = task.id;
        taskEl.style.borderLeftColor = this.getPriorityColor(task.priority);
        
        taskEl.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                ${task.dueDate ? `
                    <div class="task-due-date">
                        <i class="far fa-calendar-alt"></i>
                        ${this.formatDate(task.dueDate)}
                    </div>
                ` : ''}
                <div class="task-priority priority-${task.priority}">${task.priority}</div>
            </div>
        `;
        
        // Make task draggable
        taskEl.draggable = true;
        taskEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                taskId: task.id,
                columnId: container.dataset.columnId
            }));
            taskEl.classList.add('dragging');
        });
        
        taskEl.addEventListener('dragend', () => {
            taskEl.classList.remove('dragging');
        });
        
        // Add click event to open task view
        taskEl.addEventListener('click', () => {
            this.openTaskView(task.id, container.dataset.columnId);
        });
        
        // Append task to container
        container.appendChild(taskEl);
    }
    
    makeDroppable(container) {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                const sourceColumnId = data.columnId;
                const taskId = data.taskId;
                const targetColumnId = container.dataset.columnId;
                
                // Only move if dropping in a different column
                if (sourceColumnId !== targetColumnId) {
                    this.moveTask(taskId, sourceColumnId, targetColumnId);
                }
            } catch (error) {
                console.error('Error parsing drag data:', error);
            }
        });
    }
    
    openBoardModal(boardId = null) {
        this.editMode = !!boardId;
        
        // Set modal title
        this.boardModalTitle.textContent = this.editMode ? 'Edit Board' : 'New Board';
        
        // Reset form
        this.boardForm.reset();
        
        if (this.editMode) {
            // Get board data
            const board = this.boards.find(b => b.id === boardId);
            if (board) {
                this.boardNameInput.value = board.name;
                this.boardDescInput.value = board.description || '';
            }
        }
        
        // Open modal
        this.openModal(this.boardModal);
    }
    
    openColumnModal(columnId = null) {
        this.editMode = !!columnId;
        this.currentColumnId = columnId;
        
        // Set modal title
        this.columnModalTitle.textContent = this.editMode ? 'Edit Column' : 'New Column';
        
        // Reset form
        this.columnForm.reset();
        
        if (this.editMode) {
            // Get column data
            const board = this.getCurrentBoard();
            const column = board.columns.find(c => c.id === columnId);
            if (column) {
                this.columnNameInput.value = column.name;
                this.columnColorInput.value = column.color;
            }
        } else {
            // Set random color for new column
            this.columnColorInput.value = this.getRandomColor();
        }
        
        // Open modal
        this.openModal(this.columnModal);
    }
    
    openTaskModal(taskId = null, columnId) {
        this.editMode = !!taskId;
        this.currentTaskId = taskId;
        this.currentColumnId = columnId;
        
        // Set modal title
        this.taskModalTitle.textContent = this.editMode ? 'Edit Task' : 'New Task';
        
        // Reset form
        this.taskForm.reset();
        
        if (this.editMode) {
            // Get task data
            const board = this.getCurrentBoard();
            const column = board.columns.find(c => c.id === columnId);
            const task = column.tasks.find(t => t.id === taskId);
            
            if (task) {
                this.taskTitleInput.value = task.title;
                this.taskDescInput.value = task.description || '';
                this.taskPriorityInput.value = task.priority;
                this.taskDueDateInput.value = task.dueDate || '';
            }
        }
        
        // Open modal
        this.openModal(this.taskModal);
    }
    
    openTaskView(taskId, columnId) {
        this.currentTaskId = taskId;
        this.currentColumnId = columnId;
        
        // Get task data
        const board = this.getCurrentBoard();
        const column = board.columns.find(c => c.id === columnId);
        const task = column.tasks.find(t => t.id === taskId);
        
        if (task) {
            // Set task details
            this.taskViewTitle.textContent = task.title;
            this.taskViewStatus.textContent = column.name;
            this.taskViewStatus.style.backgroundColor = this.getPriorityColor(task.priority, 0.2);
            this.taskViewStatus.style.color = this.getPriorityColor(task.priority);
            
            this.taskViewPriority.textContent = task.priority;
            this.taskViewPriority.className = `task-priority priority-${task.priority}`;
            
            this.taskViewDueDate.textContent = task.dueDate ? this.formatDate(task.dueDate) : 'None';
            this.taskViewCreated.textContent = this.formatDate(task.created);
            this.taskViewDescription.textContent = task.description || 'No description provided.';
            
            // Open modal
            this.openModal(this.taskViewModal);
        }
    }
    
    saveBoard() {
        const name = this.boardNameInput.value.trim();
        const description = this.boardDescInput.value.trim();
        
        if (name === '') return;
        
        if (this.editMode) {
            // Update existing board
            const board = this.getCurrentBoard();
            board.name = name;
            board.description = description;
        } else {
            // Create new board
            const newBoard = {
                id: this.generateId(),
                name: name,
                description: description,
                columns: []
            };
            
            this.boards.push(newBoard);
            this.currentBoardId = newBoard.id;
        }
        
        // Save and update UI
        this.saveData();
        this.updateBoardSelect();
        this.renderBoard();
        this.closeModal(this.boardModal);
        
        // Enable board actions
        this.editBoardBtn.disabled = false;
        this.deleteBoardBtn.disabled = false;
        this.addColumnBtn.disabled = false;
    }
    
    saveColumn() {
        const name = this.columnNameInput.value.trim();
        const color = this.columnColorInput.value;
        
        if (name === '') return;
        
        const board = this.getCurrentBoard();
        
        if (this.editMode) {
            // Update existing column
            const column = board.columns.find(c => c.id === this.currentColumnId);
            if (column) {
                column.name = name;
                column.color = color;
            }
        } else {
            // Create new column
            const newColumn = {
                id: this.generateId(),
                name: name,
                color: color,
                tasks: []
            };
            
            board.columns.push(newColumn);
        }
        
        // Save and update UI
        this.saveData();
        this.renderBoard();
        this.closeModal(this.columnModal);
    }
    
    saveTask() {
        const title = this.taskTitleInput.value.trim();
        const description = this.taskDescInput.value.trim();
        const priority = this.taskPriorityInput.value;
        const dueDate = this.taskDueDateInput.value;
        
        if (title === '') return;
        
        const board = this.getCurrentBoard();
        const column = board.columns.find(c => c.id === this.currentColumnId);
        
        if (this.editMode) {
            // Update existing task
            const task = column.tasks.find(t => t.id === this.currentTaskId);
            if (task) {
                task.title = title;
                task.description = description;
                task.priority = priority;
                task.dueDate = dueDate;
            }
        } else {
            // Create new task
            const newTask = {
                id: this.generateId(),
                title: title,
                description: description,
                priority: priority,
                dueDate: dueDate,
                created: new Date().toISOString().split('T')[0]
            };
            
            column.tasks.push(newTask);
        }
        
        // Save and update UI
        this.saveData();
        this.renderBoard();
        this.closeModal(this.taskModal);
    }
    
    deleteBoard(boardId) {
        // Remove board
        this.boards = this.boards.filter(board => board.id !== boardId);
        
        // Save and update UI
        this.saveData();
        this.updateBoardSelect();
        this.resetBoard();
    }
    
    deleteColumn(columnId) {
        const board = this.getCurrentBoard();
        
        // Remove column
        board.columns = board.columns.filter(column => column.id !== columnId);
        
        // Save and update UI
        this.saveData();
        this.renderBoard();
    }
    
    deleteTask(taskId, columnId) {
        const board = this.getCurrentBoard();
        const column = board.columns.find(c => c.id === columnId);
        
        // Remove task
        column.tasks = column.tasks.filter(task => task.id !== taskId);
        
        // Save and update UI
        this.saveData();
        this.renderBoard();
    }
    
    moveTask(taskId, sourceColumnId, targetColumnId) {
        const board = this.getCurrentBoard();
        const sourceColumn = board.columns.find(c => c.id === sourceColumnId);
        const targetColumn = board.columns.find(c => c.id === targetColumnId);
        
        if (!sourceColumn || !targetColumn) return;
        
        // Find task
        const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        // Move task
        const task = sourceColumn.tasks.splice(taskIndex, 1)[0];
        targetColumn.tasks.push(task);
        
        // Save and update UI
        this.saveData();
        this.renderBoard();
    }
    
    confirmAction(message, callback) {
        this.confirmMessage.textContent = message;
        this.confirmCallback = callback;
        this.openModal(this.confirmDialog);
    }
    
    openModal(modal) {
        modal.classList.add('active');
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    getCurrentBoard() {
        return this.boards.find(board => board.id === this.currentBoardId);
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    getPriorityColor(priority, opacity = 1) {
        const colors = {
            low: `rgba(46, 204, 113, ${opacity})`,
            medium: `rgba(243, 156, 18, ${opacity})`,
            high: `rgba(231, 76, 60, ${opacity})`
        };
        
        return colors[priority] || colors.medium;
    }
    
    getRandomColor() {
        const colors = [
            '#3498db', // Blue
            '#2ecc71', // Green
            '#e74c3c', // Red
            '#9b59b6', // Purple
            '#f39c12', // Orange
            '#1abc9c', // Teal
            '#34495e', // Dark Blue
            '#d35400', // Dark Orange
            '#c0392b', // Dark Red
            '#16a085', // Dark Teal
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
} 