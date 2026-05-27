from sqlalchemy import text
from sqlalchemy.engine import Engine


def migrate_schema(engine: Engine) -> None:
    """Apply lightweight SQLite migrations for existing databases."""
    with engine.begin() as conn:
        _migrate_shows(conn)


def _migrate_shows(conn) -> None:
    rows = conn.execute(text("PRAGMA table_info(shows)")).fetchall()
    if not rows:
        return

    cols = {row[1] for row in rows}

    if "time" not in cols:
        conn.execute(text("ALTER TABLE shows ADD COLUMN time VARCHAR(64) NOT NULL DEFAULT ''"))

    if "address" not in cols:
        conn.execute(text("ALTER TABLE shows ADD COLUMN address VARCHAR(256) NOT NULL DEFAULT ''"))
        if "location" in cols:
            conn.execute(text("UPDATE shows SET address = location WHERE address = '' OR address IS NULL"))

    # Drop legacy location / ticket_url columns by rebuilding the table.
    rows = conn.execute(text("PRAGMA table_info(shows)")).fetchall()
    cols = {row[1] for row in rows}
    if "location" in cols or "ticket_url" in cols:
        conn.execute(
            text(
                """
                CREATE TABLE shows_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date VARCHAR(64) NOT NULL,
                    time VARCHAR(64) NOT NULL DEFAULT '',
                    venue VARCHAR(256) NOT NULL,
                    address VARCHAR(256) NOT NULL,
                    is_active INTEGER DEFAULT 1
                )
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO shows_new (id, date, time, venue, address, is_active)
                SELECT
                    id,
                    date,
                    COALESCE(time, ''),
                    venue,
                    COALESCE(NULLIF(address, ''), location, ''),
                    COALESCE(is_active, 1)
                FROM shows
                """
            )
        )
        conn.execute(text("DROP TABLE shows"))
        conn.execute(text("ALTER TABLE shows_new RENAME TO shows"))
