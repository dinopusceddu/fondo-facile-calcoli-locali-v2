// pages/FondoAccessorioDipendentePage.tsx
import React, { useEffect, useState } from 'react'; 
import { useAppContext } from '../contexts/AppContext.js';
import { FondoAccessorioDipendenteData } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { Input } from '../components/shared/Input.js';
import { TEXTS_UI, RIF_INCREMENTO_DECRETO_PA, RIF_ART23_DLGS75_2017, RIF_ART8_DL13_2023, RIF_ART7_C4_U_CCNL2022 } from '../constants.js'; 
import { fadFieldDefinitions, getFadEffectiveValue, calculateFadTotals } from './FondoAccessorioDipendentePageHelpers.js';


const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return defaultText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface FundingItemProps {
  id: keyof FondoAccessorioDipendenteData | 'calculated_cl_totaleParzialeRisorsePerConfrontoTetto2016'; 
  description: string | React.ReactNode; 
  value?: number;
  isSubtractor?: boolean;
  onChange: (field: keyof FondoAccessorioDipendenteData, value?: number) => void;
  riferimentoNormativo?: string;
  disabled?: boolean;
  inputInfo?: string | React.ReactNode;
}

const FundingItem: React.FC<FundingItemProps> = ({ 
    id, 
    description, 
    value, 
    isSubtractor = false, 
    onChange, 
    riferimentoNormativo,
    disabled = false,
    inputInfo
}) => {
  const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (id === 'calculated_cl_totaleParzialeRisorsePerConfrontoTetto2016') return; 
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onChange(id as keyof FondoAccessorioDipendenteData, val);
  };

  return (
    <div className={`grid grid-cols-12 gap-x-4 gap-y-2 py-4 border-b border-[#f3e7e8] last:border-b-0 items-start ${disabled ? 'opacity-60 bg-[#fcf8f8]' : ''}`}>
      <div className="col-span-12 md:col-span-8">
        <label htmlFor={id as string} className={`block text-sm text-[#1b0e0e] ${disabled ? 'cursor-not-allowed' : ''}`}>
          {description}
          {isSubtractor && <span className="text-xs text-[#ea2832] ml-1">(da sottrarre)</span>}
        </label>
        {riferimentoNormativo && <p className="text-xs text-[#5f5252] mt-0.5">{riferimentoNormativo}</p>}
      </div>
      <div className="col-span-12 md:col-span-4">
        <Input
          type="number"
          id={id as string}
          name={id as string}
          value={value ?? ''}
          onChange={handleChangeEvent}
          placeholder="0.00"
          step="0.01"
          inputClassName={`text-right w-full h-11 p-2.5 ${disabled ? 'bg-[#e0d8d8] cursor-not-allowed' : 'bg-[#f3e7e8]'}`} // Slightly adjusted height for these items
          containerClassName="mb-0"
          labelClassName="pb-1" // Reduced label padding
          aria-label={typeof description === 'string' ? description : id}
          disabled={disabled}
        />
        {inputInfo && <div className="text-xs text-[#5f5252] mt-1">{inputInfo}</div>}
      </div>
    </div>
  );
};

