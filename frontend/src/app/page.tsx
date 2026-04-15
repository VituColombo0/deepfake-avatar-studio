import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[url('/bg-stars.svg')] bg-cover relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-primary">
          Deepfake Avatar Studio
        </h1>
        
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Crie rostos fotorrealistas personalizados do zero e utilize-os em tempo real como avatares digitais ultra-realistas.
        </p>

        <div className="flex items-center justify-center gap-6 pt-8">
          <Link 
            href="/studio" 
            className="px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] scale-100 hover:scale-105 active:scale-95"
          >
            Acessar o Estúdio
          </Link>
          <Link 
            href="/stream" 
            className="px-8 py-4 bg-dark-800 hover:bg-dark-700 text-white rounded-xl font-semibold transition-all border border-dark-700 hover:border-slate-500"
          >
            Testar Câmera
          </Link>
        </div>
      </div>
    </div>
  );
}
