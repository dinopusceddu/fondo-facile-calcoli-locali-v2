
// pages/HomePage.tsx
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { DashboardSummary } from '../components/dashboard/DashboardSummary.js';
import { ComplianceStatusWidget } from '../components/dashboard/ComplianceStatusWidget.js';
import { Button } from '../components/shared/Button.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI, INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA, INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA, INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA, INITIAL_FONDO_DIRIGENZA_DATA } from '../constants.js';
import { FundData, CalculatedFund, ComplianceCheck, TipologiaEnte, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData } from '../types.js';

interface WizardStepDefinition {
  title: string;
  description: string;
  targetTabId?: string;
  staticStatus?: 'implemented' | 'partially-implemented' | 'not-implemented'; // For steps where status is not data-driven
  statusCheck?: (fundData: FundData, calculatedFund?: CalculatedFund, complianceChecks?: ComplianceCheck[]) => WizardStep['status'];
  statusMessage?: string;
}

interface WizardStep {
  title: string;
  description: string;
  targetTabId?: string;
  status: 'implemented' | 'partially-implemented' | 'not-implemented';
  statusMessage?: string;
}

const initialWizardSteps: WizardStepDefinition[] = [
  {
    title: "Configurazione Iniziale",
    description: 'Vai a "Dati Costituzione Fondo" per inserire le informazioni generali del tuo ente e l\'anno di riferimento.',
    targetTabId: 'dataEntry',
    statusCheck: (fundData) => (fundData.annualData.denominazioneEnte && fundData.annualData.annoRiferimento) ? 'implemented' : 'not-implemented',
  },
  {
    title: "Dati Storici",
    description: "Inserisci i valori dei fondi storici (es. 2016) necessari per il calcolo del limite Art. 23 c.2 D.Lgs. 75/2017.",
    targetTabId: 'dataEntry',
    statusCheck: (fundData) => (
        fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 !== undefined ||
        fundData.historicalData.fondoElevateQualificazioni2016 !== undefined ||
        fundData.historicalData.fondoDirigenza2016 !== undefined ||
        fundData.historicalData.risorseSegretarioComunale2016 !== undefined
    ) ? 'implemented' : 'not-implemented',
  },
  {
    title: "Dati per Art. 23 c.2",
    description: "Dettaglia i fondi 2018 e il personale per l'adeguamento del limite, se il tuo ente è Comune o Provincia.",
    targetTabId: 'dataEntry',
    statusCheck: (fundData) => {
        const { tipologiaEnte } = fundData.annualData;
        if (tipologiaEnte === TipologiaEnte.COMUNE || tipologiaEnte === TipologiaEnte.PROVINCIA) {
            return (
                fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23 !== undefined ||
                fundData.historicalData.fondoEQ2018_Art23 !== undefined ||
                (fundData.annualData.personale2018PerArt23 && fundData.annualData.personale2018PerArt23.length > 0) ||
                (fundData.annualData.personaleAnnoRifPerArt23 && fundData.annualData.personaleAnnoRifPerArt23.length > 0)
            ) ? 'implemented' : 'not-implemented';
        }
        return 'implemented'; // Consider implemented if not applicable
    }
  },
  {
    title: "Dati Annuali (PNRR3 & Virtuosità)",
    description: "Compila i dati per il calcolo dell'incremento PNRR3 e le condizioni di virtuosità finanziaria.",
    targetTabId: 'dataEntry',
    statusCheck: (fundData) => (
        fundData.annualData.rispettoEquilibrioBilancioPrecedente !== undefined ||
        fundData.annualData.rispettoDebitoCommercialePrecedente !== undefined ||
        fundData.annualData.approvazioneRendicontoPrecedente !== undefined ||
        fundData.annualData.incidenzaSalarioAccessorioUltimoRendiconto !== undefined ||
        fundData.annualData.fondoStabile2016PNRR !== undefined
    ) ? 'implemented' : 'not-implemented',
  },
  {
    title: "Simulatore Incremento (Opzionale)",
    description: "Per Comuni e Province, utilizza il simulatore per calcolare l'incremento potenziale del salario accessorio secondo il DL PA (se applicabile).",
    targetTabId: 'dataEntry',
    statusCheck: (fundData) => {
        const { tipologiaEnte, simulatoreInput, simulatoreRisultati } = fundData.annualData;
        if (tipologiaEnte === TipologiaEnte.COMUNE || tipologiaEnte === TipologiaEnte.PROVINCIA) {
            const inputHasValues = simulatoreInput && Object.values(simulatoreInput).some(v => v !== undefined);
            return (inputHasValues || simulatoreRisultati) ? 'implemented' : 'not-implemented';
        }
        return 'implemented'; // Consider implemented if not applicable
    }
  },
  {
    title: "Salva e Calcola",
    description: 'Clicca "Salva Dati e Calcola Fondo" nella pagina "Dati Costituzione Fondo" per eseguire il calcolo globale.',
    targetTabId: 'dataEntry',
    statusCheck: (fundData, calculatedFund, complianceChecks) => (calculatedFund && complianceChecks && complianceChecks.length > 0) ? 'implemented' : 'not-implemented',
  },
  {
    title: "Compila Fondi Specifici (1/4): Personale",
    description: 'Naviga alla sezione "Fondo Accessorio Personale" per inserire le singole voci che compongono questo fondo.',
    targetTabId: 'fondoAccessorioDipendente',
    statusCheck: (fundData) => {
        const data = fundData.fondoAccessorioDipendenteData || {} as FondoAccessorioDipendenteData;
        const initialData = INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA;
        // Check if any user-inputtable field is different from initial and not undefined
        return Object.keys(initialData).some(keyStr => {
            const key = keyStr as keyof FondoAccessorioDipendenteData;
            // Exclude auto-calculated or purely display fields from this check
            if (key === 'cl_totaleParzialeRisorsePerConfrontoTetto2016' || key === 'st_riduzionePerIncrementoEQ' || key === 'st_art79c1c_incrementoStabileConsistenzaPers') return false;
            return data[key] !== initialData[key] && data[key] !== undefined;
        }) ? 'implemented' : 'not-implemented';
    }
  },
  {
    title: "Compila Fondi Specifici (2/4): EQ",
    description: 'Naviga alla sezione "Fondo Elevate Qualificazioni" per inserire le singole voci che compongono questo fondo.',
    targetTabId: 'fondoElevateQualificazioni',
    statusCheck: (fundData) => {
        const data = fundData.fondoElevateQualificazioniData || {} as FondoElevateQualificazioniData;
        const initialData = INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA;
        return Object.keys(initialData).some(keyStr => {
            const key = keyStr as keyof FondoElevateQualificazioniData;
            return data[key] !== initialData[key] && data[key] !== undefined;
        }) ? 'implemented' : 'not-implemented';
    }
  },
  {
    title: "Compila Fondi Specifici (3/4): Segretario",
    description: 'Naviga alla sezione "Risorse Segretario Comunale" per inserire le singole voci che compongono questo fondo.',
    targetTabId: 'fondoSegretarioComunale',
    statusCheck: (fundData) => {
        const data = fundData.fondoSegretarioComunaleData || {} as FondoSegretarioComunaleData;
        const initialData = INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA;
        return Object.keys(initialData).some(keyStr => {
            const key = keyStr as keyof FondoSegretarioComunaleData;
             if (key === 'fin_totaleRisorseRilevantiLimite' || key === 'fin_percentualeCoperturaPostoSegretario') return false; // Defaulted field
            return data[key] !== initialData[key] && data[key] !== undefined;
        }) ? 'implemented' : 'not-implemented';
    }
  },
  {
    title: "Compila Fondi Specifici (4/4): Dirigenza",
    description: 'Se l\'ente ha personale dirigente, naviga alla sezione "Fondo Dirigenza" per inserire le singole voci che compongono questo fondo.',
    targetTabId: 'fondoDirigenza',
    statusCheck: (fundData) => {
        if (!fundData.annualData.hasDirigenza) return 'implemented'; // Not applicable, so "implemented"
        const data = fundData.fondoDirigenzaData || {} as FondoDirigenzaData;
        const initialData = INITIAL_FONDO_DIRIGENZA_DATA;
        return Object.keys(initialData).some(keyStr => {
            const key = keyStr as keyof FondoDirigenzaData;
            if (key === 'lim_totaleParzialeRisorseConfrontoTetto2016') return false;
            return data[key] !== initialData[key] && data[key] !== undefined;
        }) ? 'implemented' : 'not-implemented';
    }
  },
  {
    title: "Verifica Risultati",
    description: 'Controlla i totali e il rispetto del limite Art. 23 nella pagina "Dettaglio Fondo Calcolato".',
    targetTabId: 'fundDetails',
    statusCheck: (fundData, calculatedFund) => (calculatedFund) ? 'implemented' : 'not-implemented',
  },
  {
    title: "Controlli di Conformità",
    description: 'Analizza i check automatici nella pagina "Conformità" per identificare eventuali criticità o avvisi.',
    targetTabId: 'compliance',
    statusCheck: (fundData, calculatedFund, complianceChecks) => (complianceChecks && complianceChecks.length > 0) ? 'implemented' : 'not-implemented',
  },
  {
    title: "Genera Report",
    description: 'Scarica la documentazione necessaria (es. Riepilogo PDF, Determinazione TXT) dalla pagina "Report".',
    targetTabId: 'reports',
    staticStatus: 'partially-implemented', // This status is static as it refers to feature completeness
    statusMessage: "Generazione Riepilogo Generale PDF e Determinazione TXT implementata. Altri report sono in sviluppo."
  },
  {
    title: "Aggiorna Calcoli",
    description: 'Usa il pulsante "Aggiorna Calcoli e Conformità" qui in alto per ricalcolare il fondo dopo aver apportato modifiche ai dati.',
    targetTabId: 'benvenuto',
    staticStatus: 'implemented', // This is an action button, always available
  }
];

