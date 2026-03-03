"""
Configuration settings for Interview Prep Agent
"""

import os
from pathlib import Path

# API Configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

if not ANTHROPIC_API_KEY:
    raise ValueError(
        "ANTHROPIC_API_KEY environment variable is not set. "
        "Please set it with: export ANTHROPIC_API_KEY='your-key-here'"
    )

# Model Configuration
MODEL_NAME = "claude-sonnet-4-5-20250929"  # Latest Claude Sonnet 4.5
MAX_TOKENS = 4096
TEMPERATURE = 0.7

# Directory Configuration
PROJECT_ROOT = Path(__file__).parent
OUTPUT_DIR = PROJECT_ROOT / "output"
TEMPLATES_DIR = PROJECT_ROOT / "templates"

# Ensure directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)

# Search Configuration (for future integration with real search APIs)
SEARCH_CONFIG = {
    "default_num_results": 5,
    "max_num_results": 10,
    # Add your search API keys here when integrating:
    # "exa_api_key": os.getenv("EXA_API_KEY", ""),
    # "serpapi_key": os.getenv("SERPAPI_KEY", ""),
}

# Document Generation Settings
DOCUMENT_SETTINGS = {
    "default_font": "Calibri",
    "default_font_size": 11,
    "heading_color": (0, 51, 102),  # RGB: Dark Blue
}
