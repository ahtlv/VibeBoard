from __future__ import annotations

import smtplib
from email.message import EmailMessage

from app.core.config import settings


class EmailDeliveryNotConfiguredError(Exception):
    """Email delivery is required but SMTP is not configured."""


def send_email_verification_link(*, to_email: str, name: str, verify_url: str) -> None:
    subject = "Confirm your VibeBoard account"
    text = (
        f"Hi {name},\n\n"
        "Welcome to VibeBoard. Confirm your email address to finish registration:\n\n"
        f"{verify_url}\n\n"
        "If you did not create this account, you can ignore this email."
    )

    if not settings.SMTP_HOST:
        if settings.APP_ENV == "production":
            raise EmailDeliveryNotConfiguredError("SMTP_HOST must be set in production")
        print(
            "[email verification] SMTP is not configured. "
            f"Verification link for {to_email}: {verify_url}"
        )
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.EMAIL_FROM
    message["To"] = to_email
    message.set_content(text)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
        if settings.SMTP_USE_TLS:
            smtp.starttls()
        if settings.SMTP_USERNAME:
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(message)
