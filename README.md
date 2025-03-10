# Next.js Chess App with Clerk Auth & Redis

A modern chess application built with **Next.js** and **TypeScript** featuring real-time gameplay, timed matches, and per-user statistics (wins, losses, draws, and dynamic ELO ratings) powered by **Redis**. Authentication is handled by **Clerk** for secure, multi-device access.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
  - [Environment Variables](#environment-variables)
  - [Clerk Setup](#clerk-setup)
  - [Redis Setup](#redis-setup)
- [Usage](#usage)
- [License](#license)

---

## Features

- **Real-Time Chess Gameplay:** Play chess against a basic AI with move-by-move updates.
- **Timed Matches:** Choose between different time controls (3, 5, or 10 minutes).
- **Per-User Statistics:** Track games played, wins, losses, draws/stalemates, and dynamic ELO ratings.
- **Authentication:** Secure login using Clerk.
- **Backend Integration:** Persistent storage for user stats via Redis.
- **Modern UI:** Responsive and visually appealing design using Tailwind CSS.

---

## Tech Stack

- **Next.js:** React framework for server-side rendering and API routes.
- **TypeScript:** Type-safe JavaScript for robust, scalable code.
- **Redis:** Fast, in-memory data store for persisting per-user statistics.
- **Clerk Auth:** Comprehensive user authentication and management.

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/RonyBubnovsky/Chess-Next.js.git
cd Chess-Next.js
```

### 2. Install Dependencies

Install the required packages:

```bash
npm install
```

This project uses:

- next
- react and react-dom
- typescript
- redis
- @clerk/nextjs
- Tailwind CSS (or your preferred styling framework)

### 3. Create Your Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_HOST=
REDIS_PORT=
```

#### How to Get Each Value:

- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY & CLERK_SECRET_KEY:**

  - Sign up or log in to [Clerk.dev](https://clerk.dev).
  - Create a new application in the Clerk dashboard.
  - In the application settings, locate the Publishable Key and Secret Key.
  - Copy and paste them into your `.env.local` file.

- **REDIS_USERNAME, REDIS_PASSWORD, REDIS_HOST, REDIS_PORT:**
  - Sign up or log in to [Redis Cloud](https://redis.com).
  - Create a new Redis database instance.
  - In the database dashboard, you will find the connection details (username, password, host, and port).
  - Copy these values into your `.env.local` file.

### 4. Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Usage

### Authentication:

Users must log in via Clerk before accessing the chess page.

### Game Setup:

- Choose your color (or randomize).
- Select a time control (3, 5, or 10 minutes).

### Gameplay:

- Play chess against a basic AI.
- Moves are tracked, and the game ends with a win, loss, or draw.
- When the game ends, user stats (games played, wins/losses/draws, and ELO) are updated in Redis via the API.

### Statistics:

Before starting a game, your current statistics are displayed in a modern stats box.

### Navigation:

Use the provided "Home" button to navigate back to the main landing page.

---

## License

This project is licensed under the MIT License.
