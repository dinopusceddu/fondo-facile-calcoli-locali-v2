// pages/FondoAccessorioDipendentePage.tsx
import React, { useEffect, useState } from 'react'; 
import { useAppContext } from '../contexts/AppContext.js';
import { FondoAccessorioDipendenteData } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI, RIF_INCREMENTO_DECRETO_PA, RIF_ART23_DLGS75_2017, RIF_ART8_DL13_2023, RIF_ART7_C4_U_CCNL2022 } from '../constants.js'; 
import { fadFieldDefinitions, calculateFadTotals } from './FondoAccessorioDipendentePageHelpers.js';
import { FundingItem } from '../components/shared/FundingItem.js';

const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return defaultText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SectionTotal: React.FC<{ label: string; total?: number }> = ({ label, total }) => {
  return (
    <div className="mt-4 pt-4 border-t-2 border-[#d1c0c1]">
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1b0e0e]">{label}</span>
        <span className="text-lg font-bold text-[#ea2832]">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export const FondoAccessorioDipendentePage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const data = state.fundData.fondoAccessorioDipendenteData || {} as FondoAccessorioDipendenteData;
  const { 
    simulatoreRisultati, 
    calcolatoIncrementoPNRR3,
    rispettoEquilibrioBilancioPrecedente,
    rispettoDebitoCommercialePrecedente,
    approvazioneRendicontoPrecedente,
    incidenzaSalarioAccessorioUltimoRendiconto,
    fondoStabile2016PNRR,
    isEnteDissestato,
    isEnteStrutturalmenteDeficitario,
    isEnteRiequilibrioFinanziario,
  } = state.fundData.annualData;

  const { fondoPersonaleNonDirEQ2018_Art23 } = state.fundData.historicalData;
  const { personale2018PerArt23, personaleAnnoRifPerArt23 } = state.fundData.annualData;
  
  const incrementoEQconRiduzioneDipendenti = state.fundData.fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti;

  const [pnrr3UserModified, setPnrr3UserModified] = useState(false);
  const [isArt79c1cUserModified, setIsArt79c1cUserModified] = useState(false);
  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;
  const enteCondizioniSpecialiInfo = "Disabilitato a causa dello stato dell'ente (dissesto, deficit strutturale o riequilibrio finanziario).";

  const dipendentiEquivalenti2018_art79c1c = (personale2018PerArt23 || []).reduce((sum, emp) => {
      return sum + ((emp.partTimePercentage || 0) / 100);
  }, 0);
  const dipendentiEquivalentiAnnoRif_art79c1c = (personaleAnnoRifPerArt23 || []).reduce((sum, emp) => {
      const ptPerc = (emp.partTimePercentage || 0) / 100;
      const cedoliniRatio = emp.cedoliniEmessi !== undefined && emp.cedoliniEmessi > 0 && emp.cedoliniEmessi <= 12 ? emp.cedoliniEmessi / 12 : 0;
      return sum + (ptPerc * cedoliniRatio);
  }, 0);
  const variazioneDipendenti_art79c1c = dipendentiEquivalentiAnnoRif_art79c1c - dipendentiEquivalenti2018_art79c1c;
  let valoreMedioProCapite_art79c1c = 0;
  if ((fondoPersonaleNonDirEQ2018_Art23 || 0) > 0 && dipendentiEquivalenti2018_art79c1c > 0) {
      valoreMedioProCapite_art79c1c = (fondoPersonaleNonDirEQ2018_Art23 || 0) / dipendentiEquivalenti2018_art79c1c;
  }
  const incrementoCalcolatoPerArt79c1c = Math.max(0, valoreMedioProCapite_art79c1c * variazioneDipendenti_art79c1c);
  const roundedIncrementoArt79c1c = Math.round((incrementoCalcolatoPerArt79c1c + Number.EPSILON) * 100) / 100;

  useEffect(() => {
    if (!isArt79c1cUserModified) {
      if(data.st_art79c1c_incrementoStabileConsistenzaPers === undefined || data.st_art79c1c_incrementoStabileConsistenzaPers !== roundedIncrementoArt79c1c){
        dispatch({
            type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
            payload: { st_art79c1c_incrementoStabileConsistenzaPers: isNaN(roundedIncrementoArt79c1c) ? 0 : roundedIncrementoArt79c1c }
        });
      }
    }
  }, [roundedIncrementoArt79c1c, dispatch, data.st_art79c1c_incrementoStabileConsistenzaPers, isArt79c1cUserModified]);

  const arePNRR3ConditionsMet = 
    rispettoEquilibrioBilancioPrecedente === true &&
    rispettoDebitoCommercialePrecedente === true &&
    approvazioneRendicontoPrecedente === true &&
    (incidenzaSalarioAccessorioUltimoRendiconto !== undefined && incidenzaSalarioAccessorioUltimoRendiconto <= 8) &&
    (fondoStabile2016PNRR !== undefined && fondoStabile2016PNRR > 0);
  const valoreMassimoPNRR3 = (arePNRR3ConditionsMet && calcolatoIncrementoPNRR3 !== undefined && !isNaN(calcolatoIncrementoPNRR3)) 
                            ? calcolatoIncrementoPNRR3 
                            : 0;
  
  useEffect(() => {
    if (!pnrr3UserModified && !isEnteInCondizioniSpeciali) { 
        let autoGeneratedValueForPNRR3 = 0;
        if (arePNRR3ConditionsMet && calcolatoIncrementoPNRR3 !== undefined && !isNaN(calcolatoIncrementoPNRR3)) {
            autoGeneratedValueForPNRR3 = calcolatoIncrementoPNRR3;
        }
        if (data.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 !== autoGeneratedValueForPNRR3) {
            dispatch({
                type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
                payload: { vn_dl13_art8c3_incrementoPNRR_max5stabile2016: autoGeneratedValueForPNRR3 }
            });
        }
    } else if (isEnteInCondizioniSpeciali && data.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 !== 0) {
        dispatch({
            type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
            payload: { vn_dl13_art8c3_incrementoPNRR_max5stabile2016: 0 }
        });
    }
  }, [arePNRR3ConditionsMet, calcolatoIncrementoPNRR3, dispatch, pnrr3UserModified, data.vn_dl13_art8c3_incrementoPNRR_max5stabile2016, isEnteInCondizioniSpeciali]);

  let displayInfoPerPNRR3 = `Valore massimo da PNRR3 (Dati Fondo): ${formatCurrency(valoreMassimoPNRR3)}`;
  if (isEnteInCondizioniSpeciali) {
    displayInfoPerPNRR3 = enteCondizioniSpecialiInfo;
  } else if (!arePNRR3ConditionsMet) {
    displayInfoPerPNRR3 = "Condizioni PNRR3 non soddisfatte o stato ente problematico. L'incremento non è applicabile.";
  }

  useEffect(() => {
    const valoreDaEQ = incrementoEQconRiduzioneDipendenti !== undefined && !isNaN(incrementoEQconRiduzioneDipendenti) 
                       ? incrementoEQconRiduzioneDipendenti 
                       : 0;
    if (data.st_riduzionePerIncrementoEQ !== valoreDaEQ) {
      dispatch({
        type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
        payload: { st_riduzionePerIncrementoEQ: valoreDaEQ }
      });
    }
  }, [incrementoEQconRiduzioneDipendenti, data.st_riduzionePerIncrementoEQ, dispatch]);

  const maxIncrementoDecretoPA = simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo ?? 0;
  const isIncrementoDecretoPAActive = maxIncrementoDecretoPA > 0;

  const handleChange = (field: keyof FondoAccessorioDipendenteData, value?: number) => {
    let processedValue = value;
    if (field === 'st_incrementoDecretoPA') {
      if (isIncrementoDecretoPAActive) { 
        processedValue = (value !== undefined) ? Math.min(Math.max(0, value), maxIncrementoDecretoPA) : undefined;
      } else {
        processedValue = 0; 
      }
    } else if (field === 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016') {
      setPnrr3UserModified(true); 
      if (arePNRR3ConditionsMet && !isEnteInCondizioniSpeciali) {
        const maxAllowedPNRR3 = valoreMassimoPNRR3;
        processedValue = (value !== undefined) ? Math.min(Math.max(0, value), maxAllowedPNRR3) : undefined;
      } else {
        processedValue = 0; 
      }
    } else if (field === 'st_art79c1c_incrementoStabileConsistenzaPers') {
        setIsArt79c1cUserModified(true);
        if (value !== undefined) {
            processedValue = Math.min(value, roundedIncrementoArt79c1c);
        }
    }
    dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { [field]: processedValue } });
  };
  
  useEffect(() => {
    if (isEnteInCondizioniSpeciali) {
      const fieldsToReset: Partial<FondoAccessorioDipendenteData> = {};
      fadFieldDefinitions.forEach(def => {
        if (def.isDisabledByCondizioniSpeciali) {
            fieldsToReset[def.key] = def.key === 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016' ? 0 : undefined;
        }
      });
      
      let needsUpdate = false;
      for (const key in fieldsToReset) {
          if (data[key as keyof FondoAccessorioDipendenteData] !== fieldsToReset[key as keyof FondoAccessorioDipendenteData]) {
              needsUpdate = true;
              break;
          }
      }
      if (needsUpdate) {
        dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: fieldsToReset });
      }
    }
  }, [isEnteInCondizioniSpeciali, dispatch, data]);

  const fadTotals = calculateFadTotals(data, simulatoreRisultati, isEnteInCondizioniSpeciali, incrementoEQconRiduzioneDipendenti);

  const incrementoDecretoPADescription = (
    <>
      Incremento Decreto PA
      {!isIncrementoDecretoPAActive && (
        <span className="block text-xs text-[#994d51]">
          Compilare il Simulatore Incremento nella pagina "Dati Costituzione Fondo" per attivare.
        </span>
      )}
    </>
  );

  const sommaStabiliSoggetteLimite = fadTotals.sommaStabiliSoggetteLimite;
  
  const totaleParzialeRisorsePerConfrontoTetto2016_calculated = sommaStabiliSoggetteLimite + fadTotals.sommaVariabiliSoggette_Dipendenti;

  useEffect(() => {
    if (data.cl_totaleParzialeRisorsePerConfrontoTetto2016 !== totaleParzialeRisorsePerConfrontoTetto2016_calculated) {
      dispatch({ 
        type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', 
        payload: { cl_totaleParzialeRisorsePerConfrontoTetto2016: isNaN(totaleParzialeRisorsePerConfrontoTetto2016_calculated) ? 0 : totaleParzialeRisorsePerConfrontoTetto2016_calculated } 
      });
    }
  }, [data.cl_totaleParzialeRisorsePerConfrontoTetto2016, totaleParzialeRisorsePerConfrontoTetto2016_calculated, dispatch]);

  const renderSection = (title: string, section: 'stabili' | 'vs_soggette' | 'vn_non_soggette' | 'fin_decurtazioni' | 'cl_limiti', sectionTotal: number, totalLabel: string) => (
    <Card title={title.toUpperCase()} className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        {fadFieldDefinitions.filter(def => def.section === section).map(def => {
            let currentDescription: string | React.ReactNode = def.description;
            let currentDisabled = def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali;
            let currentInputInfo: string | React.ReactNode | undefined = def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined;

            if (def.key === 'st_incrementoDecretoPA') {
                currentDescription = incrementoDecretoPADescription;
                currentDisabled = !isIncrementoDecretoPAActive;
                currentInputInfo = isIncrementoDecretoPAActive ? `Max: ${formatCurrency(maxIncrementoDecretoPA, '0.00')}` : "Attivabile tramite Simulatore";
            } else if (def.key === 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016') {
                currentDisabled = (!arePNRR3ConditionsMet || isEnteInCondizioniSpeciali);
                currentInputInfo = displayInfoPerPNRR3;
            } else if (def.key === 'st_art79c1c_incrementoStabileConsistenzaPers') {
                const valoreInserito = data.st_art79c1c_incrementoStabileConsistenzaPers;
                const differenza = valoreInserito !== undefined ? roundedIncrementoArt79c1c - valoreInserito : 0;
                const showAlert = isArt79c1cUserModified && differenza > 0.005;

                let infoNode: React.ReactNode = `Valore calcolato da Art.23c2 (non Dir/EQ 2018): ${formatCurrency(roundedIncrementoArt79c1c)}`;
                if (showAlert) {
                  infoNode = (
                    <>
                      {infoNode}
                      <div className="mt-1 p-2 text-sm text-[#c02128] bg-[#fef2f2] rounded-lg border border-[#fecaca]">
                        <strong>ATTENZIONE:</strong> sono inseriti {formatCurrency(differenza)} euro in meno di quanto dovrebbe essere incrementato il fondo.
                      </div>
                    </>
                  );
                }
                currentInputInfo = infoNode;
            } else if (def.key === 'st_riduzionePerIncrementoEQ'){
                currentInputInfo = "Valore derivato dal Fondo Elevate Qualificazioni";
                currentDisabled = true;
            }

            return (
                <FundingItem<FondoAccessorioDipendenteData>
                    key={def.key}
                    id={def.key} 
                    description={currentDescription} 
                    value={data[def.key]} 
                    onChange={handleChange} 
                    riferimentoNormativo={def.riferimento}
                    isSubtractor={def.isSubtractor}
                    disabled={currentDisabled}
                    inputInfo={currentInputInfo}
                />
            );
        })}
        <SectionTotal label={totalLabel} total={sectionTotal} />
    </Card>
  );

  return (
    <div className="space-y-8 pb-20"> 
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo accessorio personale dipendente</h2>

      {renderSection("Fonti di Finanziamento Stabili", 'stabili', fadTotals.sommaStabili_Dipendenti, "SOMMA RISORSE STABILI")}
      {renderSection("Fonti di Finanziamento Variabili Soggette al Limite", 'vs_soggette', fadTotals.sommaVariabiliSoggette_Dipendenti, "SOMMA RISORSE VARIABILI SOGGETTE AL LIMITE")}
      {renderSection("Fonti di Finanziamento Variabili Non Soggette al Limite", 'vn_non_soggette', fadTotals.sommaVariabiliNonSoggette_Dipendenti, "SOMMA RISORSE VARIABILI NON SOGGETTE AL LIMITE")}
      {renderSection("Altre Risorse e Decurtazioni Finali", 'fin_decurtazioni', fadTotals.altreRisorseDecurtazioniFinali_Dipendenti, "SOMMA ALTRE DECURTAZIONI")}
      
      <Card title="CALCOLO DEL RISPETTO DEI LIMITI DEL SALARIO ACCESSORIO" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoAccessorioDipendenteData>
            id="cl_totaleParzialeRisorsePerConfrontoTetto2016"
            description="Totale parziale risorse disponibili per il fondo (CALCOLATO) ai fini del confronto con il tetto complessivo del salario accessorio dell'anno 2016." 
            value={data.cl_totaleParzialeRisorsePerConfrontoTetto2016} 
            onChange={() => {}} 
            riferimentoNormativo={RIF_ART23_DLGS75_2017} 
            disabled={true} 
            inputInfo="Valore calcolato automaticamente"
        />
        <FundingItem<FondoAccessorioDipendenteData>
            id="cl_art23c2_decurtazioneIncrementoAnnualeTetto2016" 
            description="Art. 23 c. 2 dlgs 75/2017 Eventuale decurtazione annuale rispetto il tetto complessivo del salario accessorio dell'anno 2016." 
            value={data.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016} 
            onChange={handleChange} 
            riferimentoNormativo={RIF_ART23_DLGS75_2017} 
            isSubtractor={true} 
        />
      </Card>
      
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-[#fcf8f8]/80 backdrop-blur-sm border-t border-t-[#f3e7e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[960px] mx-auto flex justify-between items-center">
            <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE DISPONIBILI:</span>
            <span className="text-2xl font-bold text-[#ea2832]">
                {formatCurrency(fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti)}
            </span>
        </div>
      </div>

    </div>
  );
};
