# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-07-08

### Added
- **Login UI Portal**: Added input form, layout styling, field validator, eye visibility toggle, and loading spinners.
- **Dashboard Grid**: Added total projects count, completed tasks, pending tasks, and overdue task counters.
- **Task creation modal**: Integrated forms with validations, task descriptions, start/due dates, priority and status levels.
- **Date boundary logic**: Enforced rule that the due date cannot be set before the start date.
- **Search & Filters**: Added employee name substring searches, status filters, priority level filters, and a clear filters function.
- **Critical warnings feed**: Highlighted High-priority overdue tasks in red cards with alert badges and notifications.
- **Persistence Layer**: Integrated Local Storage synchronization for all task actions and theme properties.
- **Donut Chart**: Built custom JavaScript SVG chart logic that renders task status metrics dynamically.
- **Reports**: Implemented calculated project progress bars, metrics percentages, and printable page styles.
- **Dual Themes**: Added persistent dark and light mode toggle across views.
- **DevOps branch release pipeline**: Created branches for features, development integrations, release preparation, and hotfixes.
- **Manual Test Suite**: Documented test instructions under `/tests/test-cases.md`.
