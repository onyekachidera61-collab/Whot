-- Seed data for testing

-- Insert test users
INSERT INTO users (id, username, email, password, avatar, bio, is_verified, role)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'player1', 'player1@test.com', '$2b$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1', 'WHOT Champion', TRUE, 'user'),
  ('550e8400-e29b-41d4-a716-446655440002', 'player2', 'player2@test.com', '$2b$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2', 'Card Game Lover', TRUE, 'user'),
  ('550e8400-e29b-41d4-a716-446655440003', 'player3', 'player3@test.com', '$2b$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player3', 'Gaming Pro', TRUE, 'user'),
  ('550e8400-e29b-41d4-a716-446655440004', 'admin', 'admin@9jawin.com', '$2b$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'Platform Admin', TRUE, 'admin');

-- Insert test wallets
INSERT INTO wallets (id, user_id, balance, total_deposited, total_winnings)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 50000.00, 100000.00, 50000.00),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 25000.00, 50000.00, 25000.00),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 75000.00, 150000.00, 75000.00),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 1000000.00, 1000000.00, 0.00);