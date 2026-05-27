import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.config import get_settings
from app.database import get_db
from app.models import Photo
from app.schemas import PhotoOut

router = APIRouter(prefix="/api/photos", tags=["photos"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def _photo_url(filename: str) -> str:
    return f"/api/photos/files/{filename}"


@router.get("", response_model=list[PhotoOut])
def list_photos(db: Session = Depends(get_db)):
    photos = db.query(Photo).order_by(Photo.sort_order.asc(), Photo.id.asc()).all()
    return [
        PhotoOut(
            id=p.id,
            url=_photo_url(p.filename),
            caption=p.caption,
            sort_order=p.sort_order,
        )
        for p in photos
    ]


@router.get("/files/{filename}")
def serve_photo(filename: str):
    settings = get_settings()
    safe_name = Path(filename).name
    path = os.path.join(settings.uploads_dir, safe_name)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(path)


@router.post("", response_model=PhotoOut)
async def upload_photo(
    file: UploadFile = File(...),
    caption: str | None = Form(None),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    settings = get_settings()
    os.makedirs(settings.uploads_dir, exist_ok=True)

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(settings.uploads_dir, stored_name)

    content = await file.read()
    with open(dest, "wb") as f:
        f.write(content)

    max_order = db.query(Photo).count()
    photo = Photo(filename=stored_name, caption=caption, sort_order=max_order)
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return PhotoOut(
        id=photo.id,
        url=_photo_url(photo.filename),
        caption=photo.caption,
        sort_order=photo.sort_order,
    )


@router.delete("/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    settings = get_settings()
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    path = os.path.join(settings.uploads_dir, photo.filename)
    if os.path.isfile(path):
        os.remove(path)

    db.delete(photo)
    db.commit()
    return {"ok": True}
