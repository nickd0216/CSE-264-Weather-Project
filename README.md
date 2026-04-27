# CSE-264-Weather-Project
Final Project for CSE 264 Lehigh University

## Project Overview
- **Name:** SproutCast
- **Description:** SproutCast is a niche weather platform designed for gardeners, farmers, and plant enthusiasts. It provides standard global weather forecasting alongside dynamically generated plant recommendations based on the user's local climate and current weather conditions.
- **Purpose:** SproutCast allows users to view the weather forecast and local, in-season plants. This lets people plan a garden, check the weather, and learn about seasonal plant life around the world. 

## Team Members & Roles
- **Zoe Ford –** Frontend Developer & External API Integration (UI/UX, OpenWeather and Plant API logic)
- **Nick Dubois –** Backend Developer & Database Architect (Internal REST API, Schema design)
- **Chris Skabich –** Full-Stack Developer & Authentication (User roles, routing, UI interactivity) 

## Application Features
- **User Accounts & Roles:** We implemented a role-based system.
  1. Unregistered Users: Can view basic current weather and a general list of in-season plants.
  2. Registered Users (Free): Can save their "Location" to bypass searching and save a "Virtual Garden" to track specific plants.
  3. Admin Users: Have access to an admin dashboard where they can manage user accounts and manually curate/update the local plant database.
- **Database:** We used PostgreSQL to store user credentials, user-specific settings (saved locations, favorite plants), and cached plant data to reduce external API calls.
- **Interactive UI:** The frontend features a dynamic search bar with auto-complete for cities, interactive weather cards that expand for 5-day forecasts, and a drag-and-drop "Virtual Garden" dashboard.
- **New Library or Framework:** We integrated Framer Motion for smooth, interactive UI animations (e.g., weather icons transitioning based on state) and Leaflet.js (via React-Leaflet) to render an interactive map showing global weather patterns.
- **Internal REST API:** We built a custom API layer in Next.js (/api/users, /api/garden, /api/plants) to handle CRUD operations for user profiles, authenticating roles, and saving/retrieving their virtual garden data from our database.
- **External REST API:** The app fetches real-time and forecasted meteorological data using the OpenWeather API. We also integrated the Perenual API to fetch plant species data, filtering the results based on the temperature and weather data retrieved from OpenWeather.

## Installation and Set-Up Instructions
**Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed on your machine.

### 1. **Clone the repository**
```bash
   git clone [https://github.com/YourUsername/CSE-264-Weather-Project.git](https://github.com/YourUsername/CSE-264-Weather-Project.git)
   cd CSE-264-Weather-Project
```

### 2. **Install dependencies**
```
npm install
```
(Note: this will install Next.js, React, Framer Motion, Leaflet, PostgreSQL client, and other required packages defined in package.json.)

### 3. **Configure environment**
Create an .env.local file in the root directory and populate it with the necessary API keys and database credentials (see the **API Keys & Database Setup** section below for details.)

### 4. **Run the development server**
```
npm run dev
```

### 5. **View the application**
Open http://localhost:3000 in your browser to see the app.

## API Keys & Database Setup
To run SproutCast locally, you will need to set up a PostgreSQL database (we used Neon) and obtain free API keys from OpenWeather and Perenual.

### 1. **Environment Variables (.env.local)**

Create a file named .env.local in the root of your project and add the following keys:

```
# Database
DATABASE_URL="postgres://user:password@host/database_name?sslmode=require"

# External APIs
OPENWEATHER_API_KEY="your_openweather_api_key_here"
PERENUAL_API_KEY="your_perenual_api_key_here"
```

  * OpenWeather API: Get a free API key at openweathermap.org/api.
  * Perenual API: Get a free API key at perenual.com.

### 2. **Database Initialization**

Once your DATABASE_URL is configured, you need to create the required tables (users, plants, virtual_garden).

  * Run the provided SQL schema file (located at path/to/your/schema.sql if applicable) in your PostgreSQL console or Neon dashboard.

### 3. **Seeding the Database**

To populate the application with initial plant data so the "Thriving Right Now" recommendations work immediately:

  1. Ensure your local server is running (npm run dev).

  2. Open a browser and navigate to the admin seeder route: http://localhost:3000/api/admin/seed

  3. Wait a few moments. The page will return a JSON success message indicating that 100+ real plants with calculated temperature thresholds have been fetched from Perenual and saved into your PostgreSQL database.