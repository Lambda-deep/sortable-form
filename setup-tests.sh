#!/bin/bash

# Playwright Test Setup Script
# このスクリプトはPlaywrightテスト環境をセットアップします

echo "Setting up Playwright test environment..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing project dependencies..."
    npm install
fi

# Try to install Playwright browsers
echo "Installing Playwright browsers..."
if npx playwright install chromium; then
    echo "✅ Playwright browsers installed successfully"
else
    echo "⚠️  Warning: Failed to install Playwright browsers"
    echo "   This might be due to network issues or environment limitations"
    echo "   Tests can still be written and configured, but execution requires browser installation"
fi

# Check if development server is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Development server is already running on port 5173"
else
    echo "⚠️  Development server is not running"
    echo "   Start it with: npm run dev"
fi

# Validate test files
echo "Validating test files..."
test_files=(
    "tests/parent-sort.spec.ts"
    "tests/child-sort.spec.ts"
    "tests/form-integration.spec.ts"
    "tests/ui-ux.spec.ts"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Not found"
    fi
done

# Check Playwright config
if [ -f "playwright.config.ts" ]; then
    echo "✅ playwright.config.ts"
else
    echo "❌ playwright.config.ts - Not found"
fi

echo ""
echo "🧪 Test Setup Complete!"
echo ""
echo "To run tests:"
echo "  1. Start development server: npm run dev"
echo "  2. Run tests: npm test"
echo "  3. Run tests with UI: npm run test:ui"
echo "  4. Show test report: npm run test:report"
echo ""
echo "If browser installation failed, try:"
echo "  - npx playwright install"
echo "  - npx playwright install chromium"
echo "  - npx playwright install --with-deps"