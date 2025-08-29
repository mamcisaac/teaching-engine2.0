# Storage Configuration Guide

## Overview
The Student Assessment System supports two storage modes for student artifacts:
- **Local Storage** - Files stored on the server's filesystem (default)
- **S3 Storage** - Files stored in Amazon S3 or compatible service

## Local Storage Setup

### Configuration
Set these environment variables in your `.env` file:

```env
# Use local storage
STORAGE_DRIVER=local

# Storage path (relative to server root)
UPLOAD_PATH=./uploads

# File size limits
UPLOAD_MAX_MB=25

# Allowed file types (comma-separated MIME types)
UPLOAD_ALLOWED_MIME=image/jpeg,image/png,video/mp4,video/quicktime,audio/mpeg,audio/wav,application/pdf
```

### Directory Structure
The system automatically creates this structure:
```
uploads/
├── artifacts/
│   ├── images/
│   │   ├── originals/
│   │   └── thumbnails/
│   ├── videos/
│   │   ├── originals/
│   │   └── thumbnails/
│   ├── audio/
│   │   └── originals/
│   └── documents/
│       ├── originals/
│       └── previews/
└── temp/
```

### Permissions
Ensure the upload directory has proper permissions:
```bash
# Create upload directory
mkdir -p uploads

# Set permissions (adjust user as needed)
chmod 755 uploads
chown -R www-data:www-data uploads  # Linux
chown -R _www:_www uploads           # macOS
```

### Nginx Configuration (Production)
```nginx
server {
    # ... other config ...
    
    # Serve uploaded files
    location /uploads {
        alias /path/to/your/app/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
    }
    
    # Limit upload size
    client_max_body_size 25M;
}
```

## S3 Storage Setup

### AWS S3 Configuration

#### 1. Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://teaching-engine-artifacts

# Set bucket policy for private access
aws s3api put-bucket-acl --bucket teaching-engine-artifacts --acl private
```

#### 2. Create IAM User
Create an IAM user with programmatic access and attach this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectVersion"
      ],
      "Resource": "arn:aws:s3:::teaching-engine-artifacts/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::teaching-engine-artifacts"
    }
  ]
}
```

#### 3. Configure Environment
```env
# Use S3 storage
STORAGE_DRIVER=s3

# S3 Configuration
S3_BUCKET=teaching-engine-artifacts
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BASE_URL=https://teaching-engine-artifacts.s3.amazonaws.com

# Optional: Custom endpoint for S3-compatible services
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
```

### S3-Compatible Services

#### DigitalOcean Spaces
```env
STORAGE_DRIVER=s3
S3_BUCKET=your-space-name
S3_REGION=nyc3
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_ACCESS_KEY_ID=your-spaces-key
S3_SECRET_ACCESS_KEY=your-spaces-secret
S3_BASE_URL=https://your-space-name.nyc3.digitaloceanspaces.com
```

#### MinIO (Self-hosted)
```env
STORAGE_DRIVER=s3
S3_BUCKET=teaching-engine
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BASE_URL=http://localhost:9000/teaching-engine
S3_FORCE_PATH_STYLE=true
```

## Storage Quotas

### Configuration
```env
# Per-teacher storage limits
STUDENT_STORAGE_QUOTA_GB=5         # 5GB per teacher
STORAGE_WARNING_THRESHOLD=0.8      # Warn at 80% usage
STORAGE_CRITICAL_THRESHOLD=0.9     # Critical at 90% usage
```

### Monitoring Usage
```javascript
// API endpoint to check storage usage
GET /api/storage/usage

Response:
{
  "used": 2147483648,      // bytes
  "quota": 5368709120,      // bytes
  "percentage": 40,
  "status": "ok",           // ok | warning | critical
  "breakdown": {
    "images": 1073741824,
    "videos": 536870912,
    "audio": 268435456,
    "documents": 268435456
  }
}
```

## File Type Configuration

