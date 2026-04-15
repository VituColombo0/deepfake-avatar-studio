import cv2
import numpy as np
import time
import os
import uuid
from typing import Dict, Any

USE_MOCK = True

try:
    if not USE_MOCK:
        import torch
        from diffusers import StableDiffusionPipeline
        import insightface
        print("Modelos de IA carregados com sucesso.")
    else:
        print("Modo de IA Mockado ativo (para desenvolvimento rápido).")
except ImportError:
    USE_MOCK = True
    print("Dependências de IA reais não encontradas.")

# Precisamos do aiortc e av para manipular WebRTC Video Tracks
from aiortc import VideoStreamTrack
import av

AVATAR_DIR = os.path.join(os.getcwd(), "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

class AIPipeline:
    def __init__(self):
        pass

    def characteristics_to_prompt(self, traits: Dict[str, Any]) -> str:
        prompt = "High quality photorealistic portrait photo of a "
        prompt += f"{traits.get('age', 'young')} "
        prompt += f"{traits.get('ethnicity', '')} "
        prompt += f"{traits.get('gender', 'person')}, "
        
        attributes = []
        if traits.get('hair_color'): attributes.append(f"{traits['hair_color']} hair")
        if traits.get('hair_style'): attributes.append(f"{traits['hair_style']}")
        if traits.get('eye_color'): attributes.append(f"{traits['eye_color']} eyes")
        if traits.get('jawline'): attributes.append(f"{traits['jawline']} jawline")
        
        if attributes:
            prompt += ", ".join(attributes) + ", "
            
        prompt += "facing camera, studio lighting, detailed face, 8k resolution, raw photo."
        return prompt

    def generate_face(self, traits: Dict[str, Any]) -> str:
        prompt = self.characteristics_to_prompt(traits)
        print(f"Gerando rosto: {prompt}")

        filename = f"{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(AVATAR_DIR, filename)

        if USE_MOCK:
            img = np.zeros((512, 512, 3), dtype=np.uint8)
            cv2.putText(img, "Avatar (Mock)", (50, 256), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(img, f"Gen: {traits.get('gender', 'N/A')}", (50, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 255), 1)
            cv2.imwrite(filepath, img)
            time.sleep(1.0)
        return f"/api/avatars/{filename}"

    def process_cv2_frame(self, frame: np.ndarray, target_avatar_id: str) -> np.ndarray:
        """Lógica real de deepfake por frame."""
        if USE_MOCK:
            # Mock de processamento em tempo real extremamente rápido
            # Faz um filtro overlay roxo e texto
            overlay = frame.copy()
            overlay[:] = (139, 92, 246) # Purple BGR
            cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)
            cv2.putText(frame, "[WEBRTC DEEPFAKE RUNNING]", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (139, 92, 246), 2)
            return frame
        else:
            # Executar in-swapper na GPU aqui e smooth temporal
            return frame

pipeline = AIPipeline()

class VideoTransformTrack(VideoStreamTrack):
    """
    Uma track de vídeo customizada que recebe os frames do client via WebRTC.
    Converte para OpenCV (ndarray), processa com IA e devolve o frame WebRTC comprimido em H264.
    """
    def __init__(self, track, avatar_id=None):
        super().__init__()
        self.track = track
        self.avatar_id = avatar_id

    async def recv(self):
        # Aguarda frame real que veio do browser do usuário
        frame = await self.track.recv()
        
        # Converte de PyAV Frame para array OpenCV
        img = frame.to_ndarray(format="bgr24")

        # Aplica a magia do Deepfake frame-a-frame
        processed_img = pipeline.process_cv2_frame(img, self.avatar_id)

        # Reconstroi o AVFrame a partir da imagem processada
        new_frame = av.VideoFrame.from_ndarray(processed_img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        
        return new_frame

