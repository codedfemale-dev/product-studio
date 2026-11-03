# AI project planner tutorial example

A small, working companion to Coded Female's guide to designing a project management tool with AI. All names and tasks are fictional. Dates start relative to the day the example first loads.

## Run locally

Download this repository and open `examples/ai-project-planner` in a terminal. With Python 3 installed:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser. No build, package installation or API key is required. Serve over HTTP rather than opening the HTML file directly, so JavaScript modules and browser storage behave consistently.

## Try it

Create a task, change its status, tick a checklist item and refresh. Try owner and priority filters together. Export a backup, change a task, then import the backup to restore it. Import replaces all current tasks after confirmation.

Features: board and list views, task creation/editing/deletion, owner labels, due dates, priorities, combined search and filters, checklists, blockers, live overview calculations, local saving and validated JSON backup/restore. Use the task title to open the editor. Use the status selector to move work with mouse, touch or keyboard.

The overview uses all tasks, regardless of filters. Completion means the percentage of tasks marked Done, not a measure of productivity or delivered value. Dates due today and completed tasks are excluded from overdue counts. Completed tasks are excluded from outstanding blocker counts.

## Build your own

Read [PROMPTS.txt](PROMPTS.txt) for the brief, design prompt, foundation prompt, feature prompts, extension planning and verification prompt. These are reusable instructions for your own build; AI output will vary and needs review. The demo implements the core local features. Calendar, template, automation and shared-access prompts describe future work, not completed functionality.

## Data and limits

Tasks are stored under `codedfemale-tutorial-planner-v1` in this browser's localStorage. There is no backend, login, shared project, account invitation, email, analytics or AI service. Owner names are labels. Clearing browser data or moving to a different device, browser or website origin can make saved work unavailable. Export backups regularly.

Imports accept JSON arrays up to 2 MB and 500 tasks. Invalid imports do not replace existing data. Unreadable saved data is not automatically overwritten; the example opens in memory and explains how to save the current session or reset. The export contains the current session, not unreadable historical data. Reset intentionally replaces previous saved data after confirmation. Avoid multiple editing tabs; there is no conflict resolution.

Use fictional or non-sensitive information for learning. A shared team application would need separate server-side storage, authentication, authorisation, backup and conflict-handling designs. A static-hosted version still gives each visitor a separate local copy.

## Checks

With Node.js installed:

```sh
node --test core.test.mjs
```

Files: `index.html` for structure, `style.css` for layout, `app.js` for interactions, `core.mjs` for validation and calculations, and `core.test.mjs` for focused automated checks. Fonts reuse Product Studio's Open Sans and Playfair Display families, with their licences in `assets/`. No original Coded Female logo has been replaced.

Created for [Coded Female](https://codedfemale.com). No licence is granted for application code or brand assets unless separately stated. Font licences apply separately.
