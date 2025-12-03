from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True, nullable=True)
    logo_url = Column(Text, nullable=True)
    brand_color = Column(String(7), nullable=True, default="#000000")
    brand_secondary_color = Column(String(7), nullable=True, default="#FFFFFF")
    background_image_url = Column(Text, nullable=True)
    slug = Column(String(255), unique=True, nullable=False)
    
    # CMS-like customization fields
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    social_media = Column(JSON, nullable=True, default={})  # {facebook, twitter, linkedin, instagram, etc}
    custom_css = Column(Text, nullable=True)
    card_template = Column(String(50), nullable=True, default="default")  # default | modern | minimal | vibrant
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="company", cascade="all, delete-orphan")
    analytics = relationship("AnalyticsEvent", back_populates="company", cascade="all, delete-orphan")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    photo_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    social_links = Column(JSON, nullable=True, default={})
    public_slug = Column(String(255), unique=True, nullable=False)
    
    # CMS customization for cards
    card_background_color = Column(String(7), nullable=True)
    card_text_color = Column(String(7), nullable=True)
    card_accent_color = Column(String(7), nullable=True)
    card_background_image_url = Column(Text, nullable=True)
    custom_fields = Column(JSON, nullable=True, default={})  # Additional custom fields
    
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="employees")
    cards = relationship("Card", back_populates="employee", cascade="all, delete-orphan")
    analytics = relationship("AnalyticsEvent", back_populates="employee", cascade="all, delete-orphan")


class Card(Base):
    __tablename__ = "cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    qr_code = Column(Text, nullable=True)
    vcard_url = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", back_populates="cards")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="employee")  # superadmin | admin | employee
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="users")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    plan = Column(String(50), nullable=False)  # starter | professional | enterprise
    active = Column(Boolean, default=True)
    started_at = Column(DateTime, server_default=func.now())
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="subscriptions")


class AnalyticsEvent(Base):
    __tablename__ = "analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=True)
    timestamp = Column(DateTime, server_default=func.now())
    device = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    action = Column(String(50), nullable=False)  # view | call | whatsapp | email | download_vcard | scan_qr
    ip_address = Column(String(45), nullable=True)

    # Relationships
    company = relationship("Company", back_populates="analytics")
    employee = relationship("Employee", back_populates="analytics")
