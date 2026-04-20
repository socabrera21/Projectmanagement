#!/bin/bash

# API Key Addition Script for Claude Flow
# This script securely adds OpenAI and Gemini API keys to .env

set -e

echo "=================================="
echo "Claude Flow - API Key Setup"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

echo "This script will help you add your API keys to .env"
echo ""

# Add OpenAI API Key
echo "1. OpenAI API Key"
echo "   Get your key from: https://platform.openai.com/api-keys"
echo ""
echo -n "Enter your OpenAI API key (or press Enter to skip): "
read -s OPENAI_KEY
echo ""

if [ ! -z "$OPENAI_KEY" ]; then
    # Use a temporary file for safe editing
    sed "s|OPENAI_API_KEY=your-openai-api-key-here|OPENAI_API_KEY=$OPENAI_KEY|g" .env > .env.tmp
    mv .env.tmp .env
    chmod 600 .env
    echo "✅ OpenAI API key added"
else
    echo "⏭️  Skipped OpenAI key"
fi

echo ""

# Add Gemini API Key
echo "2. Gemini API Key"
echo "   Get your key from: https://makersuite.google.com/app/apikey"
echo ""
echo -n "Enter your Gemini API key (or press Enter to skip): "
read -s GEMINI_KEY
echo ""

if [ ! -z "$GEMINI_KEY" ]; then
    sed "s|GEMINI_API_KEY=your-gemini-api-key-here|GEMINI_API_KEY=$GEMINI_KEY|g" .env > .env.tmp
    mv .env.tmp .env
    chmod 600 .env
    echo "✅ Gemini API key added"
else
    echo "⏭️  Skipped Gemini key"
fi

echo ""
echo "=================================="
echo "✅ API Key Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Test connectivity: npx claude-flow@alpha providers test --all"
echo "2. List available models: npx claude-flow@alpha providers models"
echo ""
