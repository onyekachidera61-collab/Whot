-- WHOT Game Database Schema

-- Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar TEXT,
  bio TEXT,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  total_games INT DEFAULT 0,
  is_online BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Wallets Table
CREATE TABLE wallets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0,
  total_deposited DECIMAL(15, 2) DEFAULT 0,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0,
  total_winnings DECIMAL(15, 2) DEFAULT 0,
  total_losses DECIMAL(15, 2) DEFAULT 0,
  last_transaction_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions Table
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('deposit', 'withdrawal', 'game_fee', 'game_winnings', 'tournament_fee', 'tournament_winnings', 'refund', 'platform_fee') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  bank_account JSON,
  reference VARCHAR(255) UNIQUE,
  related_game_id VARCHAR(36),
  related_tournament_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Game Rooms Table
CREATE TABLE game_rooms (
  id VARCHAR(36) PRIMARY KEY,
  room_code VARCHAR(10) NOT NULL UNIQUE,
  created_by VARCHAR(36),
  game_mode ENUM('free', 'money') DEFAULT 'free',
  player_count INT DEFAULT 2,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  status ENUM('waiting', 'ongoing', 'completed', 'cancelled') DEFAULT 'waiting',
  current_players INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_game_mode (game_mode),
  INDEX idx_room_code (room_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Matches Table
CREATE TABLE matches (
  id VARCHAR(36) PRIMARY KEY,
  game_mode ENUM('free', 'money') DEFAULT 'free',
  player_count INT DEFAULT 2,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  total_prize_pool DECIMAL(15, 2) DEFAULT 0,
  platform_fee DECIMAL(15, 2) DEFAULT 0,
  winner_id VARCHAR(36),
  status ENUM('ongoing', 'completed', 'cancelled') DEFAULT 'ongoing',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_game_mode (game_mode),
  INDEX idx_winner_id (winner_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Match Players Table
CREATE TABLE match_players (
  id VARCHAR(36) PRIMARY KEY,
  match_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  room_id VARCHAR(36),
  position INT,
  winnings DECIMAL(15, 2) DEFAULT 0,
  status ENUM('waiting', 'playing', 'finished', 'quit') DEFAULT 'waiting',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_match_id (match_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Game Sessions Table
CREATE TABLE game_sessions (
  id VARCHAR(36) PRIMARY KEY,
  room_id VARCHAR(36) NOT NULL,
  deck JSON,
  discard_pile JSON,
  current_player_index INT DEFAULT 0,
  direction ENUM('clockwise', 'counterclockwise') DEFAULT 'clockwise',
  chosen_shape VARCHAR(50),
  game_state JSON,
  status ENUM('waiting', 'started', 'paused', 'ended') DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_room_id (room_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tournaments Table
CREATE TABLE tournaments (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  max_players INT DEFAULT 100,
  current_players INT DEFAULT 0,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
  prizes JSON,
  total_prize_pool DECIMAL(15, 2) DEFAULT 0,
  platform_fee DECIMAL(15, 2) DEFAULT 0,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tournament Players Table
CREATE TABLE tournament_players (
  id VARCHAR(36) PRIMARY KEY,
  tournament_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  position INT,
  winnings DECIMAL(15, 2) DEFAULT 0,
  status ENUM('joined', 'active', 'eliminated', 'winner') DEFAULT 'joined',
  matches_played INT DEFAULT 0,
  matches_won INT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_tournament_id (tournament_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rewards Table
CREATE TABLE rewards (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('match_win', 'tournament_win', 'tournament_place', 'bonus', 'referral') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  status ENUM('pending', 'credited', 'withdrawn') DEFAULT 'pending',
  related_game_id VARCHAR(36),
  related_tournament_id VARCHAR(36),
  credited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messages Table
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  match_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'emoji', 'system') DEFAULT 'text',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_match_id (match_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Friendships Table
CREATE TABLE friendships (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  friend_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_friend_id (friend_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_friendship (user_id, friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Indexes for Performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_matches_user_date ON match_players(user_id, created_at);
CREATE INDEX idx_tournament_players_user ON tournament_players(user_id, tournament_id);

-- Create Views for Analytics
CREATE VIEW user_stats AS
SELECT
  u.id,
  u.username,
  u.wins,
  u.losses,
  u.total_games,
  w.balance,
  w.total_deposited,
  w.total_withdrawn,
  COUNT(DISTINCT m.id) as matches_played,
  SUM(CASE WHEN m.winner_id = u.id THEN 1 ELSE 0 END) as matches_won
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN match_players mp ON u.id = mp.user_id
LEFT JOIN matches m ON mp.match_id = m.id
GROUP BY u.id, u.username, u.wins, u.losses, u.total_games, w.balance, w.total_deposited, w.total_withdrawn;