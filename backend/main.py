# ---- LOAD ENV FIRST (VERY IMPORTANT) ----
from dotenv import load_dotenv
load_dotenv()

import os
import json
import smtplib
from datetime import datetime
from email.message import EmailMessage

from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from openai import OpenAI

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware


# ---- COST CONTROL CONSTANT ----
MAX_CHARS = 800


# ---- APP SETUP ----
app = FastAPI()
app.add_middleware(SlowAPIMiddleware)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter


# ---- HEALTH CHECK (REQUIRED FOR RAILWAY) ----
@app.get("/")
def health():
    return {"status": "ok"}


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=429,
        content={"reply": "⚠️ Too many messages. Please wait a minute and try again."}
    )


# ---- CORS (FIXED: ALLOW GET + POST) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://brevanext.com",
        "https://www.brevanext.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---- OPENAI CLIENT ----
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---- REQUEST MODELS ----
class ChatRequest(BaseModel):
    message: str


class LeadRequest(BaseModel):
    email: str
    business_type: str | None = None


# ---- EMAIL HELPER (SMTP) ----
def send_lead_email(email: str, business_type: str | None, timestamp: str):
    msg = EmailMessage()
    msg["Subject"] = "New BrevaNext Chatbot Lead"
    msg["From"] = os.getenv("EMAIL_USER")
    msg["To"] = os.getenv("LEAD_RECEIVER_EMAIL")

    msg.set_content(
        f"""
New chatbot lead received:

Work Email: {email}
Business Context: {business_type or "Not provided"}
Timestamp (UTC): {timestamp}

— BrevaNext AI Assistant
"""
    )

    with smtplib.SMTP(os.getenv("EMAIL_HOST"), int(os.getenv("EMAIL_PORT"))) as server:
        server.starttls()
        server.login(
            os.getenv("EMAIL_USER"),
            os.getenv("EMAIL_PASS")
        )
        server.send_message(msg)


# ---- CHAT ENDPOINT ----
@app.post("/chat")
@limiter.limit("5/minute")
def chat(request: Request, req: ChatRequest):

    if len(req.message) > MAX_CHARS:
        return {
            "reply": "⚠️ Message too long. Please keep it under 800 characters."
        }

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are BrevaNext, an AI assistant representing BrevaNext — an AI, "
                    "automation, and analytics consulting company.\n\n"
                    "Your role is to:\n"
                    "- Speak as a BrevaNext company representative\n"
                    "- Explain how BrevaNext helps businesses using AI, automation, and analytics\n"
                    "- Keep answers high-level and business-focused\n"
                    "- Avoid deep technical tutorials or code\n"
                    "- Do NOT say you are ChatGPT or an AI model\n"
                    "- When appropriate, suggest contacting BrevaNext for tailored solutions\n\n"
                    "Tone:\n"
                    "- Professional\n"
                    "- Clear\n"
                    "- Confident\n"
                    "- Business-oriented\n\n"
                    "If a user asks for detailed implementation, respond with a summary and "
                    "suggest a consultation instead."
                ),
            },
            {
                "role": "user",
                "content": req.message
            }
        ]
    )

    return {
        "reply": completion.choices[0].message.content
    }


# ---- LEAD CAPTURE ENDPOINT ----
@app.post("/lead")
def save_lead(lead: LeadRequest):

    lead_data = {
        "email": lead.email,
        "business_type": lead.business_type,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Save locally (backup)
    with open("leads.json", "a") as f:
        f.write(json.dumps(lead_data) + "\n")

    # Send email notification
    send_lead_email(
        lead.email,
        lead.business_type,
        lead_data["timestamp"]
    )

    return {"status": "ok"}
