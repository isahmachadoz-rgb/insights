import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import FileUpload from './components/FileUpload';
import { SalesData, SalesMetrics } from './types';
import { processSalesData } from './hooks/useSalesData';
import { BotIcon } from './components/icons/BotIcon';
import { isApiKeySet } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<SalesData[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleFilesChange = (newFiles: SalesData[]) => {
    setUploadedFiles(newFiles);
  };

  const salesMetrics: SalesMetrics | null = useMemo(() => {
    if (uploadedFiles.length === 0) {
      return null;
    }
    const allSales = uploadedFiles.flatMap(file => file.data);
    return processSalesData(allSales);
  }, [uploadedFiles]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {!isApiKeySet && (
           <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Erro de Configuração:</strong>
            <span className="block sm:inline ml-2">A chave de API do Gemini não foi encontrada. O chatbot está desativado.</span>
            <p className="text-sm text-red-400 mt-1">Para corrigir, configure a variável de ambiente <code className="bg-slate-700 px-1 py-0.5 rounded text-red-300">API_KEY</code> no seu provedor de hospedagem (ex: Vercel).</p>
           </div>
        )}
        <FileUpload
          uploadedFiles={uploadedFiles}
          onFilesChange={handleFilesChange}
        />
        <Dashboard metrics={salesMetrics} hasFiles={uploadedFiles.length > 0} />
      </main>
      
      {isApiKeySet && !isChatOpen && (
         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-20">
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform duration-200"
            aria-label="Abrir AlphaBot"
          >
            <BotIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      {isApiKeySet && isChatOpen && (
        <Chatbot
          salesData={uploadedFiles}
          metrics={salesMetrics}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
