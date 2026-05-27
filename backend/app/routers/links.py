from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import Link
from app.schemas import LinkOut, LinkUpdate, LinksBulkUpdate

router = APIRouter(prefix="/api/links", tags=["links"])


@router.get("", response_model=list[LinkOut])
def list_links(db: Session = Depends(get_db)):
    return db.query(Link).order_by(Link.sort_order.asc(), Link.id.asc()).all()


@router.put("/batch", response_model=list[LinkOut])
def update_links_batch(
    body: LinksBulkUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    updated: list[Link] = []
    for item in body.links:
        link = db.query(Link).filter(Link.id == item.id).first()
        if not link:
            raise HTTPException(status_code=404, detail=f"Link {item.id} not found")
        link.url = item.url
        updated.append(link)
    db.commit()
    for link in updated:
        db.refresh(link)
    return db.query(Link).order_by(Link.sort_order.asc(), Link.id.asc()).all()


@router.put("/{link_id}", response_model=LinkOut)
def update_link(
    link_id: int,
    body: LinkUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    link.url = body.url
    if body.icon is not None:
        link.icon = body.icon
    if body.sort_order is not None:
        link.sort_order = body.sort_order
    db.commit()
    db.refresh(link)
    return link
