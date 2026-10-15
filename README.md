# Campus Nav

Campus Nav is a full-stack web application designed to help Grand View University students navigate campus buildings, locate classrooms, manage their schedules, and discover campus events.

The application combines interactive 3D indoor maps with personalized scheduling and navigation features to make navigating campus easier and more accessible.

## Features

### Interactive Campus Navigation
- Interactive 3D campus map powered by Mappedin
- Search for campus buildings and classrooms
- Get directions between locations on campus
- Use your current location as a starting point
- Choose accessible routes to avoid stairs

### Class Schedules
- Add and manage personal class schedules
- Organize classes by day and time
- View upcoming classes and personal schedule items
- Navigate directly to classroom locations
- Save schedules to individual user accounts

### Events and Study Groups
- Create, edit, and delete campus events and study groups
- Place event pins on the campus map
- Create recurring weekly events
- Set events as public or private
- Invite specific users to private events
- Automatically hide expired events and remove them from the database after 30 days

### User Accounts
- User registration and secure login
- JWT-based authentication
- Individual user schedules and events
- Role-based authorization for users and administrators

### Responsive Design
- Desktop and mobile-friendly interface
- Light and dark mode
- Consistent navigation across application pages

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
| Deployment & Hosting | Vercel, Render |

## Screenshots

The following screenshots showcase the Campus Nav interface and its main features.

### Home Dashboard
![Campus Nav Home Dashboard](campus-nav/dashboard.png)

### Interactive Campus Map
![Campus Nav Map](campus-nav/map.png)

### Indoor Navigation
![Campus Nav Indoor Navigation](campus-nav/directions.png)

### Class Schedule
![Campus Nav Schedule](campus-nav/schedule.png)

### Events and Study Groups
![Campus Nav Events](campus-nav/events.png)

## Challenges and Limitations

### Mappedin Free Tier
One of the biggest challenges was working within the limitations of Mappedin's free tier. While it provides interactive 3D maps and indoor navigation, customization options are limited. This affected how directions, map labels, and navigation controls could be displayed.

To work around these restrictions, I developed custom React components that interact with the map while retaining some of Mappedin's built-in functionality.

### Campus Data Integration
Campus Nav does not have direct access to Grand View University's internal systems. As a result, classroom information and sample class data had to be created and managed independently.

I built a MongoDB database and REST API to store and manage this information, allowing the application to function without relying on university system integrations.

### Deployment
Deploying Campus Nav required configuring the frontend and backend as separate services using Vercel and Render. This involved managing environment variables, API connections, database access, and cross-origin requests.

Testing the deployed application helped identify and resolve configuration issues that were not present in the local development environment.

## Future Improvements

Although Campus Nav is fully functional, several improvements could make the application more useful and improve the overall navigation experience.

- **Custom Navigation Interface:** Replace Mappedin's built-in directions panel with a custom interface that provides clearer route information and navigation controls.
- **Step-by-Step Directions:** Provide detailed walking instructions to help users navigate between campus locations.
- **Improved Map Customization:** Expand control over map labels, styling, and navigation features beyond the limitations of Mappedin's free tier.
- **Campus System Integration:** Connect with Grand View University's existing systems to automatically import class schedules and classroom information.
- **Real-Time Campus Updates:** Provide notifications about temporary building closures, construction, and other changes that could affect navigation.
- **Expanded Accessibility Features:** Improve accessible navigation with additional information about elevators, entrances, and accessible pathways.

These improvements would help Campus Nav become a more complete campus navigation solution.

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

Campus Nav is deployed and available online.

**[Launch Campus Nav](https://campus-nav-ruby.vercel.app/)**

The React frontend is hosted on Vercel, while the Node.js and Express backend is hosted on Render. MongoDB Atlas provides cloud database storage.

Users can create an account to explore the campus map, find classrooms, manage schedules, and create campus events.
