# Next.js Chess App with Clerk Auth & Redis

A modern chess application built with **Next.js** and **TypeScript** featuring real-time gameplay, timed matches, and per-user statistics (wins, losses, draws, and dynamic ELO ratings) powered by **Redis**. Authentication is handled by **Clerk** for secure, multi-device access. The chess AI utilizes a minimax algorithm with alpha-beta pruning to determine optimal moves.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Setup & Installation](#setup--installation)
  - [Environment Variables](#environment-variables)
  - [Clerk Setup](#clerk-setup)
  - [Redis Setup](#redis-setup)
- [Usage](#usage)
- [Chess AI](#chess-ai)
- [License](#license)
- [Contributing](#contributing)

---

## Features

- **Real-Time Chess Gameplay:** Play chess against an AI powered by minimax algorithm with move-by-move updates.
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

## Deployment

### Live Demo

Check out the live deployment of this application:
[https://chess-next-js.onrender.com](https://chess-next-js.onrender.com)

The application is hosted on Render and includes all features from the local version, including authentication via Clerk and persistent statistics storage with Redis.

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
- Tailwind CSS

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

## Chess AI

The application features a chess AI that employs a minimax algorithm with alpha-beta pruning to make decisions:

- **Minimax Algorithm:** The AI evaluates the game tree by considering all possible moves and their outcomes up to a certain depth.
- **Alpha-Beta Pruning:** Optimizes the search by eliminating branches that won't affect the final decision.
- **Positional Evaluation:** Pieces are valued not just by their traditional worth but also by their position on the board.
- **Depth Configuration:** The algorithm searches several moves ahead, with the depth adjustable in the codebase for different difficulty levels.

The AI evaluates board positions based on:

- Material advantage
- Piece positioning
- Control of the center
- Pawn structure
- King safety

This implementation provides a challenging opponent while maintaining reasonable performance for a web application.

## License

 This project is licensed under the MIT License.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please feel free to submit a pull request or open an issue with your ideas and suggestions.

Potential areas for contribution include:

- Multiplayer functionality
- Advanced AI improvements
- Additional game modes
- UI/UX enhancements
- Performance optimizations

Please ensure your code follows the project's coding standards and includes appropriate tests where applicable.
