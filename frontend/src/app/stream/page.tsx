"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function StreamPage() {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedAvatar");
    if (stored) setSelectedAvatarId(stored);
    
    return () => {
      stopStreaming();
    };
  }, []);

  const negotiateWebRTC = async (pc: RTCPeerConnection) => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    const response = await fetch(`http://localhost:8000/webrtc/offer?avatar_id=${selectedAvatarId || ''}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sdp: pc.localDescription?.sdp,
            type: pc.localDescription?.type,
        })
    });
    
    const answer = await response.json();
    await pc.setRemoteDescription(answer);
  };

  const startStreaming = async () => {
    setIsStreaming(true);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    // Quando recebemos a track modificada do Python, tocamos no vídeo central
    pc.addEventListener("track", (evt) => {
        if (remoteVideoRef.current && evt.track.kind === "video") {
            remoteVideoRef.current.srcObject = evt.streams[0];
        }
    });

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
        // Tocar video local com preview para referencia oculta, opcional
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        // Empurrar tracks locais para a conexão da IA
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Negociar e Iniciar
        await negotiateWebRTC(pc);

    } catch (err) {
        console.error("Erro na webcam:", err);
        setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
    }
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col p-6">
      <header className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            Real-Time Deepfake (WebRTC)
          </h1>
          <p className="text-gray-400 text-sm mt-1">Conexão Zero Latency H264 via RTCPeerConnection</p>
        </div>
        <div>
          {!isStreaming ? (
            <button
              onClick={startStreaming}
              className="px-6 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Iniciar Câmera e IA
            </button>
          ) : (
             <button
              onClick={stopStreaming}
              className="px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
            >
              Parar Conexão
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-white">Avatar Carregado</h2>
          <div className="flex-1 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-4 bg-gray-800/50">
            {selectedAvatarId ? (
              <img src={`http://localhost:8000${selectedAvatarId}`} alt="Avatar" className="w-[180px] h-[180px] object-cover rounded-full shadow-lg border-4 border-indigo-500/50 mb-4" />
            ) : (
                <div className="w-[180px] h-[180px] rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <span className="text-gray-500">Nenhum</span>
                </div>
            )}
            <p className="text-sm text-center text-gray-400">
              {selectedAvatarId ? "A IA trocará seu rosto por esse avatar em tempo real." : "Volte ao estúdio para gerar um rosto."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 bg-black rounded-2xl border border-gray-800 relative overflow-hidden flex items-center justify-center shadow-2xl">
           
          {isStreaming ? (
             <>
                <video 
                   ref={remoteVideoRef} 
                   autoPlay 
                   playsInline 
                   className="w-full h-full object-cover transform scale-x-[-1]" 
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-[300px] h-[400px] border-2 border-indigo-500/50 rounded-[100px] flex flex-col justify-between p-4 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                      <div className="text-center text-indigo-400 text-xs font-mono drop-shadow-md">ALINHE SEU ROSTO AQUI</div>
                      <div className="flex justify-between">
                         <div className="w-4 h-4 border-l-2 border-b-2 border-indigo-400"></div>
                         <div className="w-4 h-4 border-r-2 border-b-2 border-indigo-400"></div>
                      </div>
                   </div>
                </div>
             </>
          ) : (
             <div className="text-center">
                <div className="w-20 h-20 bg-gray-800/80 rounded-full mx-auto flex items-center justify-center mb-4 border border-gray-700">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-gray-500 font-medium">Câmera offline.</p>
                <p className="text-gray-600 text-sm mt-1">Conecte-se via WebRTC para visualização latência-zero</p>
             </div>
          )}

           {isStreaming && (
              <motion.div initial={{ opacity: 0}} animate={{opacity: 1}} className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-indigo-400/30">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Conexão H264 Otimizada (AI Pipeline Ativo)
              </motion.div>
           )}

           <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
        </div>

      </div>
    </div>
  );
}
