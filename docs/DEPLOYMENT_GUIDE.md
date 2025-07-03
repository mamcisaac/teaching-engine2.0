# Teaching Engine 2.0 - Technical Deployment Guide

_Last Updated: July 3, 2025 | Version 2.0_

---

## Executive Summary

This guide provides comprehensive technical deployment instructions for Teaching Engine 2.0, designed for IT administrators and DevOps engineers. Teaching Engine 2.0 is a production-ready digital teaching assistant that serves elementary school teachers with curriculum planning, resource management, and parent communication tools.

**Target Audience**: IT administrators, DevOps engineers, system administrators  
**Deployment Complexity**: Intermediate to Advanced  
**Expected Deployment Time**: 2-4 hours for basic setup, 1-2 days for full enterprise deployment

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Architecture Overview](#architecture-overview)
3. [Pre-Deployment Preparation](#pre-deployment-preparation)
4. [Docker Deployment](#docker-deployment)
5. [Database Setup and Migration](#database-setup-and-migration)
6. [Environment Configuration](#environment-configuration)
7. [Security Configuration](#security-configuration)
8. [Backup and Recovery](#backup-and-recovery)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance and Updates](#maintenance-and-updates)
13. [Appendices](#appendices)

---

## System Requirements

### Minimum Hardware Requirements

#### Production Environment

- **CPU**: 4 cores (Intel/AMD 64-bit)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB available space (SSD preferred)
- **Network**: 100Mbps bandwidth, low latency connection

#### Development Environment

- **CPU**: 2 cores (Intel/AMD 64-bit)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB available space
- **Network**: 10Mbps bandwidth

### Software Requirements

#### Operating System Support

- **Linux**: Ubuntu 20.04+ (LTS recommended), CentOS 8+, RHEL 8+
- **Windows**: Windows Server 2019+, Windows 10/11 Pro
- **macOS**: macOS 12.0+ (development only)

#### Container Runtime

- **Docker**: Version 24.0+ (recommended)
- **Docker Compose**: Version 2.20+
- **Kubernetes**: Version 1.28+ (for enterprise deployments)

#### Database

- **PostgreSQL**: Version 15+ (production)
- **SQLite**: Version 3.40+ (development/testing)

#### Node.js Runtime

- **Node.js**: Version 18.17+ or 20.9+
- **pnpm**: Version 8.15+ (package manager)

### Network Requirements

#### Port Configuration

- **3000**: Application server (HTTP/HTTPS)
- **5432**: PostgreSQL database
- **5173**: Development frontend server
- **9229**: Node.js debugging (development only)

#### Firewall Rules

```bash
# Allow HTTP/HTTPS traffic
ufw allow 80/tcp
ufw allow 443/tcp

# Allow application access
ufw allow 3000/tcp

# Allow database access (internal network only)
ufw allow from 10.0.0.0/8 to any port 5432
```

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (nginx)                    │
│                    SSL/TLS Termination                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                 Application Tier                           │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Frontend      │    │   Backend API   │                │
│  │   (React)       │    │   (Express.js)  │                │
│  │   Port: 5173    │    │   Port: 3000    │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                   Data Tier                                │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   PostgreSQL    │    │   File Storage  │                │
│  │   Port: 5432    │    │   (Local/S3)    │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Component Overview

#### Frontend (React Application)

- **Technology**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack Query
- **Deployment**: Static files served by nginx

#### Backend API (Express.js)

- **Technology**: Node.js 18+ with Express.js
- **Language**: TypeScript
- **ORM**: Prisma 5
- **Authentication**: JWT tokens
- **API Documentation**: OpenAPI/Swagger

#### Database

- **Primary**: PostgreSQL 15+
- **Development**: SQLite 3.40+
- **Migrations**: Prisma migrations
- **Backup**: pg_dump automated backups

---

## Pre-Deployment Preparation

### Infrastructure Checklist

#### Server Preparation

- [ ] Server provisioned with required specifications
- [ ] Operating system updated and patched
- [ ] Required users and groups created
- [ ] SSH keys configured for secure access
- [ ] Firewall rules configured
- [ ] DNS records configured
- [ ] SSL certificates obtained

#### Security Hardening

- [ ] SSH configured with key-based authentication
- [ ] Root login disabled
- [ ] Fail2ban installed and configured
- [ ] System logs configured
- [ ] Monitoring tools installed
- [ ] Backup system configured

#### Network Configuration

- [ ] Static IP address assigned
- [ ] Load balancer configured (if applicable)
- [ ] CDN configured (if applicable)
- [ ] Database network access restricted
- [ ] Monitoring endpoints accessible

### Pre-Deployment Security Assessment

#### Security Checklist

```bash
# System security audit
sudo apt update && sudo apt upgrade -y
sudo ufw enable
sudo fail2ban-client status

# Docker security
docker --version
docker-compose --version
docker system info | grep -i security

# Database security
psql --version
sudo -u postgres psql -c "SELECT version();"
```

---

## Docker Deployment

### Quick Start Deployment

#### 1. Clone Repository

```bash
git clone https://github.com/mamcisaac/teaching-engine2.0.git
cd teaching-engine2.0
```

#### 2. Environment Configuration

```bash
# Copy environment template
cp server/.env.example server/.env

# Edit configuration
nano server/.env
```

#### 3. Docker Compose Deployment

```bash
# Build and start services
docker-compose up -d --build

# Verify deployment
docker-compose ps
docker-compose logs -f
```

### Production Docker Configuration

#### Enhanced Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - '127.0.0.1:5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER} -d ${DB_NAME}']
      interval: 30s
      timeout: 10s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    ports:
      - '3000:3000'
    depends_on:
      db:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - app

volumes:
  postgres_data:
  uploads:
  logs:
```

#### Production Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm db:generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:18-alpine AS runner

RUN apk add --no-cache dumb-init
WORKDIR /app

ENV NODE_ENV=production
RUN corepack enable

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S teaching-engine -u 1001
USER teaching-engine

EXPOSE 3000

CMD ["dumb-init", "node", "server/dist/index.js"]
```

### Kubernetes Deployment

#### Namespace and ConfigMap

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: teaching-engine
  labels:
    name: teaching-engine

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: teaching-engine-config
  namespace: teaching-engine
data:
  NODE_ENV: 'production'
  DATABASE_URL: 'postgresql://teaching_engine:password@postgres:5432/teaching_engine'
```

#### Deployment and Service

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: teaching-engine
  namespace: teaching-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: teaching-engine
  template:
    metadata:
      labels:
        app: teaching-engine
    spec:
      containers:
        - name: teaching-engine
          image: teaching-engine:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: teaching-engine-config
                  key: NODE_ENV
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: teaching-engine-secrets
                  key: DATABASE_URL
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: teaching-engine-service
  namespace: teaching-engine
spec:
  selector:
    app: teaching-engine
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## Database Setup and Migration

### PostgreSQL Installation

#### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL
sudo -u postgres psql
```

#### CentOS/RHEL

```bash
# Install PostgreSQL
sudo dnf install postgresql postgresql-server

# Initialize database
sudo postgresql-setup --initdb

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Database Configuration

#### Create Database and User

```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database
CREATE DATABASE teaching_engine;

-- Create user
CREATE USER teaching_engine WITH PASSWORD 'secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE teaching_engine TO teaching_engine;
GRANT ALL ON SCHEMA public TO teaching_engine;

-- Enable extensions
\c teaching_engine
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### PostgreSQL Configuration

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Key settings for production
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Database Security

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Secure connection rules
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### Database Migration

#### Prisma Migration Process

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Verify schema
pnpm db:studio
```

#### Manual Migration Commands

```bash
# Create migration
pnpm --filter @teaching-engine/database prisma migrate dev --name init

# Deploy to production
pnpm --filter @teaching-engine/database prisma migrate deploy

# Reset database (development only)
pnpm --filter @teaching-engine/database prisma migrate reset
```

---

## Environment Configuration

### Environment Variables

#### Server Configuration (.env)

```bash
# Database
DATABASE_URL="postgresql://teaching_engine:password@localhost:5432/teaching_engine"

# Security
JWT_SECRET="your-secure-jwt-secret-key-here"
ENCRYPTION_KEY="your-32-character-encryption-key"

# OpenAI Integration
OPENAI_API_KEY="your-openai-api-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"

# File Storage
UPLOAD_PATH="/app/uploads"
MAX_FILE_SIZE=10485760  # 10MB

# Application
NODE_ENV="production"
PORT=3000
HOST="0.0.0.0"

# Logging
LOG_LEVEL="info"
LOG_FORMAT="json"

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # requests per window

# CORS
CORS_ORIGIN="https://your-domain.com"
CORS_CREDENTIALS=true

# SSL/TLS
SSL_CERT_PATH="/etc/ssl/certs/teaching-engine.crt"
SSL_KEY_PATH="/etc/ssl/private/teaching-engine.key"
```

#### Client Configuration (.env)

```bash
# API Configuration
VITE_API_URL="https://api.your-domain.com"
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_OFFLINE_MODE=true

# Analytics
VITE_ANALYTICS_ID="your-analytics-id"

# Error Reporting
VITE_SENTRY_DSN="your-sentry-dsn"
```

### Configuration Validation

#### Environment Validation Script

```bash
#!/bin/bash
# validate-env.sh

echo "Validating environment configuration..."

# Check required variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "OPENAI_API_KEY"
    "NODE_ENV"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: $var is not set"
        exit 1
    fi
done

# Test database connection
echo "Testing database connection..."
psql $DATABASE_URL -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    exit 1
fi

# Test OpenAI API
echo "Testing OpenAI API..."
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     "https://api.openai.com/v1/models" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ OpenAI API connection successful"
else
    echo "✗ OpenAI API connection failed"
    exit 1
fi

echo "All environment checks passed!"
```

---

## Security Configuration

### SSL/TLS Configuration

#### Nginx SSL Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/teaching-engine.crt;
    ssl_certificate_key /etc/ssl/private/teaching-engine.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Application Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static Files
    location /static/ {
        alias /app/client/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Let's Encrypt SSL Certificate

```bash
# Install Certbot
sudo apt install snapd
sudo snap install --classic certbot

# Create certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Authentication and Authorization

#### JWT Configuration

```javascript
// JWT security best practices
const jwtConfig = {
  secret: process.env.JWT_SECRET, // 256-bit key
  expiresIn: '24h',
  issuer: 'teaching-engine',
  audience: 'teaching-engine-users',
  algorithm: 'HS256',
};

// Token validation middleware
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  jwt.verify(token, jwtConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};
```

#### Role-Based Access Control

```javascript
// RBAC implementation
const roles = {
  ADMIN: ['read', 'write', 'delete', 'manage'],
  TEACHER: ['read', 'write'],
  SUBSTITUTE: ['read'],
  VIEWER: ['read'],
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = roles[userRole];

    if (!permissions || !permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
```

### Input Validation and Sanitization

#### Request Validation

```javascript
// Input validation with express-validator
const { body, validationResult } = require('express-validator');

const validateLessonPlan = [
  body('title').isLength({ min: 1, max: 255 }).escape(),
  body('description').isLength({ max: 5000 }).escape(),
  body('grade').isInt({ min: 1, max: 12 }),
  body('subject').isAlpha().isLength({ min: 1, max: 50 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

#### XSS Protection

```javascript
// XSS protection middleware
const xss = require('xss');

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  next();
};
```

---

## Backup and Recovery

### Database Backup Strategy

#### Automated Backup Script

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
DB_NAME="teaching_engine"
DB_USER="teaching_engine"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U $DB_USER -h localhost -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: backup_$DATE.sql.gz"
```

#### Backup Cron Job

```bash
# Install cron job
crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1

# Weekly full backup
0 1 * * 0 /usr/local/bin/backup-full.sh >> /var/log/backup.log 2>&1
```

### File System Backup

#### Application Files Backup

```bash
#!/bin/bash
# backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/files"
APP_DIR="/app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='*.log' \
  $APP_DIR

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz \
  $APP_DIR/uploads

# Remove old backups
find $BACKUP_DIR -name "*_backup_*.tar.gz" -mtime +7 -delete

echo "File backup completed: app_backup_$DATE.tar.gz"
```

### Disaster Recovery

#### Recovery Procedures

```bash
# 1. Database Recovery
psql -U teaching_engine -d teaching_engine < backup_20250703_020000.sql

# 2. Application Recovery
cd /app
tar -xzf /backups/files/app_backup_20250703_020000.tar.gz

# 3. Uploads Recovery
tar -xzf /backups/files/uploads_backup_20250703_020000.tar.gz

# 4. Restart services
docker-compose down
docker-compose up -d
```

#### Recovery Testing

```bash
#!/bin/bash
# test-recovery.sh

echo "Starting recovery test..."

# Create test database
createdb teaching_engine_test

# Restore from backup
psql -U teaching_engine -d teaching_engine_test < latest_backup.sql

# Verify data integrity
psql -U teaching_engine -d teaching_engine_test -c "SELECT COUNT(*) FROM users;"

# Cleanup
dropdb teaching_engine_test

echo "Recovery test completed successfully"
```

---

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint

```javascript
// Health check implementation
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await prisma.$queryRaw`SELECT 1`;

    // Check OpenAI API
    const openaiStatus = await checkOpenAI();

    // Check file system
    const fsStatus = await checkFileSystem();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
      openai: openaiStatus ? 'connected' : 'disconnected',
      filesystem: fsStatus ? 'accessible' : 'inaccessible',
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

#### Prometheus Metrics

```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const databaseQueries = new prometheus.Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['type', 'table'],
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Logging Configuration

#### Structured Logging

```javascript
// Winston logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
  });

  next();
};
```

#### Log Rotation

```bash
# logrotate configuration
# /etc/logrotate.d/teaching-engine

/app/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 teaching-engine teaching-engine
    postrotate
        systemctl restart teaching-engine
    endscript
}
```

### Monitoring Dashboard

#### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Teaching Engine 2.0 Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "singlestat",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ]
      }
    ]
  }
}
```

---

## Performance Optimization

### Database Optimization

#### PostgreSQL Performance Tuning

```sql
-- Database performance settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Reload configuration
SELECT pg_reload_conf();
```

#### Index Optimization

```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_lesson_plans_teacher_id ON lesson_plans(teacher_id);
CREATE INDEX CONCURRENTLY idx_lesson_plans_created_at ON lesson_plans(created_at);
CREATE INDEX CONCURRENTLY idx_students_class_id ON students(class_id);

-- Analyze table statistics
ANALYZE users;
ANALYZE lesson_plans;
ANALYZE students;
```

### Application Performance

#### Caching Strategy

```javascript
// Redis caching implementation
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = {
  get: async (key) => {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  set: async (key, value, ttl = 3600) => {
    try {
      await client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  },

  del: async (key) => {
    try {
      await client.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  },
};
```

#### Connection Pooling

```javascript
// Database connection pooling
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection monitoring
pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Database connection error:', err);
});
```

### Frontend Optimization

#### Build Optimization

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'lodash'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

---

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### Application Startup Issues

```bash
# Check application logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep -E "(DATABASE|JWT|OPENAI)"

# Check port availability
netstat -tlnp | grep :3000
```

#### Memory Issues

```bash
# Check memory usage
free -h
docker stats

# Check for memory leaks
node --inspect server/dist/index.js
```

### Performance Issues

#### Slow Database Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### High CPU Usage

```bash
# Check process CPU usage
top -p $(pgrep node)

# Profile Node.js application
node --prof server/dist/index.js
```

### Network Issues

#### SSL Certificate Problems

```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443

# Check certificate expiry
openssl x509 -in /etc/ssl/certs/teaching-engine.crt -text -noout | grep "Not After"
```

#### Load Balancer Issues

```bash
# Check nginx configuration
nginx -t

# Check nginx logs
tail -f /var/log/nginx/error.log

# Test upstream connectivity
curl -I http://localhost:3000/api/health
```

---

## Maintenance and Updates

### Regular Maintenance Tasks

#### Daily Tasks

```bash
#!/bin/bash
# daily-maintenance.sh

# Check service status
systemctl status teaching-engine

# Check disk space
df -h

# Check logs for errors
grep -i error /app/logs/*.log

# Backup database
/usr/local/bin/backup-database.sh

# Check SSL certificate expiry
openssl x509 -in /etc/ssl/certs/teaching-engine.crt -checkend 604800
```

#### Weekly Tasks

```bash
#!/bin/bash
# weekly-maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up old logs
find /app/logs -name "*.log" -mtime +7 -delete

# Optimize database
sudo -u postgres psql teaching_engine -c "VACUUM ANALYZE;"

# Check backup integrity
/usr/local/bin/test-recovery.sh
```

### Application Updates

#### Zero-Downtime Deployment

```bash
#!/bin/bash
# deploy-update.sh

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

# Pull new image
docker pull teaching-engine:$VERSION

# Create new container
docker run -d --name teaching-engine-new \
  -p 3001:3000 \
  --env-file .env \
  teaching-engine:$VERSION

# Health check
sleep 30
curl -f http://localhost:3001/api/health

if [ $? -eq 0 ]; then
    # Update load balancer
    nginx -s reload

    # Stop old container
    docker stop teaching-engine-old
    docker rm teaching-engine-old

    # Rename containers
    docker rename teaching-engine teaching-engine-old
    docker rename teaching-engine-new teaching-engine

    echo "Deployment successful"
else
    echo "Health check failed, rolling back"
    docker stop teaching-engine-new
    docker rm teaching-engine-new
    exit 1
fi
```

### Security Updates

#### Security Patch Process

```bash
#!/bin/bash
# security-update.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
pnpm audit fix

# Update Docker base images
docker pull node:18-alpine
docker pull postgres:15-alpine

# Rebuild application
docker-compose build --no-cache

# Run security scan
docker run --rm -v $(pwd):/app -w /app aquasec/trivy fs .
```

---

## Appendices

### Appendix A: Port Reference

| Port | Service              | Protocol | Access      |
| ---- | -------------------- | -------- | ----------- |
| 80   | HTTP                 | TCP      | External    |
| 443  | HTTPS                | TCP      | External    |
| 3000 | Application          | TCP      | Internal    |
| 5432 | PostgreSQL           | TCP      | Internal    |
| 5173 | Development Frontend | TCP      | Development |
| 9229 | Node.js Debug        | TCP      | Development |
| 6379 | Redis                | TCP      | Internal    |

### Appendix B: Environment Variables Reference

#### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret (256-bit)
- `OPENAI_API_KEY`: OpenAI API key
- `NODE_ENV`: Environment (development/production)

#### Optional Variables

- `PORT`: Application port (default: 3000)
- `LOG_LEVEL`: Logging level (default: info)
- `CORS_ORIGIN`: CORS allowed origins
- `RATE_LIMIT_MAX`: Rate limit maximum requests
- `SMTP_HOST`: Email server host
- `REDIS_URL`: Redis connection string

### Appendix C: Database Schema

#### Core Tables

- `users`: User accounts and authentication
- `lesson_plans`: Lesson planning data
- `unit_plans`: Unit planning data
- `students`: Student information
- `curriculum_expectations`: Curriculum standards
- `resources`: File uploads and materials

### Appendix D: API Endpoints

#### Authentication

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration
- `POST /api/auth/refresh`: Token refresh
- `POST /api/auth/logout`: User logout

#### Core Features

- `GET /api/lesson-plans`: List lesson plans
- `POST /api/lesson-plans`: Create lesson plan
- `GET /api/unit-plans`: List unit plans
- `POST /api/unit-plans`: Create unit plan
- `GET /api/students`: List students
- `POST /api/students`: Create student

### Appendix E: Support Contacts

#### Technical Support

- **Email**: support@teaching-engine.com
- **Documentation**: https://docs.teaching-engine.com
- **Community**: https://community.teaching-engine.com

#### Emergency Contacts

- **Critical Issues**: emergency@teaching-engine.com
- **Security Issues**: security@teaching-engine.com
- **On-Call**: +1-800-TEACH-ENGINE

---

**Document Version**: 2.0  
**Last Updated**: July 3, 2025  
**Next Review**: October 3, 2025

This deployment guide provides comprehensive technical instructions for successfully deploying Teaching Engine 2.0 in production environments. For additional support or questions, contact the technical team.
