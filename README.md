# Campus Nav

Campus Nav is a full-stack web application designed to help Grand View University students navigate campus buildings, locate classrooms, manage their schedules, and discover campus events.

The application combines interactive 3D indoor maps with personalized scheduling and navigation features to make navigating campus easier and more accessible.

## Features

- **Interactive 3D Campus Map:** Explore campus buildings, floors, and classrooms using MappedIn.
- **Classroom Navigation:** Search for classrooms and generate directions from a selected starting location or the user's current location.
- **Accessible Routes:** Request routes that accommodate accessibility needs.
- **Personalized Schedules:** Save classes and personal schedule items, organized by day.
- **Next Up:** View the current or upcoming scheduled activity and access navigation when a location is available.
- **Campus Events and Study Groups:** Create, browse, edit, and manage event pins, including recurring and private events.
- **User Authentication:** Secure registration and login using JWT authentication and password hashing.
- **Responsive Interface:** Desktop, tablet, and mobile layouts with light and dark themes.

## Technologies

| Category | Technologies |
|---|---|
| Frontend | React, JavaScript, SCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Mapping | MappedIn |
| API Testing | Postman |
| Version Control | Git, GitHub |

## Application Screenshots

Screenshots of the completed application will be added here.

## Development Challenges

One of the primary challenges was implementing campus navigation within the limitations of MappedIn's free tier. The application integrates MappedIn's existing mapping and routing capabilities with a custom React interface for classroom searches, schedules, and events.

Additional challenges included organizing campus room data, implementing recurring events and visibility rules, managing authenticated user data, and ensuring consistent functionality across desktop and mobile devices.

## Running Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas database
- Required environment variables for the backend and frontend

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Environment variables must be configured before running the application. Sensitive credentials are not included in this repository.

## Project Background

Campus Nav was developed as a software development and project management project at Grand View University.

The application demonstrates full-stack development, REST API integration, database design, authentication, responsive interface design, and the integration of third-party mapping technology.

## Live Application

A link to the deployed application will be added after deployment.