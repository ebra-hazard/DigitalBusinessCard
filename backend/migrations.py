"""
Database migration: Add CMS customization fields to companies and employees
Run this after updating database_models.py
"""

import asyncio
from sqlalchemy import text
from database import engine

async def add_company_customization_fields():
    """Add customization fields to companies table"""
    async with engine.begin() as conn:
        # Check if columns exist, if not add them
        migrations = [
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS brand_secondary_color VARCHAR(7) DEFAULT '#FFFFFF'",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS background_image_url TEXT",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS website VARCHAR(255)",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS custom_css TEXT",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS card_template VARCHAR(50) DEFAULT 'default'",
        ]
        
        for migration in migrations:
            try:
                await conn.execute(text(migration))
                print(f"✓ Executed: {migration[:60]}...")
            except Exception as e:
                print(f"✗ Migration failed: {migration[:60]}... - {str(e)}")

async def add_employee_customization_fields():
    """Add customization fields to employees table"""
    async with engine.begin() as conn:
        migrations = [
            "ALTER TABLE employees ADD COLUMN IF NOT EXISTS card_background_color VARCHAR(7)",
            "ALTER TABLE employees ADD COLUMN IF NOT EXISTS card_text_color VARCHAR(7)",
            "ALTER TABLE employees ADD COLUMN IF NOT EXISTS card_accent_color VARCHAR(7)",
            "ALTER TABLE employees ADD COLUMN IF NOT EXISTS card_background_image_url TEXT",
            "ALTER TABLE employees ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'",
        ]
        
        for migration in migrations:
            try:
                await conn.execute(text(migration))
                print(f"✓ Executed: {migration[:60]}...")
            except Exception as e:
                print(f"✗ Migration failed: {migration[:60]}... - {str(e)}")

async def main():
    print("🔄 Running database migrations...")
    await add_company_customization_fields()
    await add_employee_customization_fields()
    print("✅ Migrations completed!")

if __name__ == "__main__":
    asyncio.run(main())
