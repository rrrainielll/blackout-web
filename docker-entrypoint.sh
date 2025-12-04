#!/bin/sh
set -e

echo "🔍 Checking database connection..."

# Wait for database to be ready
until npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  echo "⏳ Waiting for database to be ready..."
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed successfully!"

echo "🚀 Starting application..."
exec node server.js
