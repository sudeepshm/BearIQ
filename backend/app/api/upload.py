import hashlib
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import current_user
from app.db.database import get_db
from app.integrations.gemini import get_provider
from app.integrations.storage import store_archive
from app.services.validator import read_export, InvalidArchive
from app.services.pipeline import ingest
from app.schemas.upload import ImportResult

router = APIRouter()


@router.post("/upload", response_model=ImportResult)
def upload(
    file: UploadFile = File(...),
    user_id: str = Depends(current_user),
    db: Session = Depends(get_db),
    provider=Depends(get_provider),
):
    settings = get_settings()
    try:
        data = file.file.read(settings.max_upload_bytes + 1)
        payload = read_export(data, settings)
        result = ingest(payload, user_id, db, provider, settings)
        uri = store_archive(data, user_id, hashlib.sha256(data).hexdigest(), settings)
        return ImportResult(**result, archive_uri=uri)
    except InvalidArchive as exc:
        raise HTTPException(422, str(exc)) from exc
    finally:
        file.file.close()
