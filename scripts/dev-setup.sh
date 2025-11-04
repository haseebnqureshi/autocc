#!/bin/bash
set -e

echo "🔧 Setting up autocc development environment..."
echo ""

# Build the project
echo "📦 Building project..."
npm run build

# Clean up any existing global installations first
echo "🧹 Cleaning up existing installations..."
npm unlink -g autocc 2>/dev/null || true
npm uninstall -g autocc 2>/dev/null || true

# Remove any existing autocc-local symlink
NPM_PREFIX=$(npm config get prefix)
NPM_BIN_DIR="$NPM_PREFIX/bin"
if [ -L "$NPM_BIN_DIR/autocc-local" ]; then
  echo "🗑️  Removing existing autocc-local symlink..."
  rm "$NPM_BIN_DIR/autocc-local"
fi

# Install npm published version as autocc
echo "📥 Installing npm version of autocc..."
npm install -g autocc

# Create manual symlink for autocc-local pointing to local development version
echo "🔗 Creating autocc-local symlink to local version..."
LOCAL_CLI_PATH="$(pwd)/dist/cli.js"
ln -sf "$LOCAL_CLI_PATH" "$NPM_BIN_DIR/autocc-local"
chmod +x "$LOCAL_CLI_PATH"

echo ""
echo "✅ Setup complete!"
echo ""
echo "You now have:"
echo "  autocc        → npm published version"
echo "  autocc-local  → your local development version"
echo ""
echo "Test with:"
echo "  autocc        # Test what users experience"
echo "  autocc-local  # Test your changes"
echo ""
