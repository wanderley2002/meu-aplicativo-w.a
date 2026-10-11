# 💬 Monitoring App — Real-time Chat & Performance Ranking

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

A real-time chat application with dynamic user performance ranking. Built with WebSockets and modern web technologies.

## 🚀 Live Demo

Visit the application: [Ranking Energéticos](https://ranking-energeticos.onrender.com/)

---

## 🛠 Technologies

- **Backend:** Node.js + Express
- **Real-time Communication:** Socket.IO (WebSocket)
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript
- **Deployment:** Render

---

## ✨ Features

- 💬 **Real-time Chat** — Instant messaging using WebSocket connections
- 🏆 **Dynamic Ranking** — Live user performance metrics
- ⚡ **Auto-refresh** — Page updates without manual reload
- 📱 **Responsive Design** — Works seamlessly on all devices
- 🔄 **Live Updates** — See rankings update in real-time as users interact

---

## 📋 How It Works

1. Users connect via WebSocket
2. Messages are sent and received in real-time
3. Performance metrics are calculated
4. Rankings update dynamically for all connected users
5. Data is persisted in MySQL database

---

## ⚙️ How to Run

### Prerequisites

- Node.js (v14 or higher)
- MySQL server running
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/wanderley2002/meu-aplicativo-w.a.git
cd meu-aplicativo-w.a

# Install dependencies
npm install

# Create .env file with your database credentials
# DATABASE_URL=mysql://user:password@localhost:3306/dbname

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
monitoring-app/
├── public/
│   ├── index.html
│   ├── style.css
│   └── client.js
├── server.js          # Main server file
├── config/
│   └── database.js    # MySQL connection
├── routes/
│   └── chat.js        # Chat routes
├── package.json
├── .env              # Environment variables
└── README.md
```

---

## 📚 API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Get all users | GET | `/api/users` |
| Get chat messages | GET | `/api/messages` |
| Send message | POST | `/api/messages` |
| Get rankings | GET | `/api/rankings` |

---

## 🔌 WebSocket Events

| Event | Description |
|-------|-------------|
| `connect` | User connects to chat |
| `message` | New message received |
| `ranking-update` | Rankings refresh |
| `user-joined` | New user joins |
| `user-left` | User disconnects |

---

## 🌱 Learning Outcomes

This project demonstrates:

- Real-time communication with Socket.IO
- WebSocket protocol fundamentals
- Express.js server setup
- MySQL database integration
- Frontend-backend synchronization
- Event-driven architecture

---

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=chat_db
NODE_ENV=development
```

---

## 🚀 Deployment

The application is deployed on Render. To deploy your own version:

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy

---

## 🤝 Contributing

Feel free to fork this repository and submit pull requests for improvements.

---

## 📞 Contact

- GitHub: [wanderley2002](https://github.com/wanderley2002)
- Email: wanderleyariel7@gmail.com
- LinkedIn: [Wanderley Ariel](https://www.linkedin.com/in/wanderley-ariel)

---

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ by Wanderley Ariel**
