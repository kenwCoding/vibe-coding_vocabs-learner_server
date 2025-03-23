#!/bin/bash

# Navigate to server directory (if needed)
# cd /path/to/server/directory

# Ensure script exits on first error
set -e

echo "📚 VocabMaster Level Fix Utility 📚"
echo "-----------------------------------"

# Check if the environment file exists
if [ ! -f .env ]; then
  echo "⚠️  Warning: .env file not found. Make sure database connection is configured."
fi

# Compile TypeScript code if needed
echo "🔧 Compiling TypeScript..."
yarn build || npm run build

# Run the fix utility
echo "🔄 Running level fix utility..."
node dist/utils/fixLevels.js

echo "✅ Level fix process completed."
echo ""
echo "If you want to verify the changes, you can check the MongoDB database."
echo "Example MongoDB query: db.vocablists.find({}, {title: 1, level: 1})" 