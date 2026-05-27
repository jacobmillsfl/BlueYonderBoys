from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import Show
from app.schemas import ShowCreate, ShowOut, ShowUpdate

router = APIRouter(prefix="/api/shows", tags=["shows"])


@router.get("", response_model=list[ShowOut])
def list_shows(db: Session = Depends(get_db)):
    return (
        db.query(Show)
        .filter(Show.is_active == 1)
        .order_by(Show.date.asc())
        .all()
    )


def _show_payload(body: ShowCreate | ShowUpdate, *, partial: bool = False) -> dict:
    if partial:
        return body.model_dump(exclude_unset=True, exclude={"location"})
    return body.model_dump(exclude={"location"})


@router.post("", response_model=ShowOut)
def create_show(body: ShowCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    show = Show(**_show_payload(body))
    db.add(show)
    db.commit()
    db.refresh(show)
    return show


@router.put("/{show_id}", response_model=ShowOut)
def update_show(
    show_id: int,
    body: ShowUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    for key, value in _show_payload(body, partial=True).items():
        setattr(show, key, value)
    db.commit()
    db.refresh(show)
    return show


@router.delete("/{show_id}")
def delete_show(show_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    db.delete(show)
    db.commit()
    return {"ok": True}
