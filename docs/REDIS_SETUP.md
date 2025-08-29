# Redis Setup Guide for Student Assessment System

## Overview
Redis is required for the Student Assessment System to handle background job processing for file uploads, image processing, report generation, and other asynchronous tasks.

## Installation

### macOS
```bash
# Using Homebrew
brew install redis

# Start Redis service
brew services start redis

# Or run manually
redis-server
```

### Ubuntu/Debian
```bash
# Update packages
sudo apt update

# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis
sudo systemctl enable redis
```

### Windows
```bash
# Using WSL2 (recommended)
wsl --install
# Then follow Ubuntu instructions above

# Or use Redis for Windows (unofficial)
# Download from: https://github.com/microsoftarchive/redis/releases
```

### Docker
```bash
# Run Redis container
docker run -d -p 6379:6379 --name redis redis:7-alpine

# With persistence
docker run -d -p 6379:6379 \
  -v redis-data:/data \
  --name redis \
  redis:7-alpine redis-server --appendonly yes
```

## Configuration

### Basic Configuration
The default Redis configuration works for development. For production, consider:

1. **Edit redis.conf** (usually at `/etc/redis/redis.conf` or `/usr/local/etc/redis.conf`):
```conf
# Persistence
save 900 1
save 300 10
save 60 10000

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Security (production only)
requirepass your-strong-password-here
```

2. **Update .env file**:
```env
# Basic connection
REDIS_URL=redis://localhost:6379

# With password (production)
REDIS_URL=redis://:password@localhost:6379

# Custom configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
```

## Verification

### Check Redis is Running
```bash
# Check service status
redis-cli ping
# Should return: PONG

# Check Redis version
redis-server --version

# Monitor Redis activity
redis-cli monitor
```

### Test Connection from App
```bash
# From project root
cd server
npm run test:redis-connection
```

## Queue Management

### View Queue Status
```bash
# Connect to Redis
redis-cli

# List all keys
KEYS *

# View specific queue
LRANGE bull:fileProcessing:wait 0 -1

# Count jobs in queue
LLEN bull:fileProcessing:wait

# Clear all queues (CAUTION!)
FLUSHDB
```

### Queue Names Used
- `fileProcessing` - Main file upload processing
- `imageProcessor` - Image thumbnail generation
- `videoProcessor` - Video processing
- `audioProcessor` - Audio waveform generation
- `documentProcessor` - Document preview generation
- `reportProcessor` - Report generation
- `bulkProcessor` - Bulk operations

## Monitoring

### Redis Commander (Web UI)
```bash
# Install globally
npm install -g redis-commander

# Run
redis-commander
# Open http://localhost:8081
```

### Bull Board (Queue Dashboard)
The app includes Bull Board at `http://localhost:3000/admin/queues` when running in development mode.

## Troubleshooting

### Connection Refused
```bash
# Check Redis is running
ps aux | grep redis

# Start Redis if not running
redis-server

# Check port is available
lsof -i :6379
```

### Memory Issues
```bash
# Check memory usage
redis-cli INFO memory

# Clear expired keys
redis-cli --scan --pattern '*' | xargs redis-cli DEL

# Flush database (CAUTION!)
redis-cli FLUSHDB
```

### Permission Denied
```bash
# Fix permissions (Linux)
sudo chown redis:redis /var/lib/redis
sudo chmod 755 /var/lib/redis
```

## Production Considerations

### Security
1. Always set a strong password
2. Bind to localhost only (unless cluster setup)
3. Disable dangerous commands:
```conf
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

### Performance
1. Use Redis persistence appropriately:
   - RDB for backups
   - AOF for durability
2. Monitor memory usage
3. Set appropriate maxmemory policy
4. Consider Redis Cluster for scaling

### Backup
```bash
# Manual backup
redis-cli BGSAVE

# Backup location
cp /var/lib/redis/dump.rdb backup/redis-$(date +%Y%m%d).rdb

# Restore
sudo systemctl stop redis
cp backup/redis-20240827.rdb /var/lib/redis/dump.rdb
sudo systemctl start redis
```

## Docker Compose Setup

For easy development, use this `docker-compose.yml`:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: teaching-engine-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

Run with:
```bash
docker-compose up -d redis
```

## Additional Resources
- [Redis Documentation](https://redis.io/documentation)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Redis Security](https://redis.io/docs/manual/security/)