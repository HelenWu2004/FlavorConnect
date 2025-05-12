# FlavorConnect

FlavorConnect is a web application that allows users to discover, share, and connect over recipes. The application features user authentication, recipe management, tagging, comments, favorites, and a real-time chat system.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed on your machine
- Git for cloning the repository

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd FlavorConnect
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build and start all necessary containers (MySQL, MongoDB, Backend, Frontend, Scheduler)
   - Initialize the databases with sample data
   - Start the backend API server and frontend application

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## Stopping the Application

To stop the application, press `Ctrl+C` in the terminal where Docker Compose is running, or run:
```bash
docker-compose down
```

To completely remove all data and start fresh, use:
```bash
docker-compose down -v
```

## Architecture

FlavorConnect consists of the following components:

- **Frontend**: Next.js application with TypeScript and Tailwind CSS
- **Backend**: FastAPI application with SQLAlchemy and Pydantic
- **Databases**:
  - MySQL for relational data (users, recipes, tags, comments, favorites)
  - MongoDB for chat functionality (messages, group chats)
- **Scheduler**: Python service for scheduled tasks

## Development

For development purposes, all services are containerized using Docker, making it easy to set up and run the application in any environment.

