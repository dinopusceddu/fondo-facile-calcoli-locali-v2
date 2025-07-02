// pages/ChecklistPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useAppContext } from '../contexts/AppContext.js';
import { Card } from '../components/shared/Card.js';
import { Button } from '../components/shared/Button.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';
import { FundData, CalculatedFund, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData, HistoricalData, AnnualData } from '../types.js';
import { TEXTS_UI } from '../constants.js';
import { fadFieldDefinitions, calculateFadTotals } from './FondoAccessorioDipendentePageHelpers.js';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string | React.ReactNode;
  timestamp: Date;
}

const formatCurrencyForContext = (value?: number, defaultValue = "non specificato"): string => {
  if (value === undefined || value === null || isNaN(value)) return defaultValue;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const generateContextFromState = (fundData: FundData, calculatedFund?: CalculatedFund): string => {
  let context = `CONTESTO DATI FONDO ATTUALMENTE INSERITI (Anno ${fundData.annualData.annoRiferimento}):\n`;
  context += `Ente: ${fundData.annualData.denominazioneEnte || 'Non specificato'}\n`;
  context += `Tipologia Ente: ${fundData.annualData.tipologiaEnte || 'Non specificato'}\n`;
  context += `Numero Abitanti: ${fundData.annualData.numeroAbitanti || 'Non specificato'}\n`;
  context += `Ente con Dirigenza: ${fundData.annualData.hasDirigenza ? 'Sì' : 'No'}\n\n`;

  const hd = fundData.historicalData;
  context += "DATI STORICI:\n";
  context += `- Fondo Salario Accessorio Personale (non Dir/EQ) 2016: ${formatCurrencyForContext(hd.fondoSalarioAccessorioPersonaleNonDirEQ2016)}\n`;
  context += `- Fondo Elevate Qualificazioni (EQ) 2016: ${formatCurrencyForContext(hd.fondoElevateQualificazioni2016)}\n`;
  context += `- Fondo Dirigenza 2016: ${formatCurrencyForContext(hd.fondoDirigenza2016)}\n`;
  context += `- Risorse Segretario Comunale 2016: ${formatCurrencyForContext(hd.risorseSegretarioComunale2016)}\n`;
  context += `- Limite Complessivo Originale 2016: ${formatCurrencyForContext((hd.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) + (hd.fondoElevateQualificazioni2016 || 0) + (hd.fondoDirigenza2016 || 0) + (hd.risorseSegretarioComunale2016 || 0))}\n`;
  context += `- Fondo Personale (non Dir/EQ) 2018 (per Art. 23c2): ${formatCurrencyForContext(hd.fondoPersonaleNonDirEQ2018_Art23)}\n`;
  context += `- Fondo EQ 2018 (per Art. 23c2): ${formatCurrencyForContext(hd.fondoEQ2018_Art23)}\n\n`;

  const fad = fundData.fondoAccessorioDipendenteData;
  if (fad) {
    context += "FONDO ACCESSORIO PERSONALE DIPENDENTE:\n";
    const fadTotals = calculateFadTotals(fad, fundData.annualData.simulatoreRisultati, !!fundData.annualData.isEnteDissestato, fundData.fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti);
    fadFieldDefinitions.forEach(def => {
      if (fad[def.key] !== undefined && fad[def.key] !== 0) {
         context += `  - ${def.description} (${def.riferimento}): ${formatCurrencyForContext(fad[def.key])}\n`;
      }
    });
    context += `  - Totale Risorse Disponibili (Fondo Personale Dipendente): ${formatCurrencyForContext(fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti)}\n\n`;
  }

  const feq = fundData.fondoElevateQualificazioniData;
  if (feq) {
    context += "FONDO ELEVATE QUALIFICAZIONI (EQ):\n";
    const sommaRisorseSpecificheEQ = (feq.ris_fondoPO2017 || 0) + (feq.ris_incrementoConRiduzioneFondoDipendenti || 0) + (feq.ris_incrementoLimiteArt23c2_DL34 || 0) + (feq.ris_incremento022MonteSalari2018 || 0) - (feq.fin_art23c2_adeguamentoTetto2016 || 0);
    if(feq.ris_fondoPO2017) context += `  - Fondo PO 2017: ${formatCurrencyForContext(feq.ris_fondoPO2017)}\n`;
    if(feq.ris_incrementoConRiduzioneFondoDipendenti) context += `  - Incremento con riduzione fondo dipendenti: ${formatCurrencyForContext(feq.ris_incrementoConRiduzioneFondoDipendenti)}\n`;
    // Aggiungere altre voci EQ se necessario
    context += `  - Totale Risorse Disponibili (Fondo EQ): ${formatCurrencyForContext(sommaRisorseSpecificheEQ)}\n\n`;
  }
  
  const fseg = fundData.fondoSegretarioComunaleData;
  if (fseg) {
    context += "RISORSE SEGRETARIO COMUNALE:\n";
    const sommaStabili = (fseg.st_art3c6_CCNL2011_retribuzionePosizione || 0) + (fseg.st_art58c1_CCNL2024_differenzialeAumento || 0) + (fseg.st_art60c1_CCNL2024_retribuzionePosizioneClassi || 0);
    const sommaVariabili = (fseg.va_art56c1f_CCNL2024_dirittiSegreteria || 0) + (fseg.va_art61c2_CCNL2024_retribuzioneRisultato10 || 0);
    const totLordo = sommaStabili + sommaVariabili;
    const percCopertura = fseg.fin_percentualeCoperturaPostoSegretario === undefined ? 100 : fseg.fin_percentualeCoperturaPostoSegretario;
    const totEffettivo = totLordo * (percCopertura/100);

    if(fseg.st_art60c1_CCNL2024_retribuzionePosizioneClassi) context += `  - Retribuzione Posizione (Classi CCNL 2024): ${formatCurrencyForContext(fseg.st_art60c1_CCNL2024_retribuzionePosizioneClassi)}\n`;
    // Aggiungere altre voci Segretario se necessario
    context += `  - Totale Risorse Effettivamente Disponibili (Segretario): ${formatCurrencyForContext(totEffettivo)}\n\n`;

  }

  if (fundData.annualData.hasDirigenza && fundData.fondoDirigenzaData) {
    const fdir = fundData.fondoDirigenzaData;
    context += "FONDO DIRIGENZA:\n";
    const sommaStabiliDir = (fdir.st_art57c2a_CCNL2020_unicoImporto2020 || 0) + (fdir.st_art56c1_CCNL2020_incremento1_53MonteSalari2015 || 0);
    const sommaVariabiliDir = (fdir.va_art57c2b_CCNL2020_risorseLeggeSponsor || 0) + (fdir.va_art33c2_DL34_2019_incrementoDeroga || 0);
    const totDir = sommaStabiliDir + sommaVariabiliDir + (fdir.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 || 0) - (fdir.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0);
    if(fdir.st_art57c2a_CCNL2020_unicoImporto2020) context += `  - Unico Importo 2020 (CCNL 2020 Art.57c2a): ${formatCurrencyForContext(fdir.st_art57c2a_CCNL2020_unicoImporto2020)}\n`;
    // Aggiungere altre voci Dirigenza se necessario
    context += `  - Totale Risorse Effettivamente Disponibili (Dirigenza): ${formatCurrencyForContext(totDir)}\n\n`;
  }


  if (calculatedFund) {
    context += "CALCOLO GLOBALE FONDO (SINTESI):\n";
    context += `- Totale Fondo Risorse Decentrate: ${formatCurrencyForContext(calculatedFund.totaleFondoRisorseDecentrate)}\n`;
    context += `- Limite Art. 23 c.2 Modificato (se applicabile): ${formatCurrencyForContext(calculatedFund.limiteArt23C2Modificato)}\n`;
    context += `- Ammontare Soggetto al Limite (Globale): ${formatCurrencyForContext(calculatedFund.ammontareSoggettoLimite2016)}\n`;
    context += `- Superamento Limite 2016 (Globale): ${calculatedFund.superamentoLimite2016 ? formatCurrencyForContext(calculatedFund.superamentoLimite2016) : 'Nessuno'}\n`;
    context += `- Somma Risorse Soggette al Limite dai Fondi Specifici: ${formatCurrencyForContext(calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici)}\n\n`;
  }

  context += "FINE CONTESTO DATI.\n";
  return context;
};

export const ChecklistPage: React.FC = () => {
  const { state } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const context = generateContextFromState(state.fundData, state.calculatedFund);
      const prompt = `Sei un assistente esperto specializzato nel Fondo delle Risorse Decentrate per gli Enti Locali italiani.
Il tuo compito è rispondere alle domande dell'utente basandoti ESCLUSIVAMENTE sui dati forniti nel seguente contesto.
Rispondi in italiano, in modo chiaro e conciso. Se l'informazione richiesta non è presente nei dati, indicalo esplicitamente.
Non fare riferimento a conoscenze esterne o normative non menzionate nei dati. Non inventare informazioni.

${context}

Domanda dell'utente: "${userMessage.text}"

Risposta dell'assistente:`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          // temperature: 0.7, // Puoi sperimentare con la temperatura
          thinkingConfig: { thinkingBudget: 0 } 
        }
      });
      
      const botText = response.text;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText || "Non ho ricevuto una risposta valida.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (e) {
      console.error("Errore chiamata Gemini API:", e);
      const errorMessage = e instanceof Error ? e.message : "Errore sconosciuto durante la comunicazione con l'assistente.";
      setError(`Si è verificato un errore: ${errorMessage}`);
      const botErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Mi dispiace, non sono riuscito a elaborare la tua richiesta in questo momento.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Check list Interattiva del Fondo</h2>
      
      <Card title="Chat con Assistente Virtuale" className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#fcf8f8]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-xl shadow ${
                msg.sender === 'user' 
                ? 'bg-[#ea2832] text-white' 
                : 'bg-white text-[#1b0e0e] border border-[#f3e7e8]'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-gray-200' : 'text-[#5f5252]'} text-opacity-80`}>
                  {msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg shadow bg-white text-[#1b0e0e] border border-[#f3e7e8]">
                <LoadingSpinner size="sm" text="L'assistente sta pensando..." textColor="text-[#5f5252]" />
              </div>
            </div>
          )}
          {error && (
             <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg shadow bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]">
                <p className="text-sm font-semibold">Errore:</p>
                <p className="text-sm whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-[#f3e7e8] bg-white">
          <div className="flex items-center space-x-3">
            <textarea
              rows={2}
              className="form-textarea flex-grow resize-none rounded-lg text-[#1b0e0e] border-none bg-[#f3e7e8] placeholder:text-[#994d51] p-3 focus:ring-2 focus:ring-[#ea2832]/50 focus:outline-none"
              placeholder="Scrivi la tua domanda qui..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} variant="primary" size="md">
              {isLoading ? TEXTS_UI.calculating.substring(0, TEXTS_UI.calculating.length-3) + "..." : "Invia"} {/* Shortened loading text */}
            </Button>
          </div>
        </div>
      </Card>
      <Card title="Suggerimenti per le domande" className="mt-4" isCollapsible defaultCollapsed={true}>
        <ul className="list-disc list-inside text-sm text-[#5f5252] space-y-1 p-2">
            <li>"Qual è il totale del fondo per il personale dipendente?"</li>
            <li>"L'incremento stabile per consistenza personale è stato inserito?"</li>
            <li>"Quanto è stato stanziato per 'Recupero evasione ICI'?"</li>
            <li>"Il fondo supera il limite del 2016?"</li>
            <li>"Quali sono le risorse variabili non soggette al limite per i dipendenti?"</li>
            <li>"A quanto ammonta il 'Fondo PO 2017' per le EQ?"</li>
            <li>"È stato inserito l'incremento PNRR per il Segretario Comunale?"</li>
            <li>"Fornisci un riepilogo delle risorse stabili per la dirigenza."</li>
        </ul>
        <p className="text-xs text-[#5f5252] mt-2 p-2">
            L'assistente risponderà basandosi <strong className="text-[#1b0e0e]">esclusivamente</strong> sui dati che hai inserito nelle altre sezioni dell'applicazione.
            Se un dato non è stato inserito, l'assistente non potrà fornire un valore.
        </p>
      </Card>
    </div>
  );
};
