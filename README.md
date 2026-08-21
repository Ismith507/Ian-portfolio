# Ian's Portfolio

A personal portfolio website showcasing projects and work. Built with modern web technologies for fast performance and a great user experience.

## Tech Stack

- **Next.js 14** — a React framework that handles routing, server-side rendering, and deployment
- **React 18** — the JavaScript library for building interactive user interfaces
- **TypeScript** — a superset of JavaScript that adds type safety, catching errors before runtime
- **Tailwind CSS 3** — a utility-first CSS framework for styling

## Prerequisites

You'll need these installed on your machine:

- **Node.js 18 or newer** — the JavaScript runtime that runs your local development server and build tools
- **npm** — Node's package manager for installing dependencies (comes bundled with Node.js)

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

The development server auto-reloads when you edit files.

### Other Commands

```bash
npm run build    # Create an optimized production build
npm start        # Run the production build locally
npm run lint     # Check code for style and potential errors
```

## Project Structure

All pages live in the `app/(general)/` folder (the parentheses group related routes without changing their URLs):

- **`app/(general)/page.tsx`** — the home page with a biography
- **`app/(general)/layout.tsx`** — shared layout with top navigation and footer used on all pages
- **`app/(general)/contact/page.tsx`** — a contact form (currently front-end only)
- **`app/(general)/projects/page.tsx`** — a gallery of projects, built from `components/link-card.tsx` cards, including a link to the interactive fractal explorer and an external C++ chess engine repo
- **`app/(general)/projects/fractals/page.tsx`** — an interactive Mandelbrot fractal explorer (the Mandelbrot set is a famous mathematical fractal drawn by repeating a simple formula)

### Fractal Explorer

The fractal page renders `components/fractal-canvas.tsx`, a client-side component that draws onto an HTML canvas and supports these keyboard controls:

- **Arrow keys** — pan around the fractal
- **Spacebar** — zoom in
- **Shift** — zoom out
- **Reset button** — return to the starting view

The fractal rendering uses two supporting files:

- `lib/mandelbrot/original-ported.ts` — the `drawPorted` function the canvas actually uses to draw the fractal
- `lib/mandelbrot-set.ts` — a `MandelbrotSet` class implementation of the same idea

## Deployment

This is a standard Next.js application. The easiest deployment is [Vercel](https://vercel.com), the platform built by the Next.js creators. Connect your GitHub repository to Vercel for automatic deployments on every push to your main branch.
