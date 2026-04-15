"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    // Carregar o avatar selecionado pelo builder
    const stored = localStorage.getItem("selectedAvatar");
    if (stored) setSelectedAvatarId(stored);
  }, []);

  const sendFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      if (isStreaming) requestRef.current = requestAnimationFrame(sendFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Reduzir qualidade a 50% para FPS fluído no deepfake
      const frameData = canvas.toDataURL('image/jpeg', 0.5);
      
      wsRef.current.send(JSON.stringify({ 
        frame: frameData,
        avatar_id: selectedAvatarId
      }));
    }

    // Limitar para não afogar a engine. FPS Base de gravação
    setTimeout(() => {
      if (isStreaming) requestRef.current = requestAnimationFrame(sendFrame);
    }, 1000 / 15); // ~15 FPS max para deepfakes mockados/pesados
  }, [isStreaming, selectedAvatarId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);

        // Inicia o server socket
        wsRef.current = new WebSocket('ws://localhost:8000/ws/stream');
        
        wsRef.current.onmessage = (event) => {
          // Frame modificado chega aqui
          setProcessedFrame(event.data);
        };
        
        wsRef.current.onopen = () => {
          // Começa a enviar
          requestRef.current = requestAnimationFrame(sendFrame);
        };
      }
    } catch (err) {
      console.error("Erro ao acessar webcam:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreaming(false);
      setProcessedFrame(null);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (wsRef.current) wsRef.current.close();
    }
  };

  // Limpeza
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-dark-900">
      {/* Botao voltar */}
      <div className="w-full max-w-5xl mb-4 flex justify-between">
        <Link href="/studio" className="text-slate-400 hover:text-white transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar ao Estúdio
        </Link>
        <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-white">Deepfake Stream</h1>
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Stream View */}
        <div className="flex-1">
          <div className="aspect-video bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden relative shadow-2xl flex items-center justify-center">
            {/* Escondemos a real câmera, mostramos apenas a renderizada */}
            <video ref={videoRef} playsInline muted className="hidden" />
            <canvas ref={canvasRef} className="hidden" />

            {isStreaming ? (
              processedFrame ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={processedFrame} className="w-full h-full object-cover scale-x-[-1]" alt="Deepfake" />
              ) : (
                <div className="animate-pulse text-primary flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                  Conectando Inteligência Artificial...
                </div>
              )
            ) : (
              <div className="text-slate-500 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Câmera desativada</p>
              </div>
            )}
            
            {/* Overlay indicators */}
            {isStreaming && processedFrame && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-green-400 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Deepfake Ativo
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Controle de Câmera</h3>
            {isStreaming ? (
              <button 
                onClick={stopCamera}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl font-medium transition-colors"
              >
                Parar Câmera
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="w-full py-3 bg-primary hover:bg-primary-light text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
              >
                Iniciar Câmera e Deepfake
              </button>
            )}
          </div>

          <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Avatar Selecionado</h3>
            <div className="flex items-center gap-4 p-3 bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
              {selectedAvatarId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedAvatarId} className="w-12 h-12 rounded-full object-cover border border-primary/50" alt="Selecionado" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center">
                    <span className="text-xs text-slate-500">N/A</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Avatar Customizado</p>
                <p className="text-xs text-slate-500">Pronto para uso</p>
              </div>
            </div>
            
            <Link href="/studio" className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-white transition-colors block text-center">
              Trocar Avatar
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
