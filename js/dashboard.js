document.addEventListener('DOMContentLoaded', () => {
  // 1. Session Authentication Check
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userEmail = localStorage.getItem('userEmail');

  if (isAuthenticated !== 'true' || !userEmail) {
    // If not logged in, redirect to login page
    window.location.href = 'login.html';
    return;
  }

  // Set employee name and avatar initials
  const displayUserName = document.getElementById('display-user-name');
  if (displayUserName) {
    displayUserName.textContent = userEmail.split('@')[0];
  }
  const avatar = document.querySelector('.user-profile .avatar');
  if (avatar) {
    avatar.textContent = userEmail.charAt(0).toUpperCase();
  }

  // 2. Theme Switching Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const htmlElement = document.documentElement;

  // Retrieve saved theme or fallback to light
  const currentTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', currentTheme);
  updateThemeIcons(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = htmlElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
  });

  function updateThemeIcons(theme) {
    if (theme === 'dark') {
      darkIcon.classList.remove('hidden');
      lightIcon.classList.add('hidden');
    } else {
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden');
    }
  }

  // 3. Tab Routing / Switching
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('page-title');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      // Update active nav button
      navItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');

      // Update active content panel
      tabPanels.forEach(panel => {
        panel.classList.remove('active-panel');
        if (panel.id === `tab-${targetTab}`) {
          panel.classList.add('active-panel');
        }
      });

      // Update Header title
      switch (targetTab) {
        case 'overview':
          pageTitle.textContent = 'Dashboard Overview';
          break;
        case 'tasks':
          pageTitle.textContent = 'Task Manager';
          break;
        case 'reports':
          pageTitle.textContent = 'Reports & Analytics';
          break;
      }

      // Close mobile sidebar if open
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.remove('active');

      // Re-trigger calculations and rendering
      updateDashboardData();
    });
  });

  // 4. Mobile Menu Toggles
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close');
  const sidebar = document.getElementById('sidebar');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.add('active');
    });
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }

  // 5. Header Date Setup
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // 6. Logout Implementation
  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      window.location.href = 'login.html';
    });
  }

  // 7. Core Analytics Engine
  window.updateDashboardData = function() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Project Extraction (dynamic unique projects list)
    const projects = [...new Set(tasks.map(t => t.projectName.trim()).filter(p => p !== ''))];
    const totalProjects = projects.length;

    // Task counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

    // Overdue check
    const today = new Date();
    today.setHours(0, 0, 0, 0); // clear time for accurate date comparisons
    
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      const dueDate = parseLocalDate(t.dueDate);
      return dueDate < today;
    });

    const overdueCount = overdueTasks.length;

    // Update Overview stats UI
    document.getElementById('metric-projects').textContent = totalProjects;
    document.getElementById('metric-completed').textContent = completedTasks;
    document.getElementById('metric-pending').textContent = (pendingTasks + inProgressTasks); // Combined pending visual list
    document.getElementById('metric-overdue').textContent = overdueCount;

    // High Priority Overdue alerts filter
    const criticalOverdueTasks = overdueTasks.filter(t => t.priority === 'High');
    renderCriticalAlerts(criticalOverdueTasks);

    // Render SVG chart
    renderDonutChart(totalTasks, completedTasks, inProgressTasks, pendingTasks);

    // Update Report tab values
    updateReportTab(totalProjects, totalTasks, completedTasks, inProgressTasks, pendingTasks, overdueCount, tasks, projects);
  };

  // Helper to render high priority overdue tasks alerts
  function renderCriticalAlerts(criticalTasks) {
    const alertCountEl = document.getElementById('critical-alert-count');
    const alertsFeed = document.getElementById('critical-tasks-list');
    
    alertCountEl.textContent = `${criticalTasks.length} Alerts`;
    
    if (criticalTasks.length === 0) {
      alertCountEl.className = 'badge badge-success';
      alertsFeed.innerHTML = `
        <div class="empty-state">
          <span class="material-icons">task_alt</span>
          <p>No high-priority overdue tasks. Great job!</p>
        </div>`;
      return;
    }

    alertCountEl.className = 'badge badge-danger';
    alertsFeed.innerHTML = criticalTasks.map(task => {
      const daysOverdue = Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
      return `
        <div class="alert-item">
          <span class="material-icons">report</span>
          <div class="alert-content">
            <h4>${escapeHTML(task.taskTitle)}</h4>
            <p>Project: <strong>${escapeHTML(task.projectName)}</strong> | Assigned: <strong>${escapeHTML(task.assignedEmployee)}</strong></p>
            <div class="alert-meta">
              <span class="text-danger font-bold">${daysOverdue} day(s) overdue</span>
              <span class="text-muted">Due: ${task.dueDate}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Donut chart renderer
  function renderDonutChart(total, completed, inprogress, pending) {
    const totalCountEl = document.getElementById('chart-total-count');
    totalCountEl.textContent = total;

    const segCompleted = document.getElementById('segment-completed');
    const segInProgress = document.getElementById('segment-inprogress');
    const segPending = document.getElementById('segment-pending');

    const completedValEl = document.getElementById('legend-completed-val');
    const inprogressValEl = document.getElementById('legend-inprogress-val');
    const pendingValEl = document.getElementById('legend-pending-val');

    if (total === 0) {
      segCompleted.setAttribute('stroke-dasharray', '0 100');
      segInProgress.setAttribute('stroke-dasharray', '0 100');
      segPending.setAttribute('stroke-dasharray', '0 100');
      completedValEl.textContent = '0 (0%)';
      inprogressValEl.textContent = '0 (0%)';
      pendingValEl.textContent = '0 (0%)';
      return;
    }

    const pctCompleted = Math.round((completed / total) * 100);
    const pctInProgress = Math.round((inprogress / total) * 100);
    const pctPending = 100 - pctCompleted - pctInProgress; // Ensure exact 100% total

    completedValEl.textContent = `${completed} (${pctCompleted}%)`;
    inprogressValEl.textContent = `${inprogress} (${pctInProgress}%)`;
    pendingValEl.textContent = `${pending} (${pctPending}%)`;

    // Segment Dash calculations
    let accumulatedOffset = 0;

    // Completed
    if (pctCompleted > 0) {
      segCompleted.setAttribute('stroke-dasharray', `${pctCompleted} 100`);
      segCompleted.setAttribute('stroke-dashoffset', `${100 - accumulatedOffset}`);
      accumulatedOffset += pctCompleted;
    } else {
      segCompleted.setAttribute('stroke-dasharray', '0 100');
    }

    // In Progress
    if (pctInProgress > 0) {
      segInProgress.setAttribute('stroke-dasharray', `${pctInProgress} 100`);
      segInProgress.setAttribute('stroke-dashoffset', `${100 - accumulatedOffset}`);
      accumulatedOffset += pctInProgress;
    } else {
      segInProgress.setAttribute('stroke-dasharray', '0 100');
    }

    // Pending
    if (pctPending > 0) {
      segPending.setAttribute('stroke-dasharray', `${pctPending} 100`);
      segPending.setAttribute('stroke-dashoffset', `${100 - accumulatedOffset}`);
    } else {
      segPending.setAttribute('stroke-dasharray', '0 100');
    }
  }

  // Update Reports statistics UI
  function updateReportTab(totalProjects, totalTasks, completed, inprogress, pending, overdue, tasks, projects) {
    document.getElementById('report-projects-count').textContent = totalProjects;
    document.getElementById('report-total-tasks').textContent = totalTasks;
    
    document.getElementById('report-completed-tasks').textContent = completed;
    document.getElementById('report-inprogress-tasks').textContent = inprogress;
    document.getElementById('report-pending-tasks').textContent = pending;
    document.getElementById('report-overdue-tasks').textContent = overdue;

    if (totalTasks === 0) {
      document.getElementById('report-completed-percent').textContent = '0%';
      document.getElementById('report-inprogress-percent').textContent = '0%';
      document.getElementById('report-pending-percent').textContent = '0%';
      document.getElementById('report-overdue-percent').textContent = '0%';
    } else {
      document.getElementById('report-completed-percent').textContent = `${Math.round((completed / totalTasks) * 100)}%`;
      document.getElementById('report-inprogress-percent').textContent = `${Math.round((inprogress / totalTasks) * 100)}%`;
      document.getElementById('report-pending-percent').textContent = `${Math.round((pending / totalTasks) * 100)}%`;
      document.getElementById('report-overdue-percent').textContent = `${Math.round((overdue / totalTasks) * 100)}%`;
    }

    // Render Project progress breakdown bars
    const progressContainer = document.getElementById('project-progress-container');
    
    if (projects.length === 0) {
      progressContainer.innerHTML = `
        <div class="empty-state">
          <span class="material-icons">folder_open</span>
          <p>No project data available. Create tasks to view project progress.</p>
        </div>`;
      return;
    }

    progressContainer.innerHTML = projects.map(proj => {
      const projTasks = tasks.filter(t => t.projectName.trim() === proj);
      const totalProjTasks = projTasks.length;
      const completedProjTasks = projTasks.filter(t => t.status === 'Completed').length;
      const percent = totalProjTasks === 0 ? 0 : Math.round((completedProjTasks / totalProjTasks) * 100);

      return `
        <div class="project-progress-item">
          <div class="project-progress-header">
            <span class="project-name-label" title="${escapeHTML(proj)}">${escapeHTML(proj)}</span>
            <span class="project-percent-label font-bold">${percent}% (${completedProjTasks}/${totalProjTasks})</span>
          </div>
          <div class="project-progress-bar-track">
            <div class="project-progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Print summary button listener
  const btnPrint = document.getElementById('btn-print-report');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Escape HTML helper to prevent XSS
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

  // Helper to parse date strings without timezone shifts
  function parseLocalDate(dateStr) {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  // Trigger initial statistical dashboard update
  updateDashboardData();
});
