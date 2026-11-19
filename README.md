# Helping Hands

**Disaster relief coordination for India**

Helping Hands is a hackathon prototype that brings community needs, relief supplies, and delivery coordination into one place. It is designed to help volunteers and coordinators understand reported needs and organize potential support.

> **Prototype notice:** The current app uses invented sample data held in browser memory. Sign-in is a demo flow, not real authentication. Changes are not saved after you leave or refresh the page, and the app is not connected to a live database or relief organization.

## What it demonstrates

- An interactive relief map and community list
- Sample supply requests with urgency and verification status
- A review queue for coordinators
- Supply pledges and a stock/delivery workflow
- Activity entries showing actions taken during the demo
- Different demo views for volunteers and coordinators

All communities, reports, pledges, and figures shown in the demo are illustrative, not verified real-world information. Do not use the prototype to make emergency-response decisions.

## Technology

- **Next.js 16** with the App Router
- **React 19** and **TypeScript**
- **Tailwind CSS 4** for styling
- **shadcn/ui** components and Base UI primitives
- **Leaflet** and **React-Leaflet** for the map
- **Lucide React** for interface icons
- **Vercel Analytics** for production analytics
- **pnpm** for package management

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a production build:

```bash
pnpm build
pnpm start
```

## Project structure

```text
app/          Next.js routes, global styles, and root layout
components/   Dashboard, map, dialogs, and interface components
lib/          Sample data, app state, types, and data helpers
public/       Static images and branding assets
```

## Demo flow

1. Open the app and use the demo sign-in screen.
2. Explore community markers and sample requests on the relief map.
3. Try reporting a need or pledging supplies.
4. Switch to a coordinator role to explore review, stock, and delivery workflows.
5. Review the activity section to see the demo actions recorded in the current session.

Because this is a prototype, the demo role selector does not verify identity or enforce production access controls.

## Next steps toward a real service

- Add real authentication and role-based authorization.
- Connect a database and persist reports, pledges, stock, and delivery updates.
- Define report verification and moderation procedures with relief partners.
- Add privacy safeguards, auditability, and protections against false or harmful reports.
- Validate map locations and operational workflows with affected communities and trusted organizations.
- Provide clear emergency guidance and ensure the app is not presented as a replacement for official services.

## Hackathon presentation summary

Helping Hands is a **Next.js and React prototype** for visualizing sample community needs and demonstrating how supply pledges could be reviewed and coordinated. The current version is a frontend demonstration with temporary sample state; persistent storage, real authentication, and verified live data are future work.
