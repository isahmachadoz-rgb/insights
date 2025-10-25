import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SalesData } from '../types';
import { parseCSVToSales } from '../hooks/useSalesData';
import { InfoIcon } from './icons/InfoIcon';

interface FileUploadProps {
  onFilesChange: (files: SalesData[]) => void;
  uploadedFiles: SalesData[];
}

const MAX_FILES = 12;

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
);

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, uploadedFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > MAX_FILES) {
      setError(`Você pode selecionar no máximo ${MAX_FILES} planilhas por vez.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    setIsParsing(true);
    setError(null);

    // FIX: Add explicit type annotation for 'file' to prevent type inference issues.
    const promises = Array.from(files).map((file: File) => {
      return new Promise<SalesData>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const salesData = parseCSVToSales(text);
            if (salesData.length === 0 && text.trim().split('\n').length > 1) {
              console.warn(`Nenhum dado de venda válido processado de ${file.name}. Verifique o formato das linhas de dados.`);
            }
            resolve({ fileName: file.name, data: salesData });
          } catch (err) {
            console.error(`Falha ao processar o arquivo ${file.name}`, err);
            if (err instanceof Error) {
              reject(new Error(`Erro em "${file.name}": ${err.message}`));
            } else {
              reject(new Error(`Falha ao processar ${file.name}: Erro desconhecido.`));
            }
          }
        };
        reader.onerror = (err) => {
          console.error(`Falha ao ler o arquivo ${file.name}`, err);
          reject(new Error(`Falha ao ler ${file.name}`));
        };
        reader.readAsText(file);
      });
    });

    try {
      const newFilesData = await Promise.all(promises);
      onFilesChange(newFilesData);
    } catch (err) {
      console.error("Error parsing files:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido ao processar os arquivos.");
      }
    } finally {
        setIsParsing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleClearFiles = () => {
    onFilesChange([]);
    setError(null);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
            <UploadIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
            <h2 className="text-xl font-bold text-slate-100">Carregar Planilhas</h2>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleButtonClick}
              disabled={isParsing}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isParsing ? 'Processando...' : 'Adicionar Arquivos'}
            </button>
            {uploadedFiles.length > 0 && (
                <button
                    onClick={handleClearFiles}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold p-2 rounded-md transition-colors"
                    aria-label="Limpar arquivos"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
      
      {uploadedFiles.length === 0 && !isParsing && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4 flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
                <h3 className="font-semibold text-slate-200">Bem-vindo ao painel de análise!</h3>
                <p className="text-sm text-slate-400">
                    Para começar, carregue até {MAX_FILES} planilhas de vendas no formato CSV.
                </p>
            </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".csv,text/csv"
        className="hidden"
      />

      {uploadedFiles.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h3 className="text-md font-semibold text-slate-300 mb-2">Arquivos Carregados:</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="bg-slate-700 p-2 rounded-md flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-200 truncate" title={file.fileName}>{file.fileName}</span>
                </div>
                <span className="text-slate-400 text-xs flex-shrink-0 ml-2">{file.data.length} registros</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;