const getStatusIndicator = (status: WizardStep['status']): { icon: string; text: string; color: string } => {
  switch (status) {
    case 'implemented':
      return { icon: '✅', text: 'Implementato', color: 'text-green-700' };
    case 'partially-implemented':
      return { icon: '⚠️', text: 'Parzialmente Implementato', color: 'text-amber-700' };
    case 'not-implemented':
      return { icon: '❌', text: 'Non Implementato', color: 'text-red-700' };
    default:
      return { icon: '', text: '', color: '' };
  }
};

export const HomePage: React.FC = () => {
  const { state, dispatch, performFundCalculation } = useAppContext();
  const { calculatedFund, complianceChecks, fundData, isLoading } = state;
  const [currentWizardStep, setCurrentWizardStep] = useState(0);

  const wizardSteps: WizardStep[] = initialWizardSteps.map(stepDef => ({
    title: stepDef.title,
    description: stepDef.description,
    targetTabId: stepDef.targetTabId,
    status: stepDef.staticStatus || (stepDef.statusCheck ? stepDef.statusCheck(fundData, calculatedFund, complianceChecks) : 'not-implemented'),
    statusMessage: stepDef.statusMessage,
  }));


  const handleRecalculate = () => {
    performFundCalculation();
  };

  const handleNextStep = () => {
    if (currentWizardStep < wizardSteps.length - 1) {
      setCurrentWizardStep(currentWizardStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentWizardStep > 0) {
      setCurrentWizardStep(currentWizardStep - 1);
    }
  };

  const handleStepNavigation = (targetTabId?: string) => {
    if (targetTabId) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: targetTabId });
    }
  };
  
  const currentStepContent = wizardSteps[currentWizardStep];
  const statusInfo = getStatusIndicator(currentStepContent.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Benvenuto!</h2>
        <Button onClick={handleRecalculate} isLoading={isLoading} disabled={isLoading} variant="primary" size="md">
          {isLoading ? TEXTS_UI.calculating : "Aggiorna Calcoli e Conformità"}
        </Button>
      </div>
      
      {state.error && (
        <div className="p-4 bg-[#fdd0d2] border border-[#ea2832] text-[#5c1114] rounded-lg" role="alert">
          <strong className="font-bold">Errore: </strong>
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      <Card title="Guida Rapida Interattiva" className="mb-8">
        <div className="p-4"> {/* Increased padding for content area */}
            <div className="mb-4 text-center">
                <p className="text-sm text-[#5f5252]">Passo {currentWizardStep + 1} di {wizardSteps.length}</p>
            </div>
            <div className="flex items-start p-4 rounded-lg bg-[#fcf8f8] border border-[#f3e7e8] min-h-[160px]"> {/* Increased min-height */}
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#ea2832] text-white flex items-center justify-center font-bold text-lg mr-4">
                    {currentWizardStep + 1}
                </div>
                <div className="flex-1">
                    {currentStepContent.targetTabId ? (
                      <button 
                        onClick={() => handleStepNavigation(currentStepContent.targetTabId)}
                        className="text-left w-full text-[#1b0e0e] hover:text-[#ea2832] focus:outline-none focus:text-[#ea2832]"
                        aria-label={`Vai a ${currentStepContent.title}`}
                      >
                        <h4 className="text-md font-bold underline">{currentStepContent.title}</h4>
                      </button>
                    ) : (
                      <h4 className="text-md font-bold text-[#1b0e0e]">{currentStepContent.title}</h4>
                    )}
                    <div className={`mt-1 mb-2 text-xs font-semibold ${statusInfo.color}`}>
                      <span role="img" aria-label={statusInfo.text} className="mr-1">{statusInfo.icon}</span>
                      {statusInfo.text}
                    </div>
                    <p className="text-sm text-[#5f5252]">{currentStepContent.description}</p>
                    {currentStepContent.statusMessage && (
                      <p className={`text-xs mt-1 ${statusInfo.color}`}>{currentStepContent.statusMessage}</p>
                    )}
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <Button 
                    onClick={handlePrevStep} 
                    disabled={currentWizardStep === 0}
                    variant="secondary"
                >
                    Indietro
                </Button>
                {currentWizardStep < wizardSteps.length - 1 ? (
                    <Button 
                        onClick={handleNextStep}
                        variant="primary"
                    >
                        Avanti
                    </Button>
                ) : (
                    <Button 
                        onClick={() => setCurrentWizardStep(0)} // Restart wizard or other action
                        variant="success" 
                    >
                        Ricomincia Guida
                    </Button>
                )}
            </div>
        </div>
      </Card>

      <DashboardSummary calculatedFund={calculatedFund} annoRiferimento={fundData.annualData.annoRiferimento} />
      <ComplianceStatusWidget complianceChecks={complianceChecks} />
      
    </div>
  );
};
