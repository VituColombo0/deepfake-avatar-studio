from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import faces, webrtc

app = FastAPI(
    title="Deepfake Avatar API",
    description="Backend de inferência para geração de rostos e face swapping em tempo real.",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrando Lógica de Negócios (Rotas)
app.include_router(faces.router, prefix="/api")
app.include_router(webrtc.router, prefix="/webrtc")

@app.get("/")
def read_root():
    return {"message": "Welcome to Deepfake Avatar API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
