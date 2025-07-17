// pages/DistribuzioneRisorsePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI } from '../constants.js';
import { calculateFadTotals } from './FondoAccessorioDipendentePageHelpers.js';

const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return defaultText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const DistribuzioneRisorsePage: React.FC = () => {
  const { state } = useAppContext();
  const { fundData } = state;

  const {
    fondoAccessorioDipendenteData,
    annualData,
    fondoElevateQualificazioniData,
  } = fundData;

  const {
    simulatoreRisultati,
    isEnteDissestato,
    isEnteStrutturalmenteDeficitario,
    isEnteRiequilibrioFinanziario,
  } = annualData;
  
  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;
  const incrementoEQconRiduzioneDipendenti = fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti;

  const fadTotals = calculateFadTotals(
    fondoAccessorioDipendenteData || {},
    simulatoreRisultati,
    isEnteInCondizioniSpeciali,
    incrementoEQconRiduzioneDipendenti
  );

  const risorseDisponibili = fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti;

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Distribuzione delle Risorse</h2>
      <p className="text-lg text-[#5f5252]">
        Questa sezione mostra le risorse disponibili per la distribuzione tra il personale, calcolate sulla base dei dati inseriti.
      </p>

      <Card title="Riepilogo Risorse Disponibili" className="mt-8 bg-[#f3e7e8] border-[#d1c0c1]">
        <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2">
              Risorse disponibili per la distribuzione
            </h3>
            <p className="text-4xl font-bold text-[#ea2832] my-4">
              {formatCurrency(risorseDisponibili)}
            </p>
            <p className="text-sm text-[#5f5252]">
              Questo valore corrisponde al "TOTALE RISORSE EFFETTIVAMENTE DISPONIBILI" calcolato nella pagina "Fondo accessorio personale dipendente".
            </p>
        </div>
      </Card>
      
      <Card title="Prossimi Passi (Logica di Distribuzione - Da Implementare)">
        <p className="text-[#5f5252]">
          In questa sezione sarà possibile definire i criteri e le modalità di distribuzione delle risorse disponibili, ad esempio:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-[#1b0e0e]">
          <li>Ripartizione tra Indennità di Funzione, di Specifiche Responsabilità, di Condizione di Lavoro, etc.</li>
          <li>Calcolo per performance individuale e collettiva.</li>
          <li>Gestione delle progressioni economiche orizzontali (PEO).</li>
          <li>Allocazione delle risorse per progetti speciali o obiettivi strategici.</li>
        </ul>
      </Card>
    </div>
  );
};
