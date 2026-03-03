#!/bin/bash

set -e

echo "🚀 Setting up MCP servers for Claude Code..."

# Configuration paths
CLAUDE_CONFIG_DIR="$HOME/.config/claude"
MCP_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js and npx found"

# Create or update MCP configuration
cat > "$MCP_CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch"
      ],
      "env": {}
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/Apple/Projectmanagement"
      ],
      "env": {}
    },
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ],
      "env": {}
    }
  }
}
EOF

echo "✓ MCP configuration created at $MCP_CONFIG_FILE"
echo ""
echo "📦 Installed MCP servers:"
echo "  • fetch - Web scraping and URL fetching"
echo "  • filesystem - File system operations"
echo "  • puppeteer - Advanced web scraping with browser automation"
echo ""
echo "⚠️  Note: For PDF processing, you can use the filesystem server to read PDFs"
echo "   and Claude's built-in PDF reading capabilities."
echo ""
echo "✅ Setup complete!"
echo ""
echo "🔄 Please restart Claude Code to load the new MCP servers."
echo ""
echo "You can now use commands like:"
echo "  • 'Generate a React skill from https://react.dev/'"
echo "  • 'Scrape documentation and create a skill'"
echo "  • 'Read PDF at docs/manual.pdf and create skill'"
echo ""
