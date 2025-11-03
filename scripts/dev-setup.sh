#!/bin/bash
set -e

echo "🔧 Setting up autocc development environment..."
echo ""

# Build the project
echo "📦 Building project..."
npm run build

# Link both commands (autocc and autocc-local)
echo "🔗 Linking local version..."
npm link

# Unlink autocc to make room for npm version
echo "🔓 Unlinking autocc..."
npm unlink -g autocc 2>/dev/null || true

# Install npm published version as autocc
echo "📥 Installing npm version of autocc..."
npm install -g autocc

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
