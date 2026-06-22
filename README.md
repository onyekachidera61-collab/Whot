# 9jaWin - Multiplayer WHOT Card Game

A complete production-ready multiplayer WHOT card game platform built with Node.js, Express, Socket.IO, and MySQL.

## Features

### 🎮 Game Features
- **Complete WHOT Rules**: Standard WHOT card game with all special cards
- **Multiplayer Gameplay**: 2, 3, or 4 player support
- **Real-time Synchronization**: Live card updates using Socket.IO
- **Anti-Cheat System**: Server-side card dealing and move validation
- **Mobile Responsive**: Works seamlessly on desktop and mobile

### 🎫 Game Modes
- **Free Games**: No money involved
- **Money Matches**: Entry fees with wallet system
- **Tournaments**: Admin-created tournaments with prize pools

### 💰 Wallet & Payment
- Deposit and withdrawal system
- Transaction history
- Automatic fee deduction
- Prize pool calculations
- 20% platform fee on games, 30% on tournaments

### 👥 User System
- User registration and login
- JWT authentication
- User profiles with avatars
- Online/offline status
- Friend system
- Leaderboards

### 📊 Admin Dashboard
- User management
- Tournament creation and management
- Revenue tracking
- Wallet operations
- Match history and statistics

### 💬 Communication
- In-game chat
- Emoji reactions
- Voice chat ready (architecture)
- Notifications

### 🔐 Security
- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT
- **Caching**: Redis (optional)

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations
- **JavaScript**: ES6+ with vanilla JS
- **Socket.IO Client**: Real-time communication

### DevOps
- **Docker**: Containerized deployment
- **Docker Compose**: Multi-container orchestration
- **Environment Config**: .env based

## Installation

### Prerequisites
- Node.js >= 18.0.0
- MySQL >= 5.7
- Redis (optional, for scaling)
- Docker & Docker Compose (optional)

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/onyekachidera61-collab/whot.git
cd whot
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create database**
```bash
mysql -u root -p < database/schema.sql
```

5. **Run migrations**
```bash
npm run migrate
```

6. **Seed sample data**
```bash
npm run seed
```

7. **Start the server**
```bash
npm run dev
```

### Docker Setup

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

## Project Structure

```
whot/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── events/
│   │   ├── validators/
│   │   └── app.js
│   ├── tests/
│   ├── scripts/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── game.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── main.js
│   │   ├── game.js
│   │   ├── socket-client.js
│   │   ├── auth.js
│   │   ├── wallet.js
│   │   └── ui.js
│   └── assets/
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/
│   ├── API.md
│   ├── GAME_RULES.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── .env.example
├── package.json
└── README.md
```

## API Documentation

See [API.md](docs/API.md) for complete REST API documentation.

### Key Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

**Game**
- `POST /api/games/room` - Create room
- `GET /api/games/room/:roomId` - Get room details
- `POST /api/games/room/join` - Join room
- `GET /api/games/history` - Get match history

**Wallet**
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit money
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/transactions` - Get transaction history

**Tournament**
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament (admin)
- `POST /api/tournaments/:id/join` - Join tournament
- `GET /api/tournaments/:id/results` - Get tournament results

**Admin**
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List users
- `POST /api/admin/tournament` - Create tournament
- `GET /api/admin/revenue` - Revenue report

## Game Rules

See [GAME_RULES.md](docs/GAME_RULES.md) for detailed game rules.

### Card Categories
- **Circle**: Green cards
- **Triangle**: Blue cards
- **Square**: Red cards
- **Star**: Yellow cards
- **Cross**: Purple cards

### Special Cards
- **WHOT 20**: Player chooses shape, next player follows
- **Hold On**: Skip next player
- **Pick Two**: Next player picks 2 cards
- **General Market**: All players pick cards
- **Suspension**: Block next player
- **Star**: Special action card

## Socket.IO Events

### Emitted by Client
- `join_game` - Join a game room
- `play_card` - Play a card
- `pick_card` - Pick from deck
- `leave_game` - Leave game
- `message` - Send chat message

### Emitted by Server
- `player_joined` - New player joined
- `turn_changed` - Turn passed to next player
- `card_played` - Card was played
- `game_started` - Game started
- `game_ended` - Game finished with winner
- `error` - Error occurred

## Database Schema

See database/schema.sql for complete schema.

### Main Tables
- `users` - User accounts
- `wallets` - User wallet balances
- `transactions` - Wallet transactions
- `matches` - Game matches
- `match_players` - Players in matches
- `game_sessions` - Active game sessions
- `tournaments` - Tournament definitions
- `tournament_players` - Tournament participants
- `rewards` - Prize pool rewards
- `friendships` - Friend relationships
- `messages` - Chat messages

## Security Considerations

✅ **Anti-Cheat**
- All card dealing on server
- Move validation on server
- Duplicate move prevention
- Secure Socket.IO events

✅ **Authentication**
- JWT tokens with expiration
- Refresh token rotation
- Secure password hashing
- CORS protection

✅ **Rate Limiting**
- API rate limiting
- Socket.IO event throttling
- Login attempt limiting

✅ **Data Validation**
- Input validation on all endpoints
- Joi schema validation
- SQL injection prevention
- XSS protection

## Performance

- **Scalable**: Designed for thousands of concurrent players
- **Real-time**: Socket.IO for instant updates
- **Optimized**: Efficient database queries
- **Caching**: Redis support for session caching
- **Load Balancing**: Ready for horizontal scaling

## Monitoring & Logging

- Winston logger for application logs
- Error tracking and reporting
- Performance monitoring
- Transaction logging

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support, email support@9jawin.com or open an issue in the repository.

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## WordPress Integration

The API is ready for WordPress integration. WordPress users can authenticate using JWT tokens obtained from `/api/auth/login` endpoint.

---

**Made with ❤️ for Nigerian gamers**