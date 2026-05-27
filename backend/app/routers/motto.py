from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import BandMotto
from app.schemas import MottoOut, MottoUpdate

router = APIRouter(prefix="/api/motto", tags=["motto"])


@router.get("", response_model=MottoOut)
def get_motto(db: Session = Depends(get_db)):
    motto = db.query(BandMotto).first()
    if not motto:
        return MottoOut(content="")
    return MottoOut(content=motto.content)


@router.put("", response_model=MottoOut)
def update_motto(
    body: MottoUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    motto = db.query(BandMotto).first()
    if not motto:
        motto = BandMotto(id=1, content=body.content)
        db.add(motto)
    else:
        motto.content = body.content
    db.commit()
    db.refresh(motto)
    return MottoOut(content=motto.content)
