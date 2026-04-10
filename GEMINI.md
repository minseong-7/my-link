# Project Overview

This is a modern web application built with **Next.js 16.2.3** and **React 19**, featuring **Tailwind CSS 4** for styling and **TypeScript** for type safety. The project is structured using the Next.js **App Router** architecture.

The core application code is located in the `my-profile/` directory.

## Technical Stack

- **Framework:** Next.js 16.2.3 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4, Geist Fonts (Geist Sans & Geist Mono)
- **Language:** TypeScript
- **Configuration:** ESLint 9, PostCSS

## Project Structure

- `my-profile/app/`: Contains the application routes, layouts, and components (App Router).
- `my-profile/public/`: Static assets such as images and SVGs.
- `my-profile/next.config.ts`: Next.js configuration.
- `my-profile/tsconfig.json`: TypeScript configuration.
- `my-profile/globals.css`: Global styles using Tailwind CSS 4.

## Building and Running

All commands should be run from within the `my-profile/` directory.

- **Development:** `npm run dev` - Starts the development server.
- **Build:** `npm run build` - Creates an optimized production build.
- **Production Start:** `npm run start` - Starts the production server.
- **Linting:** `npm run lint` - Runs ESLint to check for code quality issues.

## Development Conventions

- **Next.js Version Note:** This project uses a version of Next.js (16.2.3) that may contain breaking changes compared to previous versions. Refer to internal documentation in `node_modules/next/dist/docs/` if available.
- **Styling:** Use Tailwind CSS 4 utility classes. Global variables and themes are defined in `app/globals.css`.
- **Typing:** Strict TypeScript is enabled. Ensure all new components and functions are properly typed.
- **Fonts:** Utilize `next/font` for Geist Sans and Geist Mono as configured in `app/layout.tsx`.
- **Components:** Prefer Server Components by default; use `'use client'` only when client-side interactivity is required.

## Key Files

- `my-profile/app/layout.tsx`: Root layout defining the HTML structure and global providers.
- `my-profile/app/page.tsx`: The main entry page of the application.
- `my-profile/AGENTS.md`: Contains specific instructions/warnings for AI agents regarding this project's Next.js version.
