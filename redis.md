# Redis Quick Setup (GrowFriend)

This project uses Redis for optional backend caching.

## What Redis Does Here
- Caches selected API responses (currently dashboard/coin-related cache keys).
- Reduces repeated DB aggregation work.
- Is safe to run as optional infrastructure (app still works without Redis).

If `REDIS_URL` is not set, backend logs:
`REDIS_URL not set. Redis connection skipped.`

## Required Environment Variables
Add these in `backend/.env`:

```env
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true
```

Notes:
- `REDIS_URL` can be local Redis or hosted Redis (for example Redis Cloud).
- `CACHE_ENABLED` defaults to `true` if not provided.
- Set `CACHE_ENABLED=false` to disable cache logic without removing Redis config.

## Install Redis (Local Development)

### Option A: Docker (Recommended)
```bash
docker run --name growfriend-redis -p 6379:6379 -d redis:7-alpine
```

To stop/start later:
```bash
docker stop growfriend-redis
docker start growfriend-redis
```

### Option B: Native Install (Windows with winget)
```powershell
winget install -e --id Memurai.MemuraiDeveloper
```

Then use:
`REDIS_URL=redis://localhost:6379`

## Backend Run Steps
From project root:

```bash
cd backend
npm install
npm run dev
```

## Quick Verification
When backend starts with Redis configured, you should see:
`Redis connected`

If Redis is down or misconfigured, backend stays up and logs Redis errors.

## Production Notes
- Use a managed Redis service and set `REDIS_URL` from platform secrets.
- Keep `CACHE_ENABLED=true` in production unless troubleshooting.
- Ensure Redis access is restricted to trusted network/auth settings.