import os
from google import genai
from dotenv import load_dotenv

# Load your .env file
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in .env")
else:
    print(f"✅ Found API Key: {api_key[:5]}...*****")
    try:
        client = genai.Client(api_key=api_key)
        print("\n🔍 Listing available models for this key:")
        print("-" * 40)
        # List models that support content generation
        for m in client.models.list(config={"query_base": True}):
            if "generateContent" in m.supported_actions:
                print(f"• {m.name.replace('models/', '')}")
        print("-" * 40)
    except Exception as e:
        print(f"❌ Error listing models: {e}")