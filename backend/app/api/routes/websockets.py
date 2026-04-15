from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional
from app.services.ai_pipeline import pipeline

router = APIRouter()

@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """Rota para Streaming Bi-direcional de WebCam para Deepfake via WebSocket."""
    await websocket.accept()
    
    current_avatar_id: Optional[str] = None
    
    try:
        while True:
            # Recebe pacote (JSON contendo frame base64 e dados)
            data = await websocket.receive_json()
            
            # Atualizar avatar se selecionado novo
            if "avatar_id" in data:
                current_avatar_id = data["avatar_id"]
                
            frame_data = data.get("frame")
            if frame_data:
                # Processa frame com o pipeline de Deepfake
                processed_frame = pipeline.process_frame(frame_data, current_avatar_id)
                # Responde com o frame substituido
                await websocket.send_text(processed_frame)
                
    except WebSocketDisconnect:
        print("Cliente de WebCam desconectou-se do stream.")
