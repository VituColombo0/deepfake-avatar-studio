"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function StudioPage() {
  const [traits, setTraits] = useState({
    gender: 'female',
    age: 'young',
    ethnicity: 'caucasian',
    hair_style: 'long curly',
    hair_color: 'blonde',
    eye_color: 'blue',
    jawline: 'sharp',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setTraits(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traits })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedImage(`http://localhost:8000${data.url}`);
        // Salvar esse id/url localmente no localStorage para o streamer usar
        localStorage.setItem("selectedAvatar", `http://localhost:8000${data.url}`);
      }
    } catch (err) {
      console.error("Falha ao gerar o rosto:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      {/* Sidebar - Controles */}
      <aside className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-white">
              Avatar Builder
            </h2>
            <p className="text-xs text-slate-400 mt-1">Crie características únicas</p>
          </div>
          <Link href="/" className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Gênero</label>
              <select className="w-full bg-dark-900 border border-dark-700 p-2 rounded-lg text-sm focus:border-primary outline-none" value={traits.gender} onChange={e => handleChange('gender', e.target.value)}>
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
                <option value="androgynous">Andrógino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Idade</label>
              <select className="w-full bg-dark-900 border border-dark-700 p-2 rounded-lg text-sm focus:border-primary outline-none" value={traits.age} onChange={e => handleChange('age', e.target.value)}>
                <option value="18 year old">18 anos</option>
                <option value="young">Jovem (~25 anos)</option>
                <option value="middle aged">Meia Idade (~40 anos)</option>
                <option value="elderly">Idoso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Cabelo (Estilo & Cor)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Estilo (ex: curly)" className="w-1/2 bg-dark-900 border border-dark-700 p-2 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" value={traits.hair_style} onChange={e => handleChange('hair_style', e.target.value)} />
                <input type="text" placeholder="Cor (ex: blonde)" className="w-1/2 bg-dark-900 border border-dark-700 p-2 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" value={traits.hair_color} onChange={e => handleChange('hair_color', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Cor dos Olhos</label>
              <select className="w-full bg-dark-900 border border-dark-700 p-2 rounded-lg text-sm focus:border-primary outline-none" value={traits.eye_color} onChange={e => handleChange('eye_color', e.target.value)}>
                <option value="blue">Azul</option>
                <option value="green">Verde</option>
                <option value="brown">Castanho</option>
                <option value="hazel">Mel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Formato da Mandíbula</label>
              <select className="w-full bg-dark-900 border border-dark-700 p-2 rounded-lg text-sm focus:border-primary outline-none" value={traits.jawline} onChange={e => handleChange('jawline', e.target.value)}>
                <option value="sharp">Marcada / Afiada</option>
                <option value="soft">Suave</option>
                <option value="square">Quadrada</option>
                <option value="round">Arredondada</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
          >
            {isGenerating ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Gerando IA...</>
            ) : "Gerar Rosto com IA"}
          </button>
        </div>
      </aside>

      {/* Main Area - Preview */}
      <main className="flex-1 bg-dark-900 relative flex items-center justify-center p-8">
        <div className="absolute inset-0 pattern-dots text-slate-800 opacity-20 pointer-events-none" />
        
        <div className="z-10 w-full max-w-md aspect-[3/4] bg-dark-800 rounded-3xl border border-dark-700 shadow-2xl flex flex-col items-center justify-center overflow-hidden relative transition-all group">
          {generatedImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={generatedImage} alt="Avatar Gerado" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="text-slate-500 flex flex-col items-center space-y-4">
              <svg className="w-16 h-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p>Nenhum rosto gerado ainda</p>
            </div>
          )}

          {generatedImage && (
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                <Link href="/stream" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform text-sm">
                  Testar Deepfake na Câmera
                </Link>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
