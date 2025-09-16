# Roton Meeting Management

A comprehensive meeting management and focus songs tracking application for the Roton team.

## Features

- **Meeting Management**: Schedule and track team meetings with agenda and minutes
- **Focus Songs Tracking**: Monitor progress across different channels (YouTube, Spotify, Social Media, Radio, Press)
- **Task Management**: Assign and track tasks with different priority levels
- **Team Management**: Manage team members and their responsibilities
- **Calendar Integration**: Track planned actions and deadlines
- **Daily Metrics**: Monitor performance metrics for focus songs

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Authentication**: Replit Auth integration
- **State Management**: TanStack Query

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your database (PostgreSQL)
4. Configure environment variables
5. Run database migrations: `npm run db:push`
6. Start the development server: `npm run dev`

## Deployment

This application is designed to be deployed on Railway or similar platforms. Make sure to:

1. Set up PostgreSQL database
2. Configure environment variables
3. Run the build command: `npm run build`
4. Start the production server: `npm start`

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared types and schemas
- `/components.json` - shadcn/ui configuration

## License

MIT
