# Kitchen KDS App

This repository contains a Vite + React implementation of a kitchen display system (KDS) UI along with an optional Express-based print webhook mock server. The application showcases sample orders, service type filters, and automatic overdue highlighting to simulate a real kitchen production screen.

## Prerequisites

- [Node.js](https://nodejs.org/) **18.x** or newer (ships with npm)

## Getting started

1. Clone the repository and move into the project directory:

   ```bash
   git clone <repo-url>
   cd kitchen-kds-app/kitchen-kds-app
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server (accessible on your local network thanks to the `--host` flag):

   ```bash
   npm run dev
   ```

   The terminal output will display a local URL (typically `http://localhost:5173/`) that you can open in a browser.

### Installation walkthrough cast

If you would prefer a demo of the commands above, the repository includes an [Asciinema-compatible terminal recording](docs/install-demo.cast).
You can play it back locally after cloning the repo:

```bash
asciinema play docs/install-demo.cast
```

This will show the exact `git clone`, `npm install`, `npm run build`, and `npm run preview -- --host` commands executed in sequence.

## Production build & preview

To produce an optimized production build, run:

```bash
npm run build
```

You can inspect the build locally with Vite's preview server:

```bash
npm run start
```

## Optional print webhook mock server

The repository includes a lightweight Express server (`server.js`) that logs simulated print jobs. You can run it separately while the UI is open:

```bash
npm run server
```

It listens on `http://localhost:4000` and simply prints incoming JSON payloads to the console.

## Project structure

```
kitchen-kds-app/
└── kitchen-kds-app/
    ├── src/                  # React components and global styles
    ├── index.html            # Vite entry HTML file
    ├── package.json          # npm scripts and dependencies
    ├── server.js             # Optional Express mock server
    └── vite.config.ts        # Vite configuration
```

## Customisation tips

- Update `SAMPLE_ORDERS` in `src/KitchenKDSApp.tsx` to plug in live order data from your back-of-house system.
- Replace the styling in `src/index.css` if you would like to integrate Tailwind or another design system.
- Extend the Express server to forward print jobs to your kitchen printer or another API when you integrate with your real environment.

