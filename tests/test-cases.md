# Test Cases Suite - Version 1.0.0

This test suite covers the manual verification tests executed for major features of the Project & Task Management System.

---

## 1. Authentication Module (Login UI)

### Test Case 1.1: Empty Field Validation
- **Goal**: Verify that form does not submit if fields are empty and shows errors.
- **Steps**:
  1. Navigate to `/pages/login.html`.
  2. Clear the email and password inputs.
  3. Click "Sign In".
- **Expected Result**:
  - Email field displays: "Email address is required."
  - Password field displays: "Password is required."
  - Red error summary card appears at the top.
  - Page does not redirect.

### Test Case 1.2: Invalid Email Format
- **Goal**: Verify that malformed email addresses are rejected.
- **Steps**:
  1. Input `invalidemail` or `invalid@company` into the email field.
  2. Enter a valid 6+ character password.
  3. Click "Sign In".
- **Expected Result**:
  - Email field displays: "Please enter a valid email address (e.g. employee@company.com)."
  - Error summary card appears at the top.

### Test Case 1.3: Successful Login Redirect
- **Goal**: Verify successful credentials allow access and save state.
- **Steps**:
  1. Enter a valid email format e.g. `admin@company.com` and password `password123`.
  2. Click "Sign In".
- **Expected Result**:
  - Button switches to loading spinner and text "Authenticating...".
  - After 1.5 seconds, page redirects to `dashboard.html`.
  - Local Storage contains `isAuthenticated: "true"` and `userEmail: "admin@company.com"`.

---

## 2. Dashboard Shell & Theme Sync

### Test Case 2.1: Session Guard Protection
- **Goal**: Ensure unauthenticated users cannot access dashboard.
- **Steps**:
  1. Clear Local Storage.
  2. Attempt to navigate directly to `/pages/dashboard.html` in browser.
- **Expected Result**:
  - User is immediately redirected back to `/pages/login.html`.

### Test Case 2.2: Theme Synchronization
- **Goal**: Verify dark/light mode state persists across pages.
- **Steps**:
  1. Open `/pages/login.html` and toggle dark mode (page background turns dark blue).
  2. Log in successfully.
  3. Observe theme of `/pages/dashboard.html`.
  4. Toggle light mode in dashboard, refresh the page.
- **Expected Result**:
  - Dashboard loads in dark mode matching the login page theme state.
  - After switching to light mode and refreshing, the dashboard remains in light mode.

---

## 3. Task Creation Module

### Test Case 3.1: Date Logic Boundary
- **Goal**: Verify business rule: Due date cannot be before start date.
- **Steps**:
  1. In Task Manager tab, click "Create New Task".
  2. Enter Title, Project, Assigned Employee, Priority, and set Start Date to `2026-07-10`.
  3. Set Due Date to `2026-07-08` (2 days before start).
  4. Click "Save Task".
- **Expected Result**:
  - Form validation blocks submit.
  - Due Date field displays: "Due date cannot be before start date."
  - Error summary lists the date violation.

### Test Case 3.2: Task Persistence (Local Storage)
- **Goal**: Verify created task persists in Local Storage and renders metrics.
- **Steps**:
  1. Open Task Modal and input valid details:
     - Title: `Write Automated Tests`
     - Project Name: `DevOps release`
     - Employee: `Sarah Jenkins`
     - Priority: `Medium`
     - Dates: `2026-07-08` to `2026-07-15`
     - Status: `In Progress`
  2. Click "Save Task".
  3. Refresh the page.
- **Expected Result**:
  - Modal closes.
  - Task card appears in grid with details.
  - Dashboard stats recalculate: Total Projects = 1, Pending = 1, Completed = 0.
  - Local Storage contains tasks array with the new task entry.

---

## 4. Reports & Business Logic Highlights

### Test Case 4.1: High Priority Overdue Highlight
- **Goal**: Verify overdue high-priority tasks are highlighted in red (alert style).
- **Steps**:
  1. Create a task with Priority = `High`, Status = `Pending`, Start Date = `2026-07-01`, Due Date = `2026-07-05` (overdue).
  2. Click "Save Task".
- **Expected Result**:
  - Task card renders in red border/shadow glow, showing red overdue label.
  - Critical Task Warnings feed on the overview tab displays a pulse warning indicator with description: "🚨 [Task Title] - 3 days overdue".

### Test Case 4.2: Search & Filter Verification
- **Goal**: Verify filtering works reactively.
- **Steps**:
  1. Create two tasks assigned to `John Doe` and `Jane Smith`.
  2. In Task Manager search bar, type `john`.
  3. Observe list.
  4. Set Priority filter to `High`.
- **Expected Result**:
  - Substring search hides `Jane Smith` task, showing only `John Doe`.
  - Setting priority to high hides tasks that do not match priority, rendering an empty state if no high priority matches exist.

### Test Case 4.3: JSON Export & Print Layout
- **Goal**: Verify backup export and print styling are correct.
- **Steps**:
  1. Navigate to Reports & Analytics tab.
  2. Click "Export Tasks (JSON)".
  3. Click "Print Summary".
- **Expected Result**:
  - A file `tasks_export_[date].json` is downloaded with exact tasks data structure.
  - Print dialog layout hides navigation sidebar, headers, filters, and formats clean high-contrast summaries.
