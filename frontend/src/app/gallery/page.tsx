"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
    const [avatars, setAvatars] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/avatars");
                const data = await res.json();
                if (data.success) {
                    setAvatars(data.avatars);
                }
            } catch (err) {
                console.error("Erro ao puxar galeria:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAvatars();
    }, []);

    const handleSelectAvatar = (url: string) => {
        // Redefinir qual avatar queremos como deepfake
        localStorage.setItem("selectedAvatar", url);
        router.push("/stream");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-4">Galeria de Criações</h1>
                <p className="text-gray-400">Seus templates de rostos customizados gerados por Inteligência Artificial.</p>
            </header>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
            ) : avatars.length === 0 ? (
                <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-16">
                    <h2 className="text-xl text-gray-300 font-medium">Nenhum avatar encontrado.</h2>
                    <p className="text-gray-500 mt-2">Gere o primeiro lá no Estúdio!</p>
                    <button 
                        onClick={() => router.push("/studio")} 
                        className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg"
                    >
                        Ir para o Estúdio
                    </button>
                </div>
            ) : (
                <motion.div 
                    initial="hidden" 
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    {avatars.map((url, idx) => (
                        <motion.div 
                            key={idx} 
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl group cursor-pointer"
                        >
                            <div className="aspect-square relative overflow-hidden bg-gray-800">
                                <img 
                                    src={`http://localhost:8000${url}`} 
                                    alt={`Avatar ${idx}`} 
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" 
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                     <button 
                                        onClick={() => handleSelectAvatar(url)}
                                        className="bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-400"
                                     >
                                         Equipar para Câmera
                                     </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
