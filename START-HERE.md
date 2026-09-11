# Start here

This folder contains the complete source code for the **Global Gate Logistics** website
(`global-gate.us`). The site is **built and tested, but not yet live on the internet**.

## Read these files, in this order

1. **[docs/HANDOFF.md](docs/HANDOFF.md)** — the handoff guide. What exists, what's missing,
   how to put the site live, and the two remaining work packages (AI search visibility, and
   analytics). **Start here.**
2. **[docs/PROMPTS.md](docs/PROMPTS.md)** — how to work with Claude Code on this project:
   ready-made prompts for each task, and how to check the work. Read this before your first
   session.
3. **[README.md](README.md)** — day-to-day maintenance: the commands, and which file to edit
   to change any piece of content on the site.

Everything else in this folder is referenced from those three. (`CLAUDE.md` is read
automatically by Claude Code at the start of every session — you never need to open it
yourself, but it's why you don't have to re-explain the project each time.)

## What this folder is

| Folder | Contents |
|---|---|
| `src/` | The website itself — pages, components, and the company data that fills them |
| `public/` | Images, fonts, and the files search engines and AI crawlers read |
| `tests/` | 269 automated tests that verify the site still works after any change |
| `docs/` | The handoff guide, plus the original design spec and build plan |
| `.superpowers/` | The build ledger — a record of every task, every defect found, and 20 minor items left open |

## Before doing anything else

The site has never been deployed. There is no hosting account, no domain configuration, and
no email delivery set up yet — all three need the business owner's own accounts.
**Part A of [docs/HANDOFF.md](docs/HANDOFF.md)** walks through it step by step, in order.

## To run the site on your own machine

You need [Node.js](https://nodejs.org) version 20.11 or newer. Then, in a terminal in this
folder:

```
npm install
npm run dev
```

Open `http://localhost:4321`. If `node_modules/` was not included in the copy you received,
`npm install` recreates it — that is normal and expected.
