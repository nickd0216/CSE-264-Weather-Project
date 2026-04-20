# CSE-264-Weather-Project
Final Project for CSE 264 Lehigh University

## Project Overview
- Name: SproutCast
- Description: SproutCast is a niche weather platform designed for gardeners, farmers, and plant enthusiasts. It provides standard global weather forecasting alongside dynamically generated plant recommendations based on the user's local climate and current weather conditions.
- Purpose: SproutCast allows users to view the weather forecast and local, in-season plants. This lets people plan a garden, check the weather, and learn about seasonal plant life around the world. 

## Team Members & Roles
- Zoe Ford – Frontend Developer & External API Integration (UI/UX, OpenWeather and Plant API logic)
- Nick Dubois – Backend Developer & Database Architect (Internal REST API, Schema design)
- Chris Skabich – Full-Stack Developer & Authentication (User roles, routing, UI interactivity) 

## Application Features
- User Accounts & Roles: We implemented a role-based system.
  1. Unregistered Users: Can view basic current weather and a general list of in-season plants.
  2. Registered Users (Free): Can save their "Location" to bypass searching and save a "Virtual Garden" to track specific plants.
  3. Admin Users: Have access to an admin dashboard where they can manage user accounts and manually curate/update the local plant database.
- Database: We used PostgreSQL to store user credentials, user-specific settings (saved locations, favorite plants), and cached plant data to reduce external API calls.
- Interactive UI: The frontend features a dynamic search bar with auto-complete for cities, interactive weather cards that expand for 5-day forecasts, and a drag-and-drop "Virtual Garden" dashboard.
- New Library or Framework: We integrated Framer Motion for smooth, interactive UI animations (e.g., weather icons transitioning based on state) and Leaflet.js (via React-Leaflet) to render an interactive map showing global weather patterns.
- Internal REST API: We built a custom API layer in Next.js (/api/users, /api/garden, /api/plants) to handle CRUD operations for user profiles, authenticating roles, and saving/retrieving their virtual garden data from our database.
- External REST API: The app fetches real-time and forecasted meteorological data using the OpenWeather API. We also integrated the Perenual API to fetch plant species data, filtering the results based on the temperature and weather data retrieved from OpenWeather.

## Installation and Set-Up Instructions

## API Keys & Database Setup
