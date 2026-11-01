# Deepfake Avatar Studio: Real-Time Face Synthesis & Streaming Pipeline

Plataforma full-stack para geração, customização e substituição facial em tempo real (Face Swapping) sobre streaming de vídeo de baixa latência, combinando interface moderna em Next.js com backend de inferência acelerado em FastAPI, PyTorch e WebRTC.

[![Frontend: Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014%20(React)-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![ML: PyTorch & Diffusers](https://img.shields.io/badge/Inference-PyTorch%20%2B%20Diffusers-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Streaming: WebRTC (aiortc)](https://img.shields.io/badge/Streaming-WebRTC%20aiortc-blue.svg)](https://github.com/aiortc/aiortc)
[![Vision: OpenCV](https://img.shields.io/badge/Vision-OpenCV%20Python-5C3EE8.svg?logo=opencv&logoColor=white)](https://opencv.org/)

---

## Arquitetura do Sistema

O sistema é dividido em duas camadas de alta performance:

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│     Frontend (Next.js 14)       │                 │       Backend (FastAPI)         │
│                                 │                 │                                 │
│  - Face Builder Dashboard       │ ──REST (Axios)─▶│  /api/faces                     │
│  - Parâmetros e Prompts         │                 │    Geração e embedding facial   │
│  - Renderização de Webcam       │                 │                                 │
│  - Negociação SDP / ICE         │ ──WebRTC Sig───▶│  /webrtc                        │
│                                 │                 │    aiortc MediaStreamTrack      │
│                                 │                 │                                 │
│  [ Video Player Canvas ]        │ ◀───RTP Stream──│  [ Pipeline de Face Swap ]      │
│    Playback em tempo real       │                 │    PyTorch / OpenCV / Diffusers │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

### Componentes Principais

1. **Construtor de Avatares (Face Studio):** Interface interativa em Next.js com Tailwind CSS e Framer Motion para ajuste paramétrico de atributos faciais, geração generativa e seleção de alvos de substituição.
2. **Motor de Inferência (FastAPI & PyTorch):** Pipeline modular otimizado para carregamento de modelos em memória GPU/VRAM via HuggingFace `diffusers`, `transformers` e `accelerate`.
3. **Servidor WebRTC de Baixa Latência (`aiortc`):** Processamento frame a frame sobre o fluxo de vídeo da webcam do cliente, aplicando o alinhamento de pontos de referência faciais (*landmarks*) e retornando o fluxo modificado via protocolo RTP sem atraso perceptível de buffer.

---

## Estrutura do Repositório

```text
deepfake-avatar-studio/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── faces.py          # Endpoints de cadastro, upload e geração
│   │   │       └── webrtc.py         # Negociação de sessões WebRTC (SDP Offer/Answer)
│   │   ├── services/                 # Modelos neurais, alinhamento facial e swap
│   │   └── main.py                   # Configuração do FastAPI e middlewares CORS
│   └── requirements.txt              # Dependências Python (Torch, Diffusers, aiortc, OpenCV)
├── frontend/
│   ├── src/                          # Páginas, componentes React e clientes WebRTC
│   ├── package.json                  # Dependências do Next.js, React e Tailwind
│   ├── tailwind.config.js            # Configuração de estilos e temas
│   └── tsconfig.json                 # Configuração do compilador TypeScript
└── README.md                         # Documentação técnica do projeto
```

---

## Instalação e Execução

### 1. Configuração do Backend (FastAPI + PyTorch)

#### Pré-requisitos
- Python 3.10 ou superior
- Recomendado: Placa de vídeo NVIDIA com suporte a CUDA 11.8 / 12.1 (executável também em CPU para depuração)

```bash
cd backend

# Criação e ativação do ambiente virtual
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalação dos pacotes
pip install --upgrade pip
pip install -r requirements.txt

# Inicialização do servidor de inferência
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
A documentação interativa Swagger estará acessível em `http://localhost:8000/docs`.

---

### 2. Configuração do Frontend (Next.js 14)

#### Pré-requisitos
- Node.js 18.17+ ou 20+
- npm ou yarn

```bash
cd frontend

# Instalação das dependências
npm install

# Inicialização do servidor de desenvolvimento
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:3000`.

---

## Fluxo de Operação em Tempo Real

1. **Seleção/Geração do Avatar:** No painel do Next.js, escolha um modelo de avatar pré-gerado ou envie uma imagem base de referência.
2. **Conexão da Câmera:** Conceda permissão de acesso à webcam no navegador.
3. **Handshake WebRTC:** O frontend captura o fluxo local (`getUserMedia`), gera uma oferta SDP (*SDP Offer*) e a envia ao endpoint `/webrtc/offer`.
4. **Processamento no Servidor:** O backend decodifica o stream H.264/VP8 via `aiortc`, extrai as matrizes faciais em tempo real com OpenCV, executa a transposição dos traços sintetizados e devolve a resposta SDP (*SDP Answer*).
5. **Streaming Bidirecional:** O vídeo com a face substituída é renderizado no elemento `<video>` da interface com taxa de quadros contínua.

---

## Termo de Ética e Uso Responsável

Este software foi concebido estritamente para propósitos de pesquisa acadêmica em computação visual, produção cinematográfica/teatral autorizada, efeitos visuais (VFX) e desenvolvimento de interfaces homem-máquina. É estritamente proibida a utilização desta ferramenta para criação de conteúdos enganosos, difamatórios, sem consentimento de imagem ou com finalidades de personificação fraudulenta (*identity impersonation*).
