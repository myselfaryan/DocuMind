import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")

if API_KEY:
    genai.configure(api_key=API_KEY)

def generate_section_content(title: str) -> str:
    prompt = f"Write a detailed, professional section for the topic: {title}."
    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Generated placeholder text (error: {e})"

def refine_content(existing: str, instruction: str) -> str:
    prompt = f"""
    Rewrite the following text based on the instruction.

    Original text:
    {existing}

    Instruction:
    {instruction}

    Return improved version.
    """
    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return existing + f"\n\n(Refine error: {e})"
