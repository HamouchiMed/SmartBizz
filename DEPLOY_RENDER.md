# Deploy SmartBizz API on Render

## 1) Push project to GitHub
- Push this repo (including `render.yaml`) to GitHub.

## 2) Create Render service
- Open Render dashboard.
- Click `New` -> `Blueprint`.
- Select your GitHub repo.
- Render reads `render.yaml` and creates `smartbizz-api`.

## 3) Set environment variables
- In Render service settings, set:
- `DATABASE_URL`: your Neon connection string.
- `JWT_SECRET`: a strong random secret.

## 4) Deploy and verify
- Trigger deploy.
- Check health endpoint:
- `https://<your-render-domain>/health`

## 5) Connect Expo app to cloud API
- In project root, create `.env` with:
- `EXPO_PUBLIC_API_URL=https://<your-render-domain>`
- Restart Expo with cache clear:
- `npm run start -- --clear`

## 6) Optional seed
- If you want demo account in cloud DB, run once from your machine:
- `cd server`
- `npm run seed`
