# Overview

This is a full-stack web application designed to manage weekly meetings for Roton's music team. The application helps coordinate meetings across three departments (Marketing, Digital, A&R & International) with standardized meeting types including Marketing Meetings, Focus Songs Update/Strategy meetings, and Weekly Recap sessions. The system manages team members, tracks focus songs across multiple channels (YouTube, social media, Spotify, radio), assigns tasks with deadlines, and maintains meeting minutes with structured agendas.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Pattern**: RESTful API with CRUD operations for all entities
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: OpenID Connect integration with Replit Auth using Passport.js
- **Session Management**: Express sessions stored in PostgreSQL with connect-pg-simple

## Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Key Entities**:
  - Users (team members with department and role assignments)
  - Meetings (with type-specific templates and participant management)
  - Focus Songs (tracking progress across multiple channels)
  - Tasks (with assignments, deadlines, and status tracking)
  - Meeting Minutes (structured agenda and decision tracking)

## Authentication & Authorization
- **Authentication Provider**: Replit OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Role-based access with department-specific permissions
- **Security**: HTTP-only cookies with secure flags for session management

## Project Structure
- **Monorepo Layout**: Client, server, and shared code in separate directories
- **Shared Schema**: Common TypeScript types and Zod schemas in `/shared`
- **Type Safety**: End-to-end TypeScript with strict compilation settings
- **Build Process**: Vite for frontend bundling, esbuild for server compilation

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections
- **Connection Pooling**: @neondatabase/serverless with WebSocket constructor

## Email Services
- **SendGrid**: Email notifications for task assignments and meeting reminders
- **Configuration**: API key and sender email configuration via environment variables

## Authentication Services
- **Replit OIDC**: OpenID Connect provider for user authentication
- **Session Storage**: PostgreSQL table for distributed session management

## Development Tools
- **Replit Integration**: Custom Vite plugins for development banner and cartographer
- **Runtime Error Handling**: Replit error overlay for development debugging

## UI Framework
- **Radix UI**: Headless UI primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon library for UI elements

## Build & Development
- **Vite**: Fast development server and optimized production builds
- **TypeScript**: Strict type checking across frontend and backend
- **ESM**: Modern ES modules throughout the application stack