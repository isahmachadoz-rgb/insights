import React, { useState, useMemo, useEffect } from 'react';
import { Chat } from '@google/genai';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import FileUpload from './components/FileUpload';
import ApiKeyModal from './components/ApiKeyModal';
import { SalesData, SalesMetrics } from './types';
import { processSalesData } from './hooks/useSalesData';
import { BotIcon } from './components/icons/BotIcon';
import { getApiKey, saveApiKey, createChatSession, isApiKeyAvailable } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<SalesData[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  const [apiKey, setApiKey] = useState<string | null>(getApiKey); 
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);

  useEffect(() => {
    if (apiKey) {
      const session = createChatSession(apiKey);
      setChatInstance(session);
    } else {
      setChatInstance(null);
    }
  }, [apiKey]);


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

  const handleOpenChat = () => {
    if (isApiKeyAvailable()) {
      setIsChatOpen(true);
    } else {
      setIsApiKeyModalOpen(true);
    }
  };

  const handleSaveApiKey = (newKey: string) => {
    saveApiKey(newKey);
    setApiKey(newKey);
    setIsApiKeyModalOpen(false);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <FileUpload
          uploadedFiles={uploadedFiles}
          onFilesChange={handleFilesChange}
        />
        <Dashboard metrics={salesMetrics} hasFiles={uploadedFiles.length > 0} />
      </main>
      
      {!isChatOpen && (
         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-20">
          <button
            onClick={handleOpenChat}
            className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform duration-200"
            aria-label="Abrir AlphaBot"
          >
            <BotIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      {isChatOpen && (
        <Chatbot
          chatInstance={chatInstance}
          salesData={uploadedFiles}
          metrics={salesMetrics}
          onClose={() => setIsChatOpen(false)}
        />
      )}
      
      {isApiKeyModalOpen && (
        <ApiKeyModal
          onSave={handleSaveApiKey}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;