### Supported MIME Types
```env
UPLOAD_ALLOWED_MIME=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav,audio/ogg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### File Processing Settings
```env
# Image Processing
IMAGE_THUMBNAIL_SIZE=200           # Thumbnail width in pixels
IMAGE_QUALITY=85                   # JPEG quality (1-100)
IMAGE_MAX_WIDTH=2000              # Maximum image width
IMAGE_MAX_HEIGHT=2000             # Maximum image height

# Video Processing
VIDEO_THUMBNAIL_TIME=00:00:01     # Time to extract thumbnail
VIDEO_MAX_DURATION=600            # Maximum video duration (seconds)
VIDEO_THUMBNAIL_SIZE=320          # Thumbnail width

# Document Processing
DOCUMENT_PREVIEW_PAGES=3          # Number of preview pages
DOCUMENT_MAX_PAGES=100           # Maximum document pages

# Audio Processing
AUDIO_WAVEFORM_SAMPLES=100       # Waveform visualization samples
AUDIO_MAX_DURATION=600           # Maximum audio duration (seconds)
```

## Backup Strategies

### Local Storage Backup
```bash
#!/bin/bash
# backup-uploads.sh

BACKUP_DIR="/backups/uploads"
UPLOAD_DIR="/app/uploads"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" "$UPLOAD_DIR"

# Keep only last 30 days
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +30 -delete

# Sync to remote (optional)
rsync -avz "$BACKUP_DIR/" user@backup-server:/backups/teaching-engine/
```

### S3 Backup
```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket teaching-engine-artifacts \
  --versioning-configuration Status=Enabled

# Enable lifecycle rules for old versions
aws s3api put-bucket-lifecycle-configuration \
  --bucket teaching-engine-artifacts \
  --lifecycle-configuration file://lifecycle.json

# Cross-region replication (optional)
aws s3api put-bucket-replication \
  --bucket teaching-engine-artifacts \
  --replication-configuration file://replication.json
```

## Migration Between Storage Types

### Local to S3
```bash
# Use provided migration script
npm run storage:migrate -- --from=local --to=s3

# Or manually with AWS CLI
aws s3 sync ./uploads s3://teaching-engine-artifacts/uploads
```

### S3 to Local
```bash
# Use migration script
npm run storage:migrate -- --from=s3 --to=local

# Or manually
aws s3 sync s3://teaching-engine-artifacts/uploads ./uploads
```

## Troubleshooting

### Permission Denied (Local)
```bash
# Check directory ownership
ls -la uploads/

# Fix permissions
sudo chown -R $(whoami) uploads/
chmod -R 755 uploads/
```

### S3 Access Denied
```bash
# Test credentials
aws s3 ls s3://teaching-engine-artifacts/ --profile teaching-engine

# Check IAM permissions
aws iam get-user-policy --user-name teaching-engine-user --policy-name S3Access
```

### File Size Limits
```nginx
# Nginx: Increase client_max_body_size
client_max_body_size 50M;

# Node.js: Increase payload limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### Storage Full
```bash
# Check disk usage
df -h

# Find large files
find uploads/ -type f -size +100M

# Clean old temp files
find uploads/temp/ -type f -mtime +1 -delete
```

## Performance Optimization

### CDN Integration
```env
# CloudFront (AWS)
CDN_URL=https://d123456789.cloudfront.net

# Cloudflare
CDN_URL=https://cdn.teaching-engine.com
```

### Image Optimization
```env
# Enable WebP conversion
IMAGE_CONVERT_WEBP=true

# Progressive JPEG
IMAGE_PROGRESSIVE=true

# Lazy loading sizes
IMAGE_SIZES=100,200,400,800,1200
```

### Caching Strategy
```nginx
# Nginx caching for local files
location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Best Practices

1. **File Validation**
   - Always validate MIME types
   - Check file extensions
   - Scan for malware (ClamAV integration)

2. **Access Control**
   - Use signed URLs for S3
   - Implement rate limiting
   - Require authentication for downloads

3. **Data Protection**
   - Encrypt files at rest
   - Use HTTPS for all transfers
   - Regular security audits

4. **Isolation**
   - Store files outside web root
   - Use separate subdomain for uploads
   - Implement CSP headers