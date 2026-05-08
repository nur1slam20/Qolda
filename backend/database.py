from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/shopai"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def migrate_db():
    """Safely add new columns to existing tables without dropping data."""
    stmts = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_seller BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES users(id)",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)",
    ]
    with engine.connect() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))
        conn.commit()
