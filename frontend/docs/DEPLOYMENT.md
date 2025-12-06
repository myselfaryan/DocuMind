# DocuMind - Deployment Guide

Complete guide for deploying DocuMind to production.

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] All tests passing
- [ ] Code reviewed and merged
- [ ] Dependencies updated
- [ ] Build succeeds locally
- [ ] Performance tested

## Deployment Platforms

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications with built-in optimizations.

#### Setup

1. **Push code to GitHub**
   \`\`\`bash
   git push origin main
   \`\`\`

2. **Import project to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Select GitHub repository
   - Vercel detects Next.js automatically

3. **Configure environment variables**
   \`\`\`bash
   vercel env add DATABASE_URL
   vercel env add GEMINI_API_KEY
   vercel env add JWT_SECRET
   \`\`\`
   Or in Vercel dashboard: Settings → Environment Variables

4. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

#### Configuration

`vercel.json`:
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "@database_url",
    "GEMINI_API_KEY": "@gemini_api_key",
    "JWT_SECRET": "@jwt_secret"
  }
}
\`\`\`

#### Features
- Automatic HTTPS and CDN
- Serverless functions for API routes
- Edge middleware support
- Automatic Git deployments
- Preview deployments for PRs
- Built-in monitoring

### Docker (Self-Hosted)

For deploying to your own servers.

#### Build Docker Image

`Dockerfile`:
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
\`\`\`

Build and push:
\`\`\`bash
docker build -t docgenai:latest .
docker tag docgenai:latest registry.example.com/docgenai:latest
docker push registry.example.com/docgenai:latest
\`\`\`

#### Docker Compose

`docker-compose.yml`:
\`\`\`yaml
version: '3.8'

services:
  app:
    image: docgenai:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://...
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: docgenai
      POSTGRES_USER: docgenai
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

Run:
\`\`\`bash
docker-compose up -d
\`\`\`

## Environment Configuration

### Production Variables

All variables must be set before starting application:

\`\`\`
# Database
DATABASE_URL=postgresql://user:pass@host:5432/docgenai

# AI API
GEMINI_API_KEY=your-gemini-api-key

# Authentication
JWT_SECRET=generate-with: openssl rand -base64 32

# Deployment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://docgenai.com
\`\`\`

### Generating Secure Secrets

\`\`\`bash
# JWT Secret (32 bytes base64)
openssl rand -base64 32

# Alternative for high entropy
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## Database Setup

### Production Neon Database

1. **Create Neon project**
   - Go to [neon.tech](https://neon.tech)
   - Create new project
   - Copy connection string

2. **Initialize schema**
   \`\`\`bash
   psql $DATABASE_URL < scripts/01-init-schema.sql
   \`\`\`

3. **Verify tables**
   \`\`\`bash
   psql $DATABASE_URL -c "\dt"
   \`\`\`

### Backup Strategy

Neon provides automated backups:
- Daily backups (7 days retention)
- Point-in-time recovery (1 month)
- Manual backups available

Enable backup:
\`\`\`bash
# Neon Dashboard → Project → Backups
# Schedule backups and test recovery regularly
\`\`\`

### Database Optimization

1. **Enable Connection Pooling**
   - Neon Dashboard → Settings
   - Connection pooling: "Transaction" mode
   - Pool size: 5-10

2. **Add Indexes** (already in schema)
   - projects(user_id)
   - sections(project_id)
   - refinements(section_id)
   - comments(refinement_id)

## Performance Optimization

### Image Optimization
\`\`\`typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/placeholder.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false}
/>
\`\`\`

### Code Splitting
Automatic with Next.js App Router, routes are split automatically.

### Caching Strategy

Browser caching (in `next.config.mjs`):
\`\`\`javascript
async headers() {
  return [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
}
\`\`\`

### Rate Limiting at Edge

Consider Upstash Redis for distributed rate limiting:
\`\`\`typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m")
})

const { success } = await ratelimit.limit("user-id")
if (!success) return new Response("Rate limited", { status: 429 })
\`\`\`

## Monitoring & Logging

### Vercel Analytics

Automatic with Vercel deployment. Monitor:
- Response times
- Error rates
- Traffic patterns

### Application Logging

Use structured logging (recommended upgrade):
\`\`\`typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
})

logger.info('Application started')
logger.error('Error message', { error })
\`\`\`

### Error Tracking

Integrate with Sentry for production errors:
\`\`\`bash
npm install @sentry/nextjs
\`\`\`

## Scaling

### Horizontal Scaling

1. **Database Connection Pooling**
   - Use Neon's connection pooling
   - Configure appropriate pool size

2. **Caching Layer**
   - Add Redis for session caching
   - Cache common queries
   - Cache generated outlines

3. **CDN**
   - Vercel handles CDN automatically
   - CloudFlare for additional edge caching

### Vertical Scaling

If not using serverless:
- Increase server memory
- Upgrade CPU cores
- Better disk I/O

## Security Hardening

### HTTPS
- Automatic with Vercel
- For self-hosted: Use Let's Encrypt

### Security Headers

`next.config.mjs`:
\`\`\`javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ]
    }
  ]
}
\`\`\`

### Rate Limiting
Configured per-user in AIService. Upgrade to distributed rate limiting for production.

### Input Validation
All inputs validated with Zod schemas before processing.

## Troubleshooting

### Build Fails
- Check Node version (18+)
- Verify all dependencies install
- Check for TypeScript errors: `npm run build`

### Database Connection Issues
- Verify DATABASE_URL is set
- Check Neon dashboard for active connections
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### API Timeouts
- Check Gemini API status
- Reduce model temperature/max_tokens
- Enable rate limiting warnings

### Memory Issues
- Check server resources
- Enable compression: `compression` middleware
- Reduce batch sizes for exports

## Rollback Strategy

### Vercel
- Automatic rollback to previous deployment
- Vercel Dashboard → Deployments → Redeploy

### Docker
- Keep previous image tags
- Use semantic versioning
- Rollback: `docker pull registry.example.com/docgenai:v1.0.0`

## Monitoring Checklist

- [ ] Error rate < 0.1%
- [ ] Response time avg < 500ms
- [ ] Database connections stable
- [ ] API rate limits not exceeded
- [ ] Disk space available
- [ ] Memory usage normal
- [ ] Backup tests passing

## Post-Deployment

1. **Verify functionality**
   - Test user registration
   - Create and export document
   - Check all features working

2. **Monitor performance**
   - Watch error rates
   - Monitor slow queries
   - Track API costs

3. **Set up alerts**
   - Error rate spike
   - Database connection failures
   - API rate limit warnings

## Maintenance

### Regular Tasks
- Monthly security updates
- Quarterly performance reviews
- Backup verification
- Dependency updates

### Update Dependencies
\`\`\`bash
npm outdated
npm update
npm audit fix
npm run build
\`\`\`

### Database Maintenance
\`\`\`bash
# Analyze query performance
EXPLAIN ANALYZE SELECT ...;

# Rebuild indexes if needed
REINDEX INDEX idx_name;

# Monitor table size
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public';
