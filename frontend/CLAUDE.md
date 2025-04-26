# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev`: Run app in development mode
- `npm run dev:web`: Run web version in development mode
- `npm run build`: Run type checking and build the application
- `npm run lint`: Lint JavaScript, TypeScript and React files
- `npm run format`: Format code with Prettier
- `npm run typecheck`: Run TypeScript type checking

## Code Style Guidelines
- **Component Structure**: Use functional components with React hooks
- **Typing**: Use TypeScript interfaces/types, return JSX.Element for components
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Imports**: Core libraries first, third-party next, local imports last, styles at end
- **Error Handling**: Use try/catch blocks and handle promises with .catch()
- **Styling**: Use TailwindCSS with class-based styling
- **Formatting**: Use semicolons, maintain consistent indentation

## Project Structure
- `/src/main`: Electron main process code
- `/src/preload`: Preload scripts for Electron
- `/src/renderer`: React frontend application
- `/src/renderer/components`: Reusable UI components
- `/src/renderer/components/atoms`: Atomic UI components