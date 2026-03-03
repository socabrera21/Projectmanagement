#!/bin/bash

# Interview Prep Agent - Setup Script
# This script installs all dependencies for the interview prep agent

set -e  # Exit on error

echo "================================================"
echo "Interview Prep Agent - Setup"
echo "================================================"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "✓ pip3 found: $(pip3 --version)"
echo ""

# Install required packages
echo "📦 Installing dependencies..."
echo ""

pip3 install -r requirements.txt

echo ""
echo "================================================"
echo "✓ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Set your API key:"
echo "   export ANTHROPIC_API_KEY='your-key-here'"
echo ""
echo "2. Run the agent:"
echo "   python3 interview_prep_agent.py"
echo ""
echo "Get your API key from: https://console.anthropic.com/settings/keys"
echo ""
