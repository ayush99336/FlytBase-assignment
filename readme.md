# DroneOperationsCentral

A comprehensive drone fleet management and mission planning platform for survey operations.

![DroneOperationsCentral Logo](generated-icon.png)

## Overview

DroneOperationsCentral is a modern web application that enables organizations to manage drone fleets, plan survey missions, monitor operations in real-time, and analyze performance data. The system is designed to streamline drone survey operations through an intuitive, feature-rich interface.

## Key Features

- **Mission Planning and Configuration**
  - Draw survey areas on interactive maps
  - Configure flight paths, altitudes, and patterns
  - Schedule missions with advanced parameters

- **Fleet Management Dashboard**
  - View and manage entire drone inventory
  - Track real-time status and battery levels
  - Perform maintenance and administrative actions

- **Real-time Mission Monitoring**
  - Visualize drone flight paths on a map
  - Track mission progress and telemetry data
  - Control missions with pause, resume, and abort functions

- **Analytics and Reporting**
  - Review mission statistics and performance metrics
  - Generate comprehensive reports
  - Analyze operational efficiency trends

## Technology Stack

- **Frontend**: React, TypeScript, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Mapping**: Leaflet, Leaflet-Draw
- **Real-time**: WebSockets
- **Visualization**: Recharts

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL
- NPM or Yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/DroneOperationsCentral.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/drone_central"
   ```

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Seed the database with sample data:
   ```
   npx tsx server/seed.ts
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Documentation

For comprehensive documentation, please refer to the [technical documentation](documentation.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Maps powered by [Leaflet](https://leafletjs.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)

---

Developed for FlytBase by Ayush © 2025