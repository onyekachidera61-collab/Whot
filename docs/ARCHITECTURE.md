# Architecture Documentation

## System Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Frontend      │         │   Backend        │         │    Database      │
│  (HTML/CSS/JS)  │◄───────►│  (Node.js/Exp)   │◄───────►│     (MySQL)      │
│                 │  HTTP   │                  │   ORM   │                  │
│  Socket.IO      │         │  Socket.IO       │         │   Tables:        │
│  Client         │◄───────►│  Server          │         │   - users        │
└─────────────────┘ WebSocket└──────────────────┘         │   - wallets      │
                                    ▲                      │   - matches      │
                                    │                      │   - games        │
                              ┌─────┴──────┐              │   - etc.         │
                              │  Game      │              └──────────────────┘
                              │  Engine    │
                              └────────────┘
```

## Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations
- **JavaScript (ES6+)**: Vanilla JS for interactivity
- **Socket.IO Client**: Real-time communication

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.IO**: Real-time multiplayer
- **Sequelize**: ORM for MySQL
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing

### Database
- **MySQL**: Relational database
- **InnoDB**: Storage engine
- **Connection Pooling**: Optimized queries

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container setup
- **Environment Configuration**: .env based

## Project Structure

```
whot/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Sequelize config
│   │   │   └── redis.js         # Redis client
│   │   ├── controllers/         # Request handlers
│   │   ├── models/              # Database models
│   │   │   ├── User.js
│   │   │   ├── Wallet.js
│   │   │   ├── Match.js
│   │   │   ├── Tournament.js
│   │   │   └── ...
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── game.js
│   │   │   ├── wallet.js
│   │   │   ├── tournament.js
│   │   │   ├── admin.js
│   │   │   └── user.js
│   │   ├── services/            # Business logic
│   │   │   ├── WhotGameEngine.js   # Game rules
│   │   │   ├── WalletService.js    # Wallet logic
│   │   │   └── MatchService.js     # Match logic
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js          # JWT verification
│   │   │   ├── errorHandler.js  # Error handling
│   │   │   └── validation.js    # Input validation
│   │   ├── events/              # Socket.IO handlers
│   │   │   └── socketServer.js
│   │   ├── utils/               # Helper functions
│   │   │   ├── helpers.js
│   │   │   └── logger.js
│   │   └── app.js               # Express app
│   ├── tests/                   # Unit tests
│   ├── scripts/                 # Database scripts
│   │   ├── migrate.js
│   │   └── seed.js
│   └── server.js                # Entry point
│
├── frontend/
│   ├── index.html               # Main HTML
│   ├── css/
│   │   ├── main.css             # Main styles
│   │   ├── game.css             # Game UI styles
│   │   └── responsive.css       # Mobile styles
│   ├── js/
│   │   ├── auth.js              # Authentication
│   │   ├── main.js              # App logic
│   │   ├── socket-client.js     # Socket connection
│   │   ├── game.js              # Game UI logic
│   │   ├── wallet.js            # Wallet operations
│   │   └── ui.js                # UI helpers
│   └── assets/                  # Images, fonts
│
├── database/
│   ├── schema.sql               # Database schema
│   ├── migrations/              # Migration files
│   └── seeds.sql                # Seed data
│
├── docker/
│   ├── Dockerfile               # Docker image
│   └── docker-compose.yml       # Multi-container setup
│
├── docs/
│   ├── API.md                   # API documentation
│   ├── GAME_RULES.md            # Game rules
│   ├── ARCHITECTURE.md          # This file
│   └── DEPLOYMENT.md            # Deployment guide
│
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── README.md                    # Project overview
```

## Data Flow

### Authentication Flow
```
1. User submits login form
2. Frontend sends POST /auth/login
3. Backend verifies credentials
4. Backend generates JWT token
5. Frontend stores token & user data
6. Token sent in Authorization header for future requests
```

### Game Flow
```
1. User creates/joins game room
2. Frontend emits 'join_game' via Socket.IO
3. Backend adds player to game
4. When all players join, game starts
5. Backend initializes WHOT game engine
6. Server deals cards to each player
7. Players receive 'your_turn' event
8. Player selects card, emits 'play_card'
9. Backend validates move in game engine
10. Backend broadcasts 'card_played' to all players
11. Process continues until winner
12. Backend processes winnings & updates wallets
```

### Payment Flow
```
1. User clicks Deposit/Withdraw
2. Frontend sends POST request
3. Backend creates transaction record
4. Transaction marked 'pending'
5. Payment processor handles payment
6. Webhook confirms payment
7. Backend updates wallet & marks transaction 'completed'
8. Frontend notifies user
```

## Security Architecture

### Authentication
- JWT tokens with expiration
- Refresh tokens for session extension
- Password hashing with bcrypt (10 rounds)
- Secure token storage in localStorage

### Authorization
- Role-based access control (RBAC)
- Admin-only endpoints protected
- User can only access own data

### Anti-Cheat
- All card dealing on server
- Move validation on server
- Duplicate move prevention
- Server-side turn management
- Event throttling to prevent spam

### Data Protection
- SQL injection prevention (Sequelize ORM)
- XSS prevention (input sanitization)
- CSRF protection (token validation)
- Rate limiting on APIs
- CORS configuration

### Network Security
- HTTPS in production
- Secure WebSocket (WSS)
- Environment-based configuration
- Secrets in .env file

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Redis for session storage
- Database connection pooling
- Load balancing ready

### Performance Optimization
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching with Redis
- Lazy loading of game data
- Efficient Socket.IO message compression

### Monitoring
- Winston logger for application logs
- Error tracking and reporting
- Performance metrics collection
- Real-time game metrics

## Deployment Architecture

```
┌─────────────────────────┐
│   Load Balancer         │
│   (nginx/HAProxy)       │
└────────────┬────────────┘
             │
      ┌──────┴──────┐
      │             │
   ┌──▼──┐      ┌──▼──┐
   │App 1│      │App 2│  ... (Multiple instances)
   └──┬──┘      └──┬──┘
      │             │
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │   Redis     │  (Cache/Sessions)
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │   MySQL DB  │
      └─────────────┘
```

## Database Schema Relationships

```
Users (1) ─── (1) Wallets
Users (1) ─── (N) Transactions
Users (1) ─── (N) Matches
Matches (1) ─── (N) MatchPlayers
Users (1) ─── (N) MatchPlayers
Users (1) ─── (N) Tournaments (created_by)
Tournaments (1) ─── (N) TournamentPlayers
Users (1) ─── (N) TournamentPlayers
Matches (1) ─── (N) Messages
Users (1) ─── (N) Messages
Users (1) ─── (N) Rewards
```

## API Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Auth**: 5 login attempts per 15 minutes
- **Game**: Throttled per Socket.IO event
- **Wallet**: 10 transactions per minute

## Logging Strategy

- **INFO**: Important application events
- **WARN**: Potential issues that need attention
- **ERROR**: Errors that need immediate action
- **DEBUG**: Detailed debugging information

Logs are written to:
- Console (development)
- `logs/app.log` (general logs)
- `logs/error.log` (errors only)

## Testing Strategy

- **Unit Tests**: Test individual services
- **Integration Tests**: Test API endpoints
- **Socket.IO Tests**: Real-time communication
- **Game Engine Tests**: WHOT game logic

Run tests with: `npm test`