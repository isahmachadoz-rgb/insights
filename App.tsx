import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import FileUpload from './components/FileUpload';
import { SalesData, SalesMetrics } from './types';
import { processSalesData } from './hooks/useSalesData';
import { BotIcon } from './components/icons/BotIcon';
import { isApiKeySet } from './services/geminiService';

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.026 2.252-1.026 2.888 0l6.238 10.028c.636 1.026-.178 2.373-1.444 2.373H3.463c-1.266 0-2.08-1.347-1.444-2.373L8.257 3.099zM9 13a1 1 0 112 0 1 1 0 01-2 0zm1-6a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


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
           <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg relative animate-slide-in" role="alert">
              <div className="flex items-start">
                  <div className="py-1">
                      <WarningIcon className="h-6 w-6 text-yellow-400 mr-4"/>
                  </div>
                  <div>
                      <strong className="font-bold block text-yellow-300">Ação Necessária: Configure a Chave de API</strong>
                      <span className="block mt-1">O recurso de chatbot (AlphaBot) está desativado porque a chave de API do Google Gemini não foi configurada.</span>
                      <p className="text-sm text-yellow-300 mt-2">
                          Para ativar o chatbot, você precisa adicionar sua chave de API como uma variável de ambiente chamada <code className="bg-slate-700 px-1.5 py-1 rounded text-yellow-200 font-mono">API_KEY</code> nas configurações do seu projeto de hospedagem.
                      </p>
                      <a href="https://vercel.com/docs/projects/environment-variables" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 mt-2 inline-block">
                          Aprenda como configurar no Vercel &rarr;
                      </a>
                  </div>
              </div>
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