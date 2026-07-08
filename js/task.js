document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Form DOM elements
  const taskModal = document.getElementById('task-modal');
  const taskForm = document.getElementById('task-form');
  const taskIdInput = document.getElementById('task-id');
  const taskTitleInput = document.getElementById('task-title');
  const projectNameInput = document.getElementById('project-name');
  const assignedEmployeeInput = document.getElementById('assigned-employee');
  const taskPrioritySelect = document.getElementById('task-priority');
  const startDateInput = document.getElementById('start-date');
  const dueDateInput = document.getElementById('due-date');
  const taskStatusSelect = document.getElementById('task-status');
  
  // Validation DOM elements
  const taskErrorSummary = document.getElementById('task-error-summary');
  const titleError = document.getElementById('title-error');
  const projectError = document.getElementById('project-error');
  const employeeError = document.getElementById('employee-error');
  const priorityError = document.getElementById('priority-error');
  const startDateError = document.getElementById('start-date-error');
  const dueDateError = document.getElementById('due-date-error');
  const statusError = document.getElementById('status-error');

  // Trigger elements
  const openModalBtns = document.querySelectorAll('.open-task-modal-btn');
  const closeModalBtn = document.getElementById('modal-close');
  const cancelTaskBtn = document.getElementById('btn-cancel-task');
  const modalTitle = document.getElementById('modal-title');
  const saveTaskBtn = document.getElementById('btn-save-task');
  const projectSuggestions = document.getElementById('project-suggestions');

  // Filter elements
  const searchEmployee = document.getElementById('search-employee');
  const filterPriority = document.getElementById('filter-priority');
  const filterStatus = document.getElementById('filter-status');
  const btnClearFilters = document.getElementById('btn-clear-filters');
  const tasksGrid = document.getElementById('tasks-grid');

  // 1. Modal Toggle Listeners
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openModal();
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking on backdrop
  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
      closeModal();
    }
  });

  function openModal(editTask = null) {
    clearErrors();
    populateSuggestions();
    
    // Set default dates if creating new
    if (!editTask) {
      modalTitle.textContent = 'Create New Task';
      taskIdInput.value = '';
      taskForm.reset();
      
      const today = new Date().toISOString().split('T')[0];
      startDateInput.value = today;
      dueDateInput.value = today;
      taskStatusSelect.value = 'Pending';
    } else {
      modalTitle.textContent = 'Edit Task';
      taskIdInput.value = editTask.id;
      taskTitleInput.value = editTask.taskTitle;
      projectNameInput.value = editTask.projectName;
      assignedEmployeeInput.value = editTask.assignedEmployee;
      taskPrioritySelect.value = editTask.priority;
      startDateInput.value = editTask.startDate;
      dueDateInput.value = editTask.dueDate;
      taskStatusSelect.value = editTask.status;
    }
    
    taskModal.classList.add('active');
  }

  function closeModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
    clearErrors();
  }

  // 2. Load Project Datalist Suggestions
  function populateSuggestions() {
    const projects = [...new Set(tasks.map(t => t.projectName.trim()).filter(p => p !== ''))];
    projectSuggestions.innerHTML = projects.map(p => `<option value="${escapeHTML(p)}">`).join('');
  }

  // 3. Form Validation and Save
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const id = taskIdInput.value;
    const title = taskTitleInput.value.trim();
    const projectName = projectNameInput.value.trim();
    const assignedEmployee = assignedEmployeeInput.value.trim();
    const priority = taskPrioritySelect.value;
    const startDateVal = startDateInput.value;
    const dueDateVal = dueDateInput.value;
    const status = taskStatusSelect.value;

    let isValid = true;
    let errors = [];

    // Fields presence check
    if (!title) {
      showFieldError(taskTitleInput, titleError, 'Task title is required.');
      errors.push('Task title is required.');
      isValid = false;
    }
    if (!projectName) {
      showFieldError(projectNameInput, projectError, 'Project name is required.');
      errors.push('Project name is required.');
      isValid = false;
    }
    if (!assignedEmployee) {
      showFieldError(assignedEmployeeInput, employeeError, 'Assigned employee is required.');
      errors.push('Assigned employee is required.');
      isValid = false;
    }
    if (!priority) {
      showFieldError(taskPrioritySelect, priorityError, 'Priority level is required.');
      errors.push('Priority level is required.');
      isValid = false;
    }
    if (!startDateVal) {
      showFieldError(startDateInput, startDateError, 'Start date is required.');
      errors.push('Start date is required.');
      isValid = false;
    }
    if (!dueDateVal) {
      showFieldError(dueDateInput, dueDateError, 'Due date is required.');
      errors.push('Due date is required.');
      isValid = false;
    }
    if (!status) {
      showFieldError(taskStatusSelect, statusError, 'Status is required.');
      errors.push('Status is required.');
      isValid = false;
    }

    // Business logic: Due date cannot be before start date
    if (startDateVal && dueDateVal) {
      const start = new Date(startDateVal);
      const due = new Date(dueDateVal);
      
      start.setHours(0,0,0,0);
      due.setHours(0,0,0,0);

      if (due < start) {
        showFieldError(dueDateInput, dueDateError, 'Due date cannot be before start date.');
        errors.push('Due date cannot be before start date.');
        isValid = false;
      }
    }

    if (!isValid) {
      showErrorSummary(errors);
      return;
    }

    // Save or update
    if (id) {
      // Edit mode
      tasks = tasks.map(t => t.id === id ? { id, taskTitle: title, projectName, assignedEmployee, priority, startDate: startDateVal, dueDate: dueDateVal, status } : t);
    } else {
      // Create mode
      const newTask = {
        id: 'task_' + Date.now() + Math.random().toString(36).substr(2, 5),
        taskTitle: title,
        projectName,
        assignedEmployee,
        priority,
        startDate: startDateVal,
        dueDate: dueDateVal,
        status
      };
      tasks.push(newTask);
    }

    // Save to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Close modal, re-render everything
    closeModal();
    renderTasks();
    if (window.updateDashboardData) {
      window.updateDashboardData();
    }
  });

  // Helpers for form errors
  function showFieldError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('active');
  }

  function clearErrors() {
    const inputs = taskForm.querySelectorAll('input, select');
    inputs.forEach(inp => inp.classList.remove('error'));
    
    const errorPills = taskForm.querySelectorAll('.field-error');
    errorPills.forEach(pill => {
      pill.textContent = '';
      pill.classList.remove('active');
    });

    taskErrorSummary.classList.add('hidden');
    taskErrorSummary.textContent = '';
  }

  function showErrorSummary(errors) {
    taskErrorSummary.innerHTML = '<strong>Please resolve form errors:</strong><ul>' + 
      errors.map(err => `<li>${err}</li>`).join('') + 
      '</ul>';
    taskErrorSummary.classList.remove('hidden');
  }

  // 4. Render Task List Grid
  window.renderTasks = function() {
    const searchQuery = searchEmployee.value.trim().toLowerCase();
    const selectedPriority = filterPriority.value;
    const selectedStatus = filterStatus.value;

    const filteredTasks = tasks.filter(task => {
      // Employee name search (substring, case insensitive)
      const matchesSearch = task.assignedEmployee.toLowerCase().includes(searchQuery);
      
      // Priority filter
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
      // Status filter
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;

      return matchesSearch && matchesPriority && matchesStatus;
    });

    if (filteredTasks.length === 0) {
      tasksGrid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📂</span>
          <p>No tasks found matching current filters.</p>
          <button class="btn btn-outline" id="btn-empty-reset">Reset Filters</button>
        </div>`;
      
      const resetBtn = document.getElementById('btn-empty-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
      }
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasksGrid.innerHTML = filteredTasks.map(task => {
      // Overdue check
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const isOverdue = task.status !== 'Completed' && dueDate < today;
      
      // Business logic: High priority overdue highlight
      const isHighOverdue = isOverdue && task.priority === 'High';

      // Task progress percentage computation
      let progressPercent = 0;
      if (task.status === 'Completed') {
        progressPercent = 100;
      } else if (task.status === 'In Progress') {
        progressPercent = 50;
      }

      return `
        <div class="task-card ${isHighOverdue ? 'high-overdue' : ''}">
          <div class="task-card-header">
            <span class="project-tag" title="${escapeHTML(task.projectName)}">${escapeHTML(task.projectName)}</span>
            <div class="task-actions">
              <button class="action-icon-btn btn-edit" data-id="${task.id}" title="Edit Task">✏️</button>
              <button class="action-icon-btn btn-delete" data-id="${task.id}" title="Delete Task">🗑️</button>
            </div>
          </div>
          
          <h3 class="task-title">${escapeHTML(task.taskTitle)}</h3>
          
          <div class="task-employee">
            <span class="employee-icon">👤</span>
            <span>Assigned: <strong>${escapeHTML(task.assignedEmployee)}</strong></span>
          </div>

          <div class="task-dates">
            <div class="date-row">
              <span>Start Date:</span>
              <strong>${task.startDate}</strong>
            </div>
            <div class="date-row ${isOverdue ? 'overdue' : ''}">
              <span>Due Date:</span>
              <strong>${task.dueDate} ${isOverdue ? '(Overdue)' : ''}</strong>
              ${isOverdue ? '<span class="calendar-icon">⚠️</span>' : ''}
            </div>
          </div>

          <div class="task-progress-wrapper">
            <div class="progress-info">
              <span>Task Progress</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar-fill status-${task.status.replace(' ', '-')}" style="width: ${progressPercent}%;"></div>
            </div>
          </div>

          <div class="task-card-footer">
            <span class="priority-pill priority-${task.priority}">${task.priority} Priority</span>
            <span class="badge ${getStatusBadgeClass(task.status)}">${task.status}</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to edit & delete buttons
    const editBtns = tasksGrid.querySelectorAll('.btn-edit');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const task = tasks.find(t => t.id === id);
        if (task) openModal(task);
      });
    });

    const deleteBtns = tasksGrid.querySelectorAll('.btn-delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this task?')) {
          deleteTask(id);
        }
      });
    });
  };

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    if (window.updateDashboardData) {
      window.updateDashboardData();
    }
  }

  function getStatusBadgeClass(status) {
    if (status === 'Completed') return 'badge-success';
    if (status === 'In Progress') return 'badge-info';
    return 'badge-warning';
  }

  // 5. Filtering and Search Logic listeners
  searchEmployee.addEventListener('input', renderTasks);
  filterPriority.addEventListener('change', renderTasks);
  filterStatus.addEventListener('change', renderTasks);

  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', resetAllFilters);
  }

  function resetAllFilters() {
    searchEmployee.value = '';
    filterPriority.value = 'all';
    filterStatus.value = 'all';
    renderTasks();
  }

  // 6. Export Tasks to JSON (Bonus Challenge)
  const btnExport = document.getElementById('btn-export-json');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (tasks.length === 0) {
        alert('There are no tasks available to export.');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `tasks_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // Escape HTML helper
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Initialize display
  renderTasks();
});
