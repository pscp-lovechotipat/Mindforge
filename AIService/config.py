"""
Configuration Module is handles environment variables and configuration settings.

Author: Kongpop
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Neo4j configuration
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j")

# API tokens
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

# Validate required
required_vars = [
    "NEO4J_URI",
    "NEO4J_USERNAME",
    "NEO4J_PASSWORD",
    "GROQ_API_KEY",  # เพิ่ม GROQ_API_KEY เข้าไปในการตรวจสอบ
]

# Validate required environment variables
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    raise EnvironmentError(
        f"Missing required environment variables: {', '.join(missing_vars)}"
    )

# Optional configuration settings
DEFAULT_MODEL_NAME = "llama-3.1-70b-versatile"
DEFAULT_TEMPERATURE = 0.3
DEFAULT_REQUEST_DELAY = 1.0
MAX_RETRIES = 3

# File handling settings
ALLOWED_FILE_TYPES = ['.pdf', '.txt', '.md']
CHUNK_SIZE = 10000
CHUNK_OVERLAP = 1000

print("Configuration loaded successfully")