#!/bin/sh
set -e

echo "Building frontend..."
cd ../frontend
npm ci

VITE_API_URL=/api/v1 \
VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-https://axjzakmelmoqmzuxvwsa.supabase.co} \
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4anpha21lbG1vcW16dXh2d3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODI3OTMsImV4cCI6MjA5MjU1ODc5M30.y8zl0PUmo4Ya77fswF_HWWHfGNzXN45oN67Fe6RUq9k} \
npm run build

echo "Copying frontend dist to backend-ts/public..."
cd ../backend-ts
rm -rf public
mkdir -p public
cp -r ../frontend/dist/* public/

echo "Installing backend dependencies..."
npm ci

echo "Build complete!"
