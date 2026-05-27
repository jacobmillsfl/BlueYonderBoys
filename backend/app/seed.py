from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import get_settings
from app.models import AdminUser, BandMotto, Bio, Link

DEFAULT_MOTTO = (
    "Rock & Latin-inspired acoustic music — warm, dynamic, and built for the live room."
)

DEFAULT_BIO = (
    "Blue Yonder Boys are an acoustic guitar duo based in Fort Collins, Colorado, "
    "blending expressive Latin and Spanish-inspired styles with elements of rock, 80s, "
    "and modern acoustic music to create a warm, dynamic and upbeat sound. They deliver "
    "intimate yet energetic performances featuring a mix of original songs and reimagined "
    "covers. Their music ranges from smooth, romantic tones to driving, rhythmic grooves "
    "rooted in Spanish guitar traditions, all woven together with the melodic and atmospheric "
    "edge of their diverse influences to create a versatile, engaging live experience."
)

# Previous seed text — upgrade existing databases that still have the placeholder bio.
_LEGACY_DEFAULT_BIO = (
    "Blue Yonder Boys bring together warm harmonies, dusty roads, and songs "
    "that feel like they've been sung around a campfire for generations. "
    "Rooted in americana and folk, their sound is whiskey-weathered and wide-open—"
    "music for long drives, late nights, and the kind of company you keep close."
)

DEFAULT_LINKS = [
    ("YouTube", "https://youtube.com", "youtube", 0),
    ("Instagram", "https://instagram.com", "instagram", 1),
    ("Venmo", "https://venmo.com", "venmo", 2),
    ("Email", "mailto:blueyonderboys@gmail.com", "email", 3),
]


def seed_database(db: Session) -> None:
    settings = get_settings()

    bio = db.query(Bio).first()
    if bio is None:
        db.add(Bio(id=1, content=DEFAULT_BIO))
    elif bio.content.strip() == _LEGACY_DEFAULT_BIO.strip():
        bio.content = DEFAULT_BIO

    motto = db.query(BandMotto).first()
    if motto is None:
        db.add(BandMotto(id=1, content=DEFAULT_MOTTO))

    if db.query(Link).count() == 0:
        for label, url, icon, sort_order in DEFAULT_LINKS:
            db.add(Link(label=label, url=url, icon=icon, sort_order=sort_order))

    admin = db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first()
    if admin is None and settings.admin_password:
        db.add(
            AdminUser(
                username=settings.admin_username,
                password_hash=hash_password(settings.admin_password),
            )
        )
    elif admin is not None and settings.admin_password:
        admin.password_hash = hash_password(settings.admin_password)

    db.commit()
