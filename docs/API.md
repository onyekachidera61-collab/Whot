# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123",
  "phone": "+2348012345678"
}

Response:
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "username": "player1",
    "email": "player1@example.com",
    "avatar": "url"
  },
  "accessToken": "jwt_token"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": {...},
  "accessToken": "jwt_token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer {token}

Response:
{
  "message": "Logged out successfully"
}
```

### Games

#### Create Room
```http
POST /games/room
Authorization: Bearer {token}
Content-Type: application/json

{
  "gameMode": "free",
  "playerCount": 2,
  "entryFee": 1000,
  "isPrivate": false
}

Response:
{
  "message": "Room created",
  "room": {
    "id": "uuid",
    "roomCode": "ABC123",
    "gameMode": "free",
    "playerCount": 2,
    "status": "waiting"
  }
}
```

#### Get Room Details
```http
GET /games/room/{roomId}
Authorization: Bearer {token}

Response:
{
  "room": {
    "id": "uuid",
    "roomCode": "ABC123",
    "status": "waiting",
    "players": [...],
    "playerCount": 2
  }
}
```

#### List Available Rooms
```http
GET /games/available
Authorization: Bearer {token}

Response:
{
  "rooms": [...]
}
```

#### Join Room
```http
POST /games/room/{roomId}/join
Authorization: Bearer {token}

Response:
{
  "message": "Room joined",
  "roomId": "uuid"
}
```

#### Get Match History
```http
GET /games/history
Authorization: Bearer {token}

Response:
{
  "matches": [...]
}
```

### Wallet

#### Get Balance
```http
GET /wallet/balance
Authorization: Bearer {token}

Response:
{
  "balance": 50000,
  "currency": "NGN"
}
```

#### Deposit
```http
POST /wallet/deposit
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 10000,
  "paymentMethod": "card"
}

Response:
{
  "message": "Deposit initiated",
  "transactionId": "uuid",
  "amount": 10000,
  "status": "pending"
}
```

#### Withdraw
```http
POST /wallet/withdraw
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5000,
  "bankAccount": {
    "bank": "First Bank",
    "accountNumber": "1234567890",
    "accountName": "Player Name"
  }
}

Response:
{
  "message": "Withdrawal request submitted",
  "transactionId": "uuid",
  "amount": 5000,
  "status": "pending"
}
```

#### Get Transactions
```http
GET /wallet/transactions
Authorization: Bearer {token}

Response:
{
  "transactions": [
    {
      "id": "uuid",
      "type": "deposit",
      "amount": 10000,
      "status": "completed",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Users

#### Get Profile
```http
GET /users/profile
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": "uuid",
    "username": "player1",
    "email": "player1@example.com",
    "avatar": "url",
    "bio": "Bio text",
    "wins": 10,
    "losses": 5,
    "totalGames": 15
  }
}
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newusername",
  "bio": "New bio",
  "phone": "+2348012345678"
}

Response:
{
  "user": {...}
}
```

#### Get Leaderboard
```http
GET /users/leaderboard
Authorization: Bearer {token}

Response:
{
  "users": [
    {
      "id": "uuid",
      "username": "player1",
      "wins": 50,
      "totalGames": 100,
      "avatar": "url"
    }
  ]
}
```

### Tournaments

#### List Tournaments
```http
GET /tournaments
Authorization: Bearer {token}

Response:
{
  "tournaments": [...]
}
```

#### Get Tournament Details
```http
GET /tournaments/{tournamentId}
Authorization: Bearer {token}

Response:
{
  "tournament": {
    "id": "uuid",
    "name": "Championship",
    "entryFee": 5000,
    "maxPlayers": 100,
    "currentPlayers": 50,
    "status": "active",
    "players": [...]
  }
}
```

#### Join Tournament
```http
POST /tournaments/{tournamentId}/join
Authorization: Bearer {token}

Response:
{
  "message": "Joined tournament"
}
```

#### Get Tournament Results
```http
GET /tournaments/{tournamentId}/results
Authorization: Bearer {token}

Response:
{
  "results": [...]
}
```

### Admin

#### Dashboard Statistics
```http
GET /admin/dashboard
Authorization: Bearer {admin_token}

Response:
{
  "dashboard": {
    "totalUsers": 1000,
    "totalMatches": 5000,
    "totalTournaments": 50,
    "totalRevenue": 1000000
  }
}
```

#### List Users
```http
GET /admin/users
Authorization: Bearer {admin_token}

Response:
{
  "users": [...]
}
```

#### Create Tournament
```http
POST /admin/tournament
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Championship",
  "description": "Description",
  "entryFee": 5000,
  "maxPlayers": 100,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T18:00:00Z",
  "rewards": {}
}

Response:
{
  "message": "Tournament created",
  "tournament": {...}
}
```

## Socket.IO Events

### Client to Server

#### Join Game
```javascript
socket.emit('join_game', {
  roomId: 'uuid',
  playerData: {
    username: 'player1',
    avatar: 'url'
  }
});
```

#### Play Card
```javascript
socket.emit('play_card', {
  roomId: 'uuid',
  cardIndex: 0,
  chosenShape: 'circle' // optional for WHOT card
});
```

#### Pick Card
```javascript
socket.emit('pick_card', {
  roomId: 'uuid'
});
```

#### Send Message
```javascript
socket.emit('message', {
  roomId: 'uuid',
  message: 'Hello!',
  type: 'text'
});
```

#### Leave Game
```javascript
socket.emit('leave_game');
```

### Server to Client

#### Player Joined
```javascript
socket.on('player_joined', (data) => {
  // data: { playerId, username, totalPlayers, maxPlayers }
});
```

#### Game Started
```javascript
socket.on('game_started', (gameState) => {
  // gameState: { status, currentPlayerIndex, players, ... }
});
```

#### Card Played
```javascript
socket.on('card_played', (data) => {
  // data: { playerId, card, gameState, special }
});
```

#### Your Turn
```javascript
socket.on('your_turn', (data) => {
  // data: { gameState, hand }
});
```

#### Game Ended
```javascript
socket.on('game_ended', (data) => {
  // data: { winner, gameState }
});
```

#### Player Message
```javascript
socket.on('player_message', (data) => {
  // data: { playerId, username, message, type, timestamp }
});
```

#### Error
```javascript
socket.on('error', (error) => {
  // error: { message }
});
```