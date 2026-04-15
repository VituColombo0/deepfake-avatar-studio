import cv2
import numpy as np
import base64
import time
import uuid
import os
from typing import Dict, Any

# ==========================================
# IMPORTAÇÃO DOS MODELOS (Com Fallback Seguro para DEV)
# ==========================================
USE_MOCK = True

try:
    if not USE_MOCK:
        import torch
        from diffusers import StableDiffusionPipeline
        import insightface
        # Inicialização do pipeline real aqui
        print("Modelos de IA carregados com sucesso.")
    else:
        print("Modo de IA Mockado ativo (para desenvolvimento rápido).")
except ImportError:
    USE_MOCK = True
    print("Dependências de IA reais não encontradas, ativando mock.")

# Pasta onde os rostos serão temporários
AVATAR_DIR = os.path.join(os.getcwd(), "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

class AIPipeline:
    def __init__(self):
        # Aqui seriam instanciados:
        # self.sd_pipeline = StableDiffusionPipeline.from_pretrained(...)
        # self.face_swapper = insightface.model_zoo.get_model('inswapper_128.onnx', ...)
        pass

    def characteristics_to_prompt(self, traits: Dict[str, Any]) -> str:
        """Converte dicionário estruturado para prompt de geração."""
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
        """Gera imagem e retorna URL ou base64 simulado"""
        prompt = self.characteristics_to_prompt(traits)
        print(f"Gerando rosto com prompt: {prompt}")

        filename = f"{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(AVATAR_DIR, filename)

        if not USE_MOCK:
            # Geração real com diffusers
            # image = self.sd_pipeline(prompt).images[0]
            # image.save(filepath)
            pass
        else:
            # Simulação: Criar imagem placeholder
            img = np.zeros((512, 512, 3), dtype=np.uint8)
            cv2.putText(img, "Avatar Gerado (Mock)", (50, 256), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(img, f"Gender: {traits.get('gender', 'N/A')}", (50, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 255), 1)
            cv2.putText(img, f"Age: {traits.get('age', 'N/A')}", (50, 330), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 255), 1)
            cv2.imwrite(filepath, img)
            
            time.sleep(1.5) # Simula delay da IA (SDXL de 1-2s)

        # Retorna avatar mockado/gerado via URL relativa
        return f"/api/avatars/{filename}"

    def process_frame(self, frame_data: str, target_avatar_id: str) -> str:
        """Aplica rosto base na imagem da câmera em tempo real."""
        # Remover 'data:image/jpeg;base64,' do inicio
        if "," in frame_data:
            frame_data = frame_data.split(",")[1]
            
        img_bytes = base64.b64decode(frame_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if not USE_MOCK:
            # Pegar source face baseado no id e aplicar Insightface
            # frame = self.face_swapper.get(frame, source_face)
            pass
        else:
            # Mock de processamento
            # Fazer um filtro overlay roxo para indicar deepfake ativado no mock
            overlay = frame.copy()
            overlay[:] = (139, 92, 246) # Purple BGR
            cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)
            cv2.putText(frame, "[DEEPFAKE ACTIVE]", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (139, 92, 246), 2)
            
        _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/jpeg;base64,{encoded_image}"

# Instância Singletom para ser usada a cada request
pipeline = AIPipeline()
