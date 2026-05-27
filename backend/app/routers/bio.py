from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import Bio
from app.schemas import BioOut, BioUpdate

router = APIRouter(prefix="/api/bio", tags=["bio"])


@router.get("", response_model=BioOut)
def get_bio(db: Session = Depends(get_db)):
    bio = db.query(Bio).first()
    if not bio:
        return BioOut(content="")
    return BioOut(content=bio.content)


@router.put("", response_model=BioOut)
def update_bio(body: BioUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    bio = db.query(Bio).first()
    if not bio:
        bio = Bio(id=1, content=body.content)
        db.add(bio)
    else:
        bio.content = body.content
    db.commit()
    db.refresh(bio)
    return BioOut(content=bio.content)
