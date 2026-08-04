"""
Script to list all available Gemini models that support generateContent.
Useful for debugging and finding the correct model names to use in analyzer.py.
"""
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client()
print("Available generateContent models:")
for m in client.models.list():
    if "generateContent" in m.supported_actions:
        print(m.name)
