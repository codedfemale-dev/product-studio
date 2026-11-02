# Product Studio by Coded Female

An interactive example of a thoughtful product team setup. Explore the pre-filled Mentor Match workspace, then adapt it to your own product and team.

**[Open Product Studio](https://codedfemale-dev.github.io/product-studio/)** · **[Coded Female](https://codedfemale.com)**

## What is inside?

- **Overview:** Product Goal, Sprint Goal, current focus, flow counts, blockers and upcoming conversations.
- **Outcome roadmap:** editable Now, Next and Later outcomes, success measures, evidence, confidence and next learning steps.
- **Ordered backlog:** ten connected examples with user needs, priorities, owners, optional estimates, acceptance criteria, dependencies and linked outcomes. Search, filter, reorder and add work to the Sprint.
- **Delivery board:** Ready, In progress, In review and Done. Drag cards or use accessible Move item controls. The example work-in-progress limit encourages finishing before starting.
- **Team calendar:** a navigable monthly calendar, a readable agenda list, meeting purposes, participants, agendas, notes and calendar export.
- **Team essentials:** discovery, metrics and guardrails, risks, decisions, roles, working agreements, Definition of Done and retrospective experiments.
- **Personalisation:** editable product details and Sprint dates, four backgrounds, local saving, JSON backup and restore, and reset with confirmation.

The calendar starts with a two-week example, including ten Daily Scrums, Sprint planning, Sprint review, Sprint retrospective, refinement and customer discovery. Sessions do not repeat automatically. Changing Sprint dates does not reschedule meetings.

All sample names, research and figures are illustrative. This is an educational example, not a claim about a real team. Meeting purposes were checked against the [Scrum Guide](https://scrumguides.org/scrum-guide.html); the team’s optional practices, estimates, priorities and meeting durations are examples to adapt. The roles include a Product Owner, Scrum Master and cross-functional Developers.

## Visual palette

Coastal slate uses deep navy (`#233642`), mist blue (`#DCE7EA`), soft white (`#F8FAFA`) and warm brass (`#C49A61`). The default scene is coast, with translucent sections and locally served Playfair Display and Open Sans. Existing saved boards and background choices remain available. Priority and blocker colours retain distinct labels and colours.

## Your personal copy

Changes are saved in **localStorage in your current browser**, using the `codedfemale-product-studio-v1` key. Each visitor gets their own independent workspace. There is no account, backend, shared editing, analytics, notification service or calendar connection. The hosting provider handles normal web requests; the application does not transmit board content.

Choose **Backup & restore → Export workspace** regularly. Clearing browser data, changing browsers, devices or website origins can make your saved work unavailable. To move to another device, export a backup and import it there. Import validates the file and asks before replacing your workspace. Imports replace rather than merge. The initial local preview and GitHub Pages are different origins, so their saved work is separate.

If an old saved workspace cannot be read, the app protects the original value and offers a raw recovery export. Storage failure leaves your changes in memory and shows a backup warning.

Calendar exports include all currently recorded meetings in `.ics` format using floating local times. Check time zones in the receiving calendar. They are not invitations or a live subscription; participants are descriptive text. Importing the same export repeatedly may create duplicates depending on your calendar application.

## Run locally

No build step or installation is required. Serve the project directory with a static server, for example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Serving over HTTP gives consistent browser storage behaviour. Avoid opening the file directly with a `file:` URL.

Run the automated checks with Node.js:

```sh
node --test tests.cjs
```

## Publish on GitHub Pages

In the repository, open **Settings → Pages**. Choose **Deploy from a branch**, then **main** and **/ (root)**, and save. The app uses relative asset paths so it works at a project URL. No secrets or services are required. The `.nojekyll` marker disables Jekyll processing.

## Files

- `index.html`: application shell and accessible dialog.
- `style.css`: responsive styling and CSS landscape backgrounds.
- `seed.js`: connected example data, relative Sprint dates and meeting agendas.
- `app.js`: rendering, editing, local saving, validation, calendar and backup exports.
- `tests.cjs`: validation, persistence, flow, recovery and calendar format checks.
- `assets/`: locally served Playfair Display and Open Sans fonts with their licences.

No framework, external script, remote font request or AI service is used. User content is escaped before HTML rendering. The app limits imports to 5 MB and 1,000 records per collection. This is a personal showcase and planning tool; shared team use would require a separate persistence and access design.

Created for [Coded Female](https://codedfemale.com). Existing brand identity and font families retained. Font licences are provided in `assets/`. No licence is granted for the application code or brand assets unless separately stated.
