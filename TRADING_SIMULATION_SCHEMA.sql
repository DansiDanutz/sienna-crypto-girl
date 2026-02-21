-- Trading Simulation Tables for Self-Learning

-- 1. Historical Price Data
CREATE TABLE IF NOT EXISTS historical_prices (
    id BIGSERIAL PRIMARY KEY,
    coin TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    open_price DECIMAL(20, 8) NOT NULL,
    high_price DECIMAL(20, 8) NOT NULL,
    low_price DECIMAL(20, 8) NOT NULL,
    close_price DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(30, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(coin, timestamp)
);

-- 2. Simulated Trades
CREATE TABLE IF NOT EXISTS simulated_trades (
    id BIGSERIAL PRIMARY KEY,
    coin TEXT NOT NULL,
    strategy TEXT NOT NULL,
    entry_price DECIMAL(20, 8) NOT NULL,
    exit_price DECIMAL(20, 8),
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    direction TEXT NOT NULL,
    leverage INT NOT NULL,
    margin DECIMAL(20, 8) NOT NULL,
    profit_pct DECIMAL(10, 4),
    profit_usd DECIMAL(20, 8),
    dca_count INT DEFAULT 0,
    exit_reason TEXT,
    confidence_score DECIMAL(5, 2),
    neural_score DECIMAL(5, 2),
    market_regime TEXT,
    rsi_value DECIMAL(5, 2),
    liquidation_ratio DECIMAL(10, 2),
    result TEXT NOT NULL, -- WIN or LOSS
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Strategy Performance
CREATE TABLE IF NOT EXISTS strategy_performance (
    id BIGSERIAL PRIMARY KEY,
    strategy TEXT NOT NULL,
    coin TEXT NOT NULL,
    total_simulations INT NOT NULL,
    wins INT NOT NULL,
    losses INT NOT NULL,
    win_rate DECIMAL(5, 2) NOT NULL,
    profit_factor DECIMAL(10, 4) NOT NULL,
    max_drawdown DECIMAL(10, 4) NOT NULL,
    avg_win DECIMAL(20, 8),
    avg_loss DECIMAL(20, 8),
    sharpe_ratio DECIMAL(10, 4),
    overfit_score DECIMAL(5, 2),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(strategy, coin)
);

-- 4. Pattern Analysis
CREATE TABLE IF NOT EXISTS pattern_analysis (
    id BIGSERIAL PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    condition TEXT NOT NULL,
    win_count INT NOT NULL,
    total_count INT NOT NULL,
    win_rate DECIMAL(5, 2) NOT NULL,
    avg_profit DECIMAL(20, 8),
    sample_trades TEXT[] NOT NULL,
    discovered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(pattern_type, condition)
);

-- 5. Learning Log
CREATE TABLE IF NOT EXISTS learning_log (
    id BIGSERIAL PRIMARY KEY,
    learning_date DATE NOT NULL,
    trades_simulated INT NOT NULL,
    best_strategy TEXT NOT NULL,
    best_win_rate DECIMAL(5, 2) NOT NULL,
    key_discovery TEXT NOT NULL,
    parameter_adjustment TEXT,
    new_rule_created TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(learning_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_historical_coin_time ON historical_prices(coin, timestamp);
CREATE INDEX IF NOT EXISTS idx_simulated_strategy ON simulated_trades(strategy, coin, result);
CREATE INDEX IF NOT EXISTS idx_strategy_perf ON strategy_performance(strategy, coin, win_rate);
CREATE INDEX IF NOT EXISTS idx_pattern_type ON pattern_analysis(pattern_type, win_rate);
