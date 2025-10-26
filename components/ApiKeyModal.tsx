import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md border border-slate-700 animate-slide-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-100 mb-3">Configurar Chave de API</h2>
        <p className="text-slate-400 mb-6">
          Para usar o AlphaBot, você precisa de uma chave de API do Google Gemini. Cole sua chave abaixo para começar a conversar.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                Sua Chave de API
              </label>
              <input
                id="apiKey"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Cole sua chave de API aqui"
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                required
              />
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 inline-block">
                Obter uma Chave de API no Google AI Studio &rarr;
            </a>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Salvar e Iniciar Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;