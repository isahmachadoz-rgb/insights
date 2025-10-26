import { GoogleGenAI, Chat } from "@google/genai";
import { SalesData, SalesMetrics } from '../types';

const API_KEY_STORAGE_KEY = 'gemini-api-key';
const HARDCODED_API_KEY = 'AIzaSyBdNHXzqdosWszfoj2DPJXDVCnZsoMndVU';

// --- API Key Management ---
export const saveApiKey = (apiKey: string): void => {
  // A chave agora está integrada, então não é mais necessário salvá-la.
  // Esta função é mantida para evitar erros em componentes que a chamam.
};

export const getApiKey = (): string | null => {
  // Retorna diretamente a chave de API fornecida.
  return HARDCODED_API_KEY;
};

export const isApiKeyAvailable = (): boolean => {
  return !!getApiKey();
};


// --- Chat Session Management ---
export const createChatSession = (apiKey: string): Chat | null => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Você é o AlphaBot, um assistente de análise de dados amigável e perspicaz. Sua missão é ajudar os usuários a entenderem suas planilhas de vendas de uma forma natural e conversacional.

Sua Personalidade:
- Prestativo e Proativo: Antecipe as necessidades do usuário. Se eles perguntarem o total de vendas, você pode, por exemplo, mencionar qual foi o mês de maior destaque.
- Linguagem Natural: Comunique-se como um colega de equipe experiente, não como um robô. Use frases de transição e explique suas descobertas de forma clara.
- Confiável: Baseie 100% de suas respostas nos dados fornecidos. Se a informação não estiver lá, diga que não conseguiu encontrar.
- Claro e Conciso: Embora conversacional, evite respostas excessivamente longas. Vá direto ao ponto, mas com um toque humano.

Como você deve responder:
- Comece as respostas de forma natural. Em vez de apenas "R$ 1.234.567,89", tente "O total de vendas analisado foi de R$ 1.234.567,89."
- Explique o "porquê" por trás dos números de forma simples. Por exemplo: "O produto mais vendido foi o 'Laptop Pro X'. Ele se destacou principalmente pelas vendas em novembro e dezembro."
- Ao receber uma pergunta, responda-a completamente e, se fizer sentido, ofereça um insight relacionado.

IMPORTANTE: Responda sempre em texto puro, sem usar markdown, negrito, itálico ou qualquer outro tipo de formatação.

Seu objetivo é transformar dados brutos em conversas e insights valiosos, tornando a análise de dados uma tarefa fácil e agradável.
`,
      },
    });
    return chat;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI. Please check your API key.", error);
    return null;
  }
};


function summarizeData(salesData: SalesData[], metrics: SalesMetrics | null): string {
  if (salesData.length === 0 || !metrics) {
    return "Contexto: Nenhuma planilha foi carregada. Informe ao usuário que ele precisa carregar arquivos para você começar a análise.";
  }

  const fileNames = salesData.map(sd => sd.fileName).join(', ');
  const totalEntries = salesData.reduce((acc, curr) => acc + curr.data.length, 0);

  const dataContextForAI = `
- DADOS BRUTOS AGREGADOS PARA SUA ANÁLISE:
  - Vendas Totais (Receita): ${metrics.totalSales}
  - Ticket Médio por Transação: ${metrics.averageTicket}
  - Receita de Vendas por Mês: ${JSON.stringify(metrics.salesByMonth)}
  - Unidades Vendidas por Produto: ${JSON.stringify(metrics.salesByProduct)}
  - Receita de Vendas por Categoria: ${JSON.stringify(metrics.salesByCategory)}
  - Receita de Vendas por Região: ${JSON.stringify(metrics.salesByRegion)}
`.trim();

  return `
Contexto para sua análise:
O usuário carregou os arquivos ${fileNames}, totalizando ${totalEntries} registros de vendas.
Sua tarefa é analisar esses dados para responder às perguntas. Você NÃO está lendo um dashboard. As informações abaixo são um resumo dos dados brutos agregados que você deve usar como base para seus cálculos e conclusões.

${dataContextForAI}
`.trim();
}


export const getChatbotResponse = async (chat: Chat | null, message: string, salesData: SalesData[], metrics: SalesMetrics | null): Promise<string> => {
    if (!chat) {
        return "A sessão do chatbot não foi iniciada. Verifique se a chave de API está configurada corretamente.";
    }
  try {
    const dataContext = summarizeData(salesData, metrics);
    const fullPrompt = `${dataContext}\n\nUsuário: ${message}`;
    
    const response = await chat.sendMessage({ message: fullPrompt });
    return response.text ?? "Desculpe, não consegui processar a resposta. Tente novamente.";
  } catch (error) {
    console.error("Error fetching response from Gemini:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "Sua chave de API parece ser inválida. Por favor, verifique e tente novamente.";
    }
    return "Desculpe, ocorreu um erro ao me comunicar com a IA. Verifique sua chave de API e a conexão com a internet.";
  }
};