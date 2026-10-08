# Mergington High School Activities API

A FastAPI application that allows students to view activities and teachers to manage student registrations.

## Features

- View all available extracurricular activities
- Public activity and participant roster viewing
- Teacher-only student registration and unregistration

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Configure teacher credentials in the environment. Do not commit credentials to the repository:

   ```
   export TEACHER_USERNAME="teacher"
   export TEACHER_PASSWORD="replace-with-a-strong-password"
   ```

3. Run the application from this directory:

   ```
   uvicorn app:app --reload
   ```

4. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| GET    | `/teacher/session`                                                | Validate teacher credentials                                        |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Register a student (teacher credentials required)                   |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister a student (teacher credentials required)              |

Teacher credentials are read from `TEACHER_USERNAME` and `TEACHER_PASSWORD`. Use HTTPS when deploying because HTTP Basic credentials are sent with each teacher request.

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.
