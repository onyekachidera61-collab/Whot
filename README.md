# 9jaWin - Multiplayer WHOT Card Game

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

9jaWin is a full-stack multiplayer WHOT card game platform with real-time gameplay, wallet management, and tournament support.

## 🎮 Features

### Game Features
- **Real-time Multiplayer**: 2-4 players per game using WebSocket
- **WHOT Card Game**: Full implementation of traditional WHOT rules
- **Game Modes**: Free play and money matches
- **Tournaments**: Create and join tournaments with prize pools
- **Leaderboards**: Track player statistics and rankings
- **In-game Chat**: Real-time messaging during gameplay

### Wallet & Payments
- **Digital Wallet**: Deposit and withdraw funds
- **Payment Integration**: Paystack payment processor
- **Transaction History**: Track all deposits, withdrawals, and winnings
- **Secure Transactions**: Encrypted payment processing

### User Features
- **User Authentication**: JWT-based authentication
- **User Profiles**: Customizable profiles with avatar and bio
- **Friends System**: Add friends and see their status
- **Statistics**: Win/loss records and game history
- **Notifications**: Real-time game notifications

### Admin Dashboard
- **User Management**: View and manage users
- **Tournament Creation**: Create and manage tournaments
- **Analytics**: Platform statistics and revenue tracking
- **Content Moderation**: Manage reported content

## 🛠 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Socket.IO Client for real-time communication
- Responsive design (mobile-friendly)

### Backend
- Node.js with Express.js
- Socket.IO for WebSocket connections
- Sequelize ORM for MySQL
- JWT for authentication
- Redis for caching and sessions

### Database
- MySQL 8.0
- InnoDB storage engine
- Optimized indexes for performance

### DevOps
- Docker & Docker Compose
- Nginx reverse proxy
- PM2 process manager
- SSL/TLS support

## 📁 Project Structure

```
whot/
├── backend/              # Backend Node.js application
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   ├── events/      # Socket.IO handlers
│   │   └── utils/       # Helper functions
│   ├── tests/           # Unit & integration tests
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/            # Frontend static files
│   ├── index.html
│   ├── css/             # Stylesheets
│   └── js/              # Client-side scripts
├── database/            # Database files
│   ├── schema.sql       # Database schema
│   └── seeds.sql        # Sample data
├── docker/              # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
├── docs/                # Documentation
│   ├── API.md
│   ├── GAME_RULES.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MySQL >= 8.0
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/onyekachidera61-collab/whot.git
   cd whot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Setup Database**
   ```bash
   mysql -u root -p < database/schema.sql
   npm run migrate
   npm run seed  # Optional: Load sample data
   ```

5. **Start Development Server**
   ```bash
   # Terminal 1: Backend
   npm run dev

   # Terminal 2: Serve Frontend
   cd frontend
   python -m http.server 8000
   ```

6. **Access Application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:5000
   - Socket.IO: ws://localhost:5001

### Docker Deployment

1. **Build and Run**
   ```bash
   docker-compose up -d
   ```

2. **Initialize Database**
   ```bash
   docker-compose exec app npm run migrate
   docker-compose exec app npm run seed
   ```

3. **Access Application**
   - Frontend: http://localhost
   - API: http://localhost/api

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Game Rules](docs/GAME_RULES.md)** - WHOT game rules and scoring
- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment guide

## 🎮 Game Rules

**WHOT** is a Nigerian card game where players try to be the first to play all their cards.

### Basic Rules
- Each player gets 4 cards initially
- Play a card matching the shape or number of the top card
- WHOT (20) card can be played anytime and lets you choose a shape
- Special cards have unique effects:
  - **Hold On**: Skip next player
  - **Pick Two**: Next player picks 2 cards
  - **General Market**: All players pick 1 card
  - **Suspension**: Block next player

### Winning
- First player to play all cards wins
- In money matches, winner gets prize pool
- In tournaments, top positions get rewards

For detailed rules, see [GAME_RULES.md](docs/GAME_RULES.md)

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- Server-side game validation (anti-cheat)
- SQL injection prevention (Sequelize ORM)
- CORS configuration
- Rate limiting on API endpoints
- Secure WebSocket connections

## 📊 Database Schema

Main tables:
- `users` - User accounts and profiles
- `wallets` - User wallet balances
- `transactions` - Payment transactions
- `matches` - Game match records
- `match_players` - Players in each match
- `tournaments` - Tournament details
- `tournament_players` - Tournament participants
- `messages` - In-game chat messages
- `friendships` - Friend relationships

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- game.test.js

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- Database query optimization with indexes
- Redis caching for frequently accessed data
- Gzip compression for responses
- Lazy loading of game resources
- Connection pooling for database
- Socket.IO message compression

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in .env
```

### Socket Connection Failed
```bash
# Check socket server is running on port 5001
netstat -an | grep 5001

# Verify CORS settings in .env
```

### Port Already in Use
```bash
# Find and kill process
sudo lsof -i :5000
sudo kill -9 <PID>
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for more troubleshooting tips.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Onyekachidera** - Initial work

## 🙏 Acknowledgments

- WHOT card game community
- Open source contributors
- Nigerian tech community

## 📞 Support

For support, email support@9jawin.com or open an issue on GitHub.

## 🔗 Links

- **GitHub**: https://github.com/onyekachidera61-collab/whot
- **Website**: https://9jawin.com (Coming soon)
- **Community**: Discord (Link coming soon)

---

**Made with ❤️ in Nigeria**