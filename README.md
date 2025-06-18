# FitTech Backend 🏋️‍♂️

Backend API for the FitTech fullstack fitness application.  
This service handles data management, user authentication, AI integration, and serves structured workout guides to the frontend.

**Project's Frontend:** https://github.com/FiorenNathasia/fittech-frontend

---

## 🚀 Features

- RESTful API built with Express.js
- User authentication using JWT and OAuth
- PostgreSQL database for scalable data storage
- Integration with OpenAI’s ChatGPT API for AI-powered workout generation
- Transcript extraction and processing for workout videos
- Supports workout favoriting and offline access

---

## Endpoints

- `POST /api/auth/signup` – Registers a new user
- `POST /api/auth/login` – Logs in an existing user
- `GET /api/user` – Returns the current user's information
- `POST /api/videos` – Saves a new workout video from a YouTube URL and transcribes it
- `GET /api/videos` – Returns all workout videos for the current user
- `Supports optional query: filterFavourites=true` to return only favourites
- `GET /api/videos/:id` – Returns a specific workout video by ID
- `DELETE /api/videos/:id` – Deletes a specific workout video by ID
- `PUT /api/videos/:id/favourite` – Updates the is_favourite status of a workout

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **JWT (OAuth)** for secure authentication
- **OpenAI ChatGPT API** for AI processing

---
