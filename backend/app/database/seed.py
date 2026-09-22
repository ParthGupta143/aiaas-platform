import asyncio
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models import Service

SERVICES = [
    {"slug": "fraud", "name": "Fraud Detection", "status": "production",
     "description": "Real-time transaction fraud scoring.", "price_per_request": 0.001},
    {"slug": "document-extraction", "name": "Document Extraction", "status": "designed",
     "description": "Structured data extraction from documents.", "price_per_request": 0.002},
    {"slug": "sentiment", "name": "Sentiment / Intent Classification", "status": "designed",
     "description": "Classify text sentiment and intent.", "price_per_request": 0.0015},
    {"slug": "pii-redaction", "name": "PII/Sensitive Data Redaction", "status": "designed",
     "description": "Detect and redact sensitive information.", "price_per_request": 0.0015},
]


async def seed_services():
    async with AsyncSessionLocal() as db:
        for entry in SERVICES:
            existing = await db.execute(select(Service).where(Service.slug == entry["slug"]))
            if existing.scalar_one_or_none() is None:
                db.add(Service(**entry))
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed_services())