import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any

from app.services.ai_pipeline import pipeline, AVATAR_DIR

router = APIRouter()

class GenerationRequest(BaseModel):
    traits: Dict[str, Any]

@router.post("/generate")
async def generate_avatar(request: GenerationRequest):
    """Gera um rosto fotorealista baseado nos atributos físicos."""
    try:
        avatar_url = pipeline.generate_face(request.traits)
        return {
            "success": True, 
            "url": avatar_url,
            "message": "Avatar criado com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/avatars")
async def list_avatars():
    """Retorna a lista de avatares guardados."""
    try:
        if not os.path.exists(AVATAR_DIR):
            return {"avatars": []}
            
        files = os.listdir(AVATAR_DIR)
        valid_files = [f for f in files if f.endswith(('.png', '.jpg', '.jpeg'))]
        # Ordem descrescente de modificação (mais novos primeiro)
        valid_files.sort(key=lambda x: os.path.getmtime(os.path.join(AVATAR_DIR, x)), reverse=True)
        
        return {"success": True, "avatars": [f"/api/avatars/{f}" for f in valid_files]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/avatars/{filename}")
async def get_avatar(filename: str):
    """Serve as imagens geradas localmente."""
    file_path = os.path.join(AVATAR_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Avatar não encontrado")
    return FileResponse(file_path)
