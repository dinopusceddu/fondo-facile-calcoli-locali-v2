// pages/HomePage.tsx
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Button } from '../components/shared/Button.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI, INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA, INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA, INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA, INITIAL_FONDO_DIRIGENZA_DATA } from '../constants.js';
import { FundData, CalculatedFund, ComplianceCheck, TipologiaEnte, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData, AnnualData } from '../types.js';

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
        // If not applicable (not Comune/Provincia), step is considered done.
        if (tipologiaEnte && tipologiaEnte !== TipologiaEnte.COMUNE && tipologiaEnte !== TipologiaEnte.PROVINCIA) {
            return 'implemented';
        }
        // If it is applicable, check for data entry.
        if (tipologiaEnte === TipologiaEnte.COMUNE || tipologiaEnte === TipologiaEnte.PROVINCIA) {
            const hd = fundData.historicalData;
            const ad = fundData.annualData;
            const hasData = (hd.fondoPersonaleNonDirEQ2018_Art23 !== undefined) ||
                            (hd.fondoEQ2018_Art23 !== undefined) ||
                            (ad.personale2018PerArt23 && ad.personale2018PerArt23.length > 0) ||
                            (ad.personaleAnnoRifPerArt23 && ad.personaleAnnoRifPerArt23.length > 0);
            return hasData ? 'implemented' : 'not-implemented';
        }
        // If ente type is not selected yet, step is not done.
        return 'not-implemented';
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
        // If not applicable (not Comune/Provincia), step is considered done.
        if (tipologiaEnte && tipologiaEnte !== TipologiaEnte.COMUNE && tipologiaEnte !== TipologiaEnte.PROVINCIA) {
          return 'implemented';
        }
        // If it is applicable, check for data entry.
        if (tipologiaEnte === TipologiaEnte.COMUNE || tipologiaEnte === TipologiaEnte.PROVINCIA) {
            const si = simulatoreInput || {};
            // Check if any of the main monetary fields have a value. Ignore the default percentage field.
            const inputHasValues = (si.simStipendiTabellari2023 !== undefined) ||
                                   (si.simFondoStabileAnnoApplicazione !== undefined) ||
                                   (si.simRisorsePOEQAnnoApplicazione !== undefined) ||
                                   (si.simSpesaPersonaleConsuntivo2023 !== undefined) ||
                                   (si.simMediaEntrateCorrenti2021_2023 !== undefined) ||
                                   (si.simTettoSpesaPersonaleL296_06 !== undefined) ||
                                   (si.simCostoAnnuoNuoveAssunzioniPIAO !== undefined);
            return (inputHasValues || simulatoreRisultati) ? 'implemented' : 'not-implemented';
        }
        // If ente type is not selected yet, step is not done.
        return 'not-implemented';
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
        // If hasDirigenza is explicitly false, it's not applicable, so it's "implemented".
        if (fundData.annualData.hasDirigenza === false) return 'implemented';
        
        // If hasDirigenza is true, check for data entry.
        if (fundData.annualData.hasDirigenza === true) {
            const data = fundData.fondoDirigenzaData || {} as FondoDirigenzaData;
            const initialData = INITIAL_FONDO_DIRIGENZA_DATA;
            return Object.keys(initialData).some(keyStr => {
                const key = keyStr as keyof FondoDirigenzaData;
                if (key === 'lim_totaleParzialeRisorseConfrontoTetto2016') return false;
                return data[key] !== initialData[key] && data[key] !== undefined;
            }) ? 'implemented' : 'not-implemented';
        }

        // If hasDirigenza is undefined (not selected yet), it's "not-implemented".
        return 'not-implemented';
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
  const { calculatedFund, complianceChecks, fundData, isLoading, error } = state;
  const [currentWizardStep, setCurrentWizardStep] = useState(0);

  const wizardSteps: WizardStep[] = initialWizardSteps.map(stepDef => {
    let status: WizardStep['status'];
    
    // Special handling for the last step
    if (stepDef.title === "Aggiorna Calcoli") {
        const calculationAttempted = calculatedFund !== undefined || error !== undefined || isLoading;
        status = calculationAttempted ? 'implemented' : 'not-implemented';
    } else {
        status = stepDef.staticStatus || (stepDef.statusCheck ? stepDef.statusCheck(fundData, calculatedFund, complianceChecks) : 'not-implemented');
    }

    return {
      title: stepDef.title,
      description: stepDef.description,
      targetTabId: stepDef.targetTabId,
      status: status,
      statusMessage: stepDef.statusMessage,
    };
  });

  const isFundConstitutionCorrect = calculatedFund && !error && (!complianceChecks || !complianceChecks.some(c => c.gravita === 'error'));

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

  const handleDistributionModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { isDistributionMode: e.target.checked } as Partial<AnnualData> });
  };
  
  const currentStepContent = wizardSteps[currentWizardStep];
  const statusInfo = getStatusIndicator(currentStepContent.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Benvenuto!</h2>
        {/* Button removed from here */}
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

      <Card title="Modalità di Lavoro" className="mb-8">
        <div className="p-4">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="distribution-mode-toggle"
                    className="h-5 w-5 rounded border-[#d1c0c1] text-[#ea2832] focus:ring-[#ea2832]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    checked={!!fundData.annualData.isDistributionMode}
                    onChange={handleDistributionModeChange}
                    disabled={!isFundConstitutionCorrect}
                    aria-describedby="distribution-mode-alert"
                />
                <label htmlFor="distribution-mode-toggle" className="ml-3 text-sm font-medium text-[#1b0e0e]">
                    Il programma viene usato in fase di distribuzione del fondo.
                </label>
            </div>
            {!isFundConstitutionCorrect && (
                <div id="distribution-mode-alert" className="mt-3 p-3 text-sm text-[#c02128] bg-[#fef2f2] rounded-lg border border-[#fecaca]">
                    <p>
                        <strong className="font-bold">Attenzione:</strong> La modalità di distribuzione non può essere attivata.
                        È necessario prima eseguire un calcolo del fondo che risulti corretto (senza errori di calcolo o criticità di conformità).
                    </p>
                </div>
            )}
            <p className="mt-2 text-xs text-[#5f5252]">
                Spuntando questa casella, verrà attivata la sezione "Distribuzione Risorse", utile per la ripartizione del fondo calcolato.
            </p>
        </div>
      </Card>


      <div className="mt-8 flex justify-center">
        <Button onClick={handleRecalculate} isLoading={isLoading} disabled={isLoading} variant="primary" size="lg">
          {isLoading ? TEXTS_UI.calculating : "Aggiorna Calcoli e Conformità"}
        </Button>
      </div>
      
    </div>
  );
};
