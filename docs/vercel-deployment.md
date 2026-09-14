# Deploying to Vercel

## Steps

1. Install the CLI: `npm i -g vercel`
2. From the project root: `vercel login`, then `vercel` (or `vercel --prod` to deploy straight to production), or connect the GitHub repo in the Vercel dashboard for auto-deploy on push to `main`.
3. In the Vercel dashboard, under Project Settings → Environment Variables, set for the Production environment:
   - `NODE_ENV=production`
   - `DATABASE_URL` (see limitation below — a real value only matters once a real database is wired up)
   - `JWT_SECRET` (a real secret, not the placeholder in `.env.production`)
   - `MAX_FILE_SIZE_MB=5`
   - `UPLOAD_DIR=uploads`
   - `LOG_LEVEL=info`
   - `PORT` is not needed — Vercel manages the listening port for serverless functions, but it's still required by the app's startup validation, so set it to any value (e.g. `3000`).
4. Verify with the Postman `Production` environment (`postman/Production.postman_environment.json`) — update `BASE_URL` to the deployed URL first.

## Limitations of this deployment

**Ephemeral, read-only filesystem.** Vercel serverless functions run on a read-only filesystem except for `/tmp`, and `/tmp` itself is wiped between invocations and not shared across instances. This app's repository layer is also in-memory only, which is fine for a lab but has the same problem at production scale: no state survives past a single invocation or is shared across instances.

Concretely, on Vercel:
- `POST /media` writes to disk via Multer's `diskStorage` — this will fail once outside a writable path (`upload.middleware.js` now catches the startup `mkdir` failure so the app still boots, but the upload request itself will error).
- Even if a file *were* written to `/tmp` successfully, a later `GET /media/:id` could hit a different serverless instance (or the same instance after `/tmp` was cleared) and find nothing there.
- The in-memory media records themselves don't survive a cold start either.

## How to fix this for real production use

1. **Object storage for files** — switch Multer to `multer.memoryStorage()`, then stream `req.file.buffer` to S3 (via `@aws-sdk/client-s3`) or Cloudinary in the service layer. Store the returned URL/key as `filePath` instead of a local path, and serve files by redirecting to (or proxying) that URL.
2. **A real database for metadata** — replace `media.repository.js`'s in-memory array with a Postgres/Mongo-backed implementation (the repository already isolates this — only that one file needs to change). This is what `DATABASE_URL` is reserved for.
3. Add the storage provider's credentials as additional Vercel env vars (e.g. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`, or `CLOUDINARY_URL`).

None of this is implemented here — the app is intentionally kept on in-memory storage per the lab's scope — but the layered architecture (routes → controllers → services → repositories) means both swaps are localized to the repository and upload middleware/service, not a rewrite.
