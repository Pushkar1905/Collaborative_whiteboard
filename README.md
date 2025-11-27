# 🎨 Real-Time Collaborative Whiteboard

A feature-rich, real-time collaborative whiteboard application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. This platform allows multiple users to join drawing rooms, collaborate on a shared canvas, and communicate through live chat.

### ✨ Live Demo

*   **Frontend (Vercel):** [Live App on Vercel](https://collaborative-whiteboard-with-real-time-drawing-jd48cw3vn.vercel.app/)
*   **Backend (Railway):** The backend is live but has no UI.

---

## 🚀 Key Features

- ✅**Real-Time Collaboration:** Drawings, shapes, and text appear instantly for all users in a room.
- ✅**Multiple Drawing Tools:**
    *   **Pen & Eraser:** Freehand drawing with adjustable brush size and opacity.
    *   **Shapes:** Create rectangles and circles.
    *   **Text Tool:** Add text directly onto the canvas.
- ✅**Public & Private Rooms:** Create public rooms for anyone to join or private, password-protected rooms for exclusive access.
- ✅**Live Chat:** A dedicated chat sidebar for users to communicate within each room.
- ✅**Undo & Redo:** Multi-level undo/redo for each user's actions.
- ✅**Canvas Controls:**
    *   Clear the entire canvas for everyone.
    *   Customize color, brush size, and opacity.
- ✅**Export Functionality:** Save the whiteboard as a PNG image or a PDF document.
- ✅**Responsive Design:** A seamless experience on both desktop and mobile devices.
- ✅**User Persistence:** Usernames are saved locally to persist across page reloads.

---

## 🛠️ Tech Stack

| Category      | Technology                                                                                                   |
|---------------|--------------------------------------------------------------------------------------------------------------|
| **Frontend**  | [React](https://reactjs.org/), [Styled Components](https://styled-components.com/), [Socket.IO Client](https://socket.io/docs/v4/client-api/), HTML5 Canvas API |
| **Backend**   | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Socket.IO](https://socket.io/), [Mongoose](https://mongoosejs.com/)                     |
| **Database**  | [MongoDB](https://www.mongodb.com/) (using MongoDB Atlas)                                                    |
| **Deployment**| [Vercel](https://vercel.com/) (Frontend), [Railway](https://railway.app/) (Backend)                                 |

---

## 📂 Project Structure

The project is organized as a monorepo with two main directories:

```
/
├── backend/        # Node.js, Express, Socket.IO server
│   ├── models/     # Mongoose data models (Room, User)
│   └── server.js   # Main server entry point
└── frontend/       # React application
    ├── public/
    └── src/
        ├── components/ # React components
        ├── context/    # Socket.IO and other contexts
        └── App.js      # Main app component
```

---

## 🏁 Getting Started

To run this project locally, follow these steps.

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (v16 or later)
*   [npm](https://www.npmjs.com/)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a MongoDB Atlas cluster.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Set up the Backend:**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Install dependencies
    npm install

    # Create a .env file in the /backend directory
    touch .env
    ```
    Add the following environment variables to your `backend/.env` file:
    ```env
    # The port for the backend server to run on
    PORT=5000

    # Your MongoDB connection string
    MONGODB_URI="mongodb://localhost:27017/collaborative-whiteboard"

    # The URL of the frontend for CORS policy
    FRONTEND_URL="http://localhost:3000"
    ```

3.  **Set up the Frontend:**
    ```bash
    # Navigate to the frontend directory from the root
    cd ../frontend

    # Install dependencies
    npm install

    # Create a .env file in the /frontend directory
    touch .env
    ```
    Add the following environment variable to your `frontend/.env` file:
    ```env
    # The URL of your backend server
    REACT_APP_SOCKET_URL="http://localhost:5000"
    ```

4.  **Run the Application:**
    *   **Start the Backend Server:** Open a terminal in the `/backend` directory and run:
        ```bash
        npm start
        ```
    *   **Start the Frontend App:** Open a separate terminal in the `/frontend` directory and run:
        ```bash
        npm start
        ```

The application should now be running!
*   Frontend: `http://localhost:3000`
*   Backend: `http://localhost:5000`

---

## ☁️ Deployment

This application is designed for easy deployment on platforms like Vercel and Railway.

### Deploying the Frontend (Vercel)

1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and create a new project, importing your repository.
3.  Configure the project settings:
    *   **Framework Preset:** `Create React App`
    *   **Root Directory:** `frontend`
4.  Add the following environment variable in **Settings -> Environment Variables**:
    *   `REACT_APP_SOCKET_URL`: The public URL of your deployed Railway backend (e.g., `https://my-backend-production.up.railway.app`).
5.  Deploy!

### Deploying the Backend (Railway)

1.  Push your code to the same GitHub repository.
2.  Go to [Railway](https://railway.app) and create a new project, linking it to your GitHub repo.
3.  Configure the service settings:
    *   **Root Directory:** `backend`
4.  Railway automatically detects the `package.json` and uses the `start` script. It also provides the `PORT` variable for you.
5.  Add the following environment variables in your service's **Variables** tab:
    *   `MONGODB_URI`: Your connection string for MongoDB Atlas.
    *   `FRONTEND_URL`: The public URL of your deployed Vercel frontend (e.g., `https://my-frontend.vercel.app`).
6.  Railway will automatically deploy upon commit. Make sure a domain is generated for your service in the **Settings** tab.

---

## 🔌 Socket.IO Events

The real-time functionality is powered by the following core Socket.IO events:

| Event             | Emitter | Data Sent / Received                               | Description                                     |
|-------------------|---------|----------------------------------------------------|-------------------------------------------------|
| `join-room`       | Client  | `{ roomId, username, password }`                   | A user attempts to join a specific room.        |
| `room-joined`     | Server  | `{ room, users }`                                  | Confirms successful room join.                  |
| `user-list`       | Server  | `[users]`                                          | Broadcasts the updated list of users in a room. |
| `stroke`          | Client  | `{ type, points, tool, color, ... }`               | Sends a completed freehand stroke to the server.|
| `stroke`          | Server  | `(Same as above)`                                  | Broadcasts the stroke to other users.           |
| `clear-canvas`    | Client/Server| `{ roomId }`                                | Clears the canvas for everyone in the room.     |
| `send-message`    | Client  | `{ roomId, username, message }`                    | Sends a chat message.                           |
| `receive-message` | Server  | `(Same as above)`                                  | Broadcasts a chat message to the room.          |

---

## 📷 Screenshots

![image](https://github.com/user-attachments/assets/181cfb29-9a38-4f02-8bf0-a1b5689be68a)



![image](https://github.com/user-attachments/assets/ce33011b-ecd4-4217-93f5-4a5f73e8332f)

---

## 👨‍💻 Author
**Ishu Raj Gupta**

📧 [Email](mailto:ishuraj5963@gmail.com)

🔗 [LinkedIn](https://www.linkedin.com/in/ishu-raj-gupta-7873072a3/)