const SectionTotal: React.FC<{ label: string; total?: number }> = ({ label, total }) => {
  return (
    <div className="mt-4 pt-4 border-t-2 border-[#d1c0c1]"> {/* Thicker border for section total */}
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1b0e0e]">{label}</span>
        <span className="text-lg font-bold text-[#ea2832]">
          {total === undefined || isNaN(total) ? TEXTS_UI.notApplicable : `€ ${total.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
  const displayInfoPerArt79c1c = `Valore calcolato da Art.23c2 (non Dir/EQ 2018): ${formatCurrency(incrementoCalcolatoPerArt79c1c)}`;

  useEffect(() => {
      if(data.st_art79c1c_incrementoStabileConsistenzaPers === undefined || data.st_art79c1c_incrementoStabileConsistenzaPers !== incrementoCalcolatoPerArt79c1c){
        dispatch({
            type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
            payload: { st_art79c1c_incrementoStabileConsistenzaPers: isNaN(incrementoCalcolatoPerArt79c1c) ? 0 : incrementoCalcolatoPerArt79c1c }
        });
      }
  }, [incrementoCalcolatoPerArt79c1c, dispatch, data.st_art79c1c_incrementoStabileConsistenzaPers]);

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
  }, [isEnteInCondizioniSpeciali, dispatch, data]); // Removed fadFieldDefinitions from deps

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

  const sommaStabiliSoggetteLimite = fadFieldDefinitions
    .filter(def => def.section === 'stabili' && def.isRelevantToArt23Limit)
    .reduce((sum, def) => {
        let value = getFadEffectiveValue(def.key, data[def.key], def.isDisabledByCondizioniSpeciali, isEnteInCondizioniSpeciali);
        if (def.key === 'st_incrementoDecretoPA' && !isIncrementoDecretoPAActive) value = 0;
        if (def.key === 'st_riduzionePerIncrementoEQ') value = incrementoEQconRiduzioneDipendenti || 0; // Ensure this is always up-to-date for limit calculation
        return sum + (def.isSubtractor ? -value : value);
    },0);
  
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
    <Card title={title.toUpperCase()} className="mb-6" isCollapsible={true} defaultCollapsed={section === 'fin_decurtazioni' || section === 'cl_limiti'}>
        {fadFieldDefinitions.filter(def => def.section === section).map(def => {
            let currentDescription: string | React.ReactNode = def.description;
            let currentDisabled = def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali;
            let currentInputInfo = def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined;

            if (def.key === 'st_incrementoDecretoPA') {
                currentDescription = incrementoDecretoPADescription;
                currentDisabled = !isIncrementoDecretoPAActive;
                currentInputInfo = isIncrementoDecretoPAActive ? `Max: ${formatCurrency(maxIncrementoDecretoPA, '0.00')}` : "Attivabile tramite Simulatore";
            } else if (def.key === 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016') {
                currentDisabled = (!arePNRR3ConditionsMet || isEnteInCondizioniSpeciali);
                currentInputInfo = displayInfoPerPNRR3;
            } else if (def.key === 'st_art79c1c_incrementoStabileConsistenzaPers') {
                 currentInputInfo = displayInfoPerArt79c1c;
            } else if (def.key === 'st_riduzionePerIncrementoEQ'){
                currentInputInfo = "Valore derivato dal Fondo Elevate Qualificazioni";
                currentDisabled = true; // Always disabled as it's auto-calculated
            }


            return (
                <FundingItem 
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
    <div className="space-y-8 pb-12"> 
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo accessorio personale dipendente</h2>

      {renderSection("Fonti di Finanziamento Stabili", 'stabili', fadTotals.sommaStabili_Dipendenti, "SOMMA RISORSE STABILI")}
      {renderSection("Fonti di Finanziamento Variabili Soggette al Limite", 'vs_soggette', fadTotals.sommaVariabiliSoggette_Dipendenti, "SOMMA RISORSE VARIABILI SOGGETTE AL LIMITE")}
      {renderSection("Fonti di Finanziamento Variabili Non Soggette al Limite", 'vn_non_soggette', fadTotals.sommaVariabiliNonSoggette_Dipendenti, "SOMMA RISORSE VARIABILI NON SOGGETTE AL LIMITE")}
      {renderSection("Altre Risorse e Decurtazioni Finali", 'fin_decurtazioni', fadTotals.altreRisorseDecurtazioniFinali_Dipendenti, "SOMMA ALTRE DECURTAZIONI")}
      
      <Card title="CALCOLO DEL RISPETTO DEI LIMITI DEL SALARIO ACCESSORIO" className="mb-6" isCollapsible={true}>
        <FundingItem 
            id="calculated_cl_totaleParzialeRisorsePerConfrontoTetto2016" 
            description="Totale parziale risorse disponibili per il fondo (CALCOLATO) ai fini del confronto con il tetto complessivo del salario accessorio dell'anno 2016." 
            value={data.cl_totaleParzialeRisorsePerConfrontoTetto2016} 
            onChange={() => {}} 
            riferimentoNormativo={RIF_ART23_DLGS75_2017} 
            disabled={true} 
            inputInfo="Valore calcolato automaticamente"
        />
        <FundingItem 
            id="cl_art23c2_decurtazioneIncrementoAnnualeTetto2016" 
            description="Art. 23 c. 2 dlgs 75/2017 Eventuale decurtazione annuale rispetto il tetto complessivo del salario accessorio dell'anno 2016." 
            value={data.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016} 
            onChange={handleChange} 
            riferimentoNormativo={RIF_ART23_DLGS75_2017} 
            isSubtractor={true} 
        />
      </Card>

      <Card title="TOTALE RISORSE EFFETTIVAMENTE DISPONIBILI" className="mb-6 bg-[#f3e7e8] border-[#d1c0c1]">
        <div className="p-4 text-center">
            <span className="text-2xl font-bold text-[#ea2832]">
            {fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti === undefined || isNaN(fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti) ? TEXTS_UI.notApplicable : `€ ${fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
        </div>
      </Card>

    </div>
  );
};
