import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, SalesData, SalesMetrics } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { BotIcon } from './icons/BotIcon';

interface ChatbotProps {
    chatInstance: Chat | null;
    salesData: SalesData[];
    metrics: SalesMetrics | null;
    onClose: () => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Chatbot: React.FC<ChatbotProps> = ({ chatInstance, salesData, metrics, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Olá! Sou o AlphaBot. Como posso ajudar a analisar seus dados de vendas hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Qual foi o faturamento total?',
    'Qual produto foi o mais vendido?',
    'Qual o mês de maior destaque?',
    'Compare as vendas entre as regiões.',
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const submitMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
        const botResponseText = await getChatbotResponse(chatInstance, messageText, salesData, metrics);
        const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        const errorMessage: ChatMessage = { sender: 'bot', text: 'Desculpe, ocorreu um erro. Tente novamente.' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMessage(input);
    setInput('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await submitMessage(suggestion);
  };

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 z-30 w-full md:max-w-md bg-slate-800 rounded-none md:rounded-lg shadow-2xl flex flex-col h-full md:h-[70vh] md:max-h-[600px] border border-slate-700 transition-all duration-300 ease-out transform origin-bottom-right animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center">
          <BotIcon className="w-8 h-8 text-cyan-400 mr-3"/>
          <h2 className="text-xl font-bold text-slate-100">AlphaBot Analista</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="Fechar chat">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-cyan-400"/></div>}
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
            </div>
          </div>
        ))}

        {messages.length === 1 && !isLoading && (
          <div className="flex flex-col items-start gap-2 pt-2 animate-slide-in">
             <p className="text-sm text-slate-400 mb-1 px-2">Sugestões:</p>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(q)}
                className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm py-2 px-3 rounded-lg transition-colors text-left disabled:opacity-50"
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-cyan-400"/></div>
             <div className="bg-slate-700 p-3 rounded-lg rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></span>
                </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-700 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre as vendas..."
          className="flex-1 bg-slate-700 border border-slate-600 rounded-l-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          disabled={isLoading}
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-r-md disabled:bg-slate-600" disabled={isLoading}>
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;