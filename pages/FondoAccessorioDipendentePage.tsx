// pages/FondoAccessorioDipendentePage.tsx
import React, { useEffect, useState } from 'react'; 
import { useAppContext } from '../contexts/AppContext.js';
import { FondoAccessorioDipendenteData } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { Input } from '../components/shared/Input.js';
import { TEXTS_UI, RIF_INCREMENTO_DECRETO_PA, RIF_ART23_DLGS75_2017, RIF_ART8_DL13_2023, RIF_ART7_C4_U_CCNL2022 } from '../constants.js'; 

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
          aria-label={typeof description === 'string' ? description : id as string}
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
      const fieldsToReset: Partial<FondoAccessorioDipendenteData> = {
        vs_art67c3g_personaleCaseGioco: undefined,
        vs_art79c2b_max1_2MonteSalari1997: undefined,
        vs_art67c3k_integrazioneArt62c2e_personaleTrasferito: undefined,
        vs_art79c2c_risorseScelteOrganizzative: undefined,
        vn_art15c1d_art67c3a_sponsorConvenzioni: undefined,
        vn_art54_art67c3f_rimborsoSpeseNotifica: undefined,
        vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione: undefined,
        vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale: undefined,
        vn_l178_art1c870_risparmiBuoniPasto2020: undefined,
        vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga: undefined,
        vn_art79c3_022MonteSalari2018_da2022Proporzionale: undefined,
        vn_art79c1b_euro8450_unaTantum2021_2022: undefined,
        vn_art79c3_022MonteSalari2018_da2022UnaTantum2022: undefined,
        vn_dl13_art8c3_incrementoPNRR_max5stabile2016: 0,
      };
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

  const sommaStabili = 
    (data.st_art79c1_art67c1_unicoImporto2017 || 0) +
    (data.st_art79c1_art67c1_alteProfessionalitaNonUtil || 0) +
    (data.st_art79c1_art67c2a_incr8320 || 0) +
    (data.st_art79c1_art67c2b_incrStipendialiDiff || 0) +
    (data.st_art79c1_art4c2_art67c2c_integrazioneRIA || 0) +
    (data.st_art79c1_art67c2d_risorseRiassorbite165 || 0) +
    (data.st_art79c1_art15c1l_art67c2e_personaleTrasferito || 0) +
    (data.st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig || 0) +
    (data.st_art79c1_art14c3_art67c2g_riduzioneStraordinario || 0) -
    (data.st_taglioFondoDL78_2010 || 0) - 
    (data.st_riduzioniPersonaleATA_PO_Esternalizzazioni || 0) - 
    (data.st_art67c1_decurtazionePO_AP_EntiDirigenza || 0) + 
    (data.st_art79c1b_euro8450 || 0) +
    (data.st_art79c1c_incrementoStabileConsistenzaPers || 0) + 
    (data.st_art79c1d_differenzialiStipendiali2022 || 0) +
    (data.st_art79c1bis_diffStipendialiB3D3 || 0) +
    (isIncrementoDecretoPAActive ? (data.st_incrementoDecretoPA || 0) : 0) -
    (data.st_riduzionePerIncrementoEQ || 0); 

   const sommaVariabiliSoggette =
    (data.vs_art4c3_art15c1k_art67c3c_recuperoEvasione || 0) +
    (data.vs_art4c2_art67c3d_integrazioneRIAMensile || 0) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vs_art67c3g_personaleCaseGioco || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vs_art79c2b_max1_2MonteSalari1997 || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vs_art67c3k_integrazioneArt62c2e_personaleTrasferito || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vs_art79c2c_risorseScelteOrganizzative || 0));
    
  const sommaVariabiliNonSoggette = 
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_art15c1d_art67c3a_sponsorConvenzioni || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_art54_art67c3f_rimborsoSpeseNotifica || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione || 0)) +
    (data.vn_art15c1k_art67c3c_incentiviTecniciCondoni || 0) +
    (data.vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti || 0) +
    (data.vn_art15c1m_art67c3e_risparmiStraordinario || 0) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale || 0)) +
    (data.vn_art80c1_sommeNonUtilizzateStabiliPrec || 0) +
    (data.vn_l145_art1c1091_incentiviRiscossioneIMUTARI || 0) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_l178_art1c870_risparmiBuoniPasto2020 || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_art79c3_022MonteSalari2018_da2022Proporzionale || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_art79c1b_euro8450_unaTantum2021_2022 || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_art79c3_022MonteSalari2018_da2022UnaTantum2022 || 0)) +
    (isEnteInCondizioniSpeciali ? 0 : (data.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 || 0));

  const totaleRisorseDisponibili = 
    sommaStabili + 
    sommaVariabiliSoggette + 
    sommaVariabiliNonSoggette -
    (data.fin_art4_dl16_misureMancatoRispettoVincoli || 0) -
    (data.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016 || 0); 

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

  const sommaStabiliSoggetteLimite =
    (data.st_art79c1_art67c1_unicoImporto2017 || 0) +
    (data.st_art79c1_art67c1_alteProfessionalitaNonUtil || 0) +
    (data.st_art79c1_art4c2_art67c2c_integrazioneRIA || 0) +
    (data.st_art79c1_art67c2d_risorseRiassorbite165 || 0) +
    (data.st_art79c1_art15c1l_art67c2e_personaleTrasferito || 0) +
    (data.st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig || 0) +
    (data.st_art79c1_art14c3_art67c2g_riduzioneStraordinario || 0) -
    (data.st_taglioFondoDL78_2010 || 0) -
    (data.st_riduzioniPersonaleATA_PO_Esternalizzazioni || 0) -
    (data.st_art67c1_decurtazionePO_AP_EntiDirigenza || 0) +
    (data.st_art79c1c_incrementoStabileConsistenzaPers || 0) + 
    (isIncrementoDecretoPAActive ? (data.st_incrementoDecretoPA || 0) : 0) -
    (data.st_riduzionePerIncrementoEQ || 0); 

  const totaleParzialeRisorsePerConfrontoTetto2016_calculated = sommaStabiliSoggetteLimite + sommaVariabiliSoggette;

  useEffect(() => {
    if (data.cl_totaleParzialeRisorsePerConfrontoTetto2016 !== totaleParzialeRisorsePerConfrontoTetto2016_calculated) {
      dispatch({ 
        type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', 
        payload: { cl_totaleParzialeRisorsePerConfrontoTetto2016: totaleParzialeRisorsePerConfrontoTetto2016_calculated } 
      });
    }
  }, [data.cl_totaleParzialeRisorsePerConfrontoTetto2016, totaleParzialeRisorsePerConfrontoTetto2016_calculated, dispatch]);


  return (
    <div className="space-y-8 pb-12"> 
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo accessorio personale dipendente</h2>

      <Card title="FONTI DI FINANZIAMENTO STABILI" className="mb-6" isCollapsible={true}>
        {/* ... Existing FundingItem components with updated styling via FundingItem component itself ... */}
        <FundingItem id="st_art79c1_art67c1_unicoImporto2017" description="Art. 79 c. 1 CCNL 2022. Art. 67 del CCNL 2018 c. 1 Unico importo del fondo del salario accessorio consolidato all'anno 2017." value={data.st_art79c1_art67c1_unicoImporto2017} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.1 CCNL 2018)" />
        <FundingItem id="st_art79c1_art67c1_alteProfessionalitaNonUtil" description="Art. 79 c. 1 CCNL 2022. Art. 67 del CCNL 2018 c. 1 Alte professionalità 0,20% monte salari 2001, esclusa la quota relativa all dirigenza, nel caso in cui tali risorse non siano state utilizzate (da inserire solo se l'importo annuale non è stato già ricompreso nell'unico importo storicizzato)." value={data.st_art79c1_art67c1_alteProfessionalitaNonUtil} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.1 CCNL 2018)"/>
        <FundingItem id="st_art79c1_art67c2a_incr8320" description="Art. 79 c. 1 CCNL 2022. Art. 67 del CCNL 2018 c. 2 lett. a) Incremento di 83,20 per unità di personale in servizio al 31.12.2015 a valere dall'anno 2019 (risorse non soggette al limite)." value={data.st_art79c1_art67c2a_incr8320} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.2a CCNL 2018)" />
        <FundingItem id="st_art79c1_art67c2b_incrStipendialiDiff" description="Art. 79 c. 1 CCNL 2022. Art. 67 del CCNL 2018 c. 2 lett. b) Incrementi stipendiali differenziali previsti dall'art. 64 per il personale in servizio (risorse non soggette al limite)." value={data.st_art79c1_art67c2b_incrStipendialiDiff} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.2b CCNL 2018)" />
        <FundingItem id="st_art79c1_art4c2_art67c2c_integrazioneRIA" description="Art. 79 c. 1 CCNL 2022. Art. 4 del CCNL 2001 c. 2 - art. 67 del CCNL 2018 c. 2 lett. c) Integrazione risorse dell’importo annuo della retribuzione individuale di anzianità e degli assegni ad personam in godimento da parte del personale comunque cessato dal servizio l'anno precedente (da inserire solo le nuove risorse che si liberano a partire dalle cessazioni verificatesi nell'anno precedente)." value={data.st_art79c1_art4c2_art67c2c_integrazioneRIA} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.2c CCNL 2018)" />
        <FundingItem id="st_art79c1_art67c2d_risorseRiassorbite165" description="Art. 79 c. 1 CCNL 2022. Art. 67 del CCNL 2018 c. 2 lett. d) Eventuali risorse riassorbite ai sensi dell’art. 2, comma 3 del decreto legislativo 30 marzo 2001, n. 165/2001 (trattamenti economici più favorevoli in godimento)." value={data.st_art79c1_art67c2d_risorseRiassorbite165} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.2d CCNL 2018)" />
        <FundingItem id="st_art79c1_art15c1l_art67c2e_personaleTrasferito" description="Art. 79 c. 1 CCNL 2022. Art. 15 del CCNL 1999 c. 1 lett. l) - art. 67 del CCNL 2018 c. 2 lett. e) Somme connesse al trattamento economico accessorio del personale trasferito agli enti del comparto a seguito processi di decentramento e delega di funzioni." value={data.st_art79c1_art15c1l_art67c2e_personaleTrasferito} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.2e CCNL 2018)" />
        <FundingItem id="st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig" description="Art. 79 c. 1 CCNL 2022. Art. 15 del CCNL 1999 c. 1 lett. i) - art. 67 del CCNL 2018 c. 2 lett. f) Per le Regioni, quota minori oneri dalla riduzione stabile di posti in organico qualifica dirigenziale, fino a 0,2% monte salari della stessa dirigenza, da destinare al fondo di cui all’art. 17, c. 2, lett. c); sono fatti salvi gli accordi di miglior favore." value={data.st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.2f CCNL 2018)" />
        <FundingItem id="st_art79c1_art14c3_art67c2g_riduzioneStraordinario" description="Art. 79 c. 1 CCNL 2022. Art. 14 del CCNL 1999 c. 3 - art. 67 del CCNL 2018 c. 2 lett. g) Riduzione stabile dello straordinario." value={data.st_art79c1_art14c3_art67c2g_riduzioneStraordinario} onChange={handleChange} riferimentoNormativo="Art. 79 c.1 CCNL 2022 (rif. Art. 67 c.2g CCNL 2018)" />
        <FundingItem id="st_taglioFondoDL78_2010" description="Eventuale taglio del fondo storicizzato - Art. 9 comma 2 bis D.L. n.78/2010 convertito in L.122/2010 Per il triennio 2011/2013 il tetto dei fondi per le risorse decentrate dei dipendenti e dei dirigenti non può superare quello del 2010 ed è ridotto automaticamente in proporzione alla riduzione del personale in servizio e s.m.i. da sottrarre (da inserire solo se l'importo annuale non è stato già ricompreso nell'unico importo storicizzato)." value={data.st_taglioFondoDL78_2010} onChange={handleChange} isSubtractor riferimentoNormativo="Art. 9 c.2bis DL 78/2010" />
        <FundingItem id="st_riduzioniPersonaleATA_PO_Esternalizzazioni" description="Eventuali riduzioni del fondo per personale ATA, posizioni organizzative, processi di esternalizzazione o trasferimento di personale" value={data.st_riduzioniPersonaleATA_PO_Esternalizzazioni} onChange={handleChange} isSubtractor riferimentoNormativo="Specifiche disposizioni/accordi" />
        <FundingItem id="st_art67c1_decurtazionePO_AP_EntiDirigenza" description="Art. 67 c. 1 CCNL 21.05.2018 decurtazione fondo posizioni organizzative e alte professionalità, compreso il risultato, per gli enti con la dirigenza. (da inserire solo se l'importo annuale non è stato già ricompreso nell'unico importo storicizzato)" value={data.st_art67c1_decurtazionePO_AP_EntiDirigenza} onChange={handleChange} isSubtractor riferimentoNormativo="Art. 67 c.1 CCNL 2018" />
        <FundingItem id="st_art79c1b_euro8450" description="Art. 79 c. 1 lett. b) CCNL 2022 Euro 84,50 per n. unità in servizio al 31.12.2018 con decorrenza dal 01.01.2021 (da calcolarsi per intero sulle unità in servizio, risorse non soggette al limite)." value={data.st_art79c1b_euro8450} onChange={handleChange} riferimentoNormativo="Art. 79 c.1b CCNL 2022" />
        <FundingItem id="st_art79c1c_incrementoStabileConsistenzaPers" description="Art. 79 c. 1 lett. c) CCNL 2022 risorse stanziate dagli enti in caso di incremento stabile della consistenza di personale, in coerenza con il piano dei fabbisogni, al fine di sostenere gli oneri dei maggiori trattamenti economici del personale." value={data.st_art79c1c_incrementoStabileConsistenzaPers} onChange={handleChange} riferimentoNormativo="Art. 79 c.1c CCNL 2022" inputInfo={displayInfoPerArt79c1c}/>
        <FundingItem id="st_art79c1d_differenzialiStipendiali2022" description="Art. 79 c. 1 lett. d) CCNL 2022 differenziali stipendiali personale in servizio nell'anno 2022 (risorse non soggette al limite)." value={data.st_art79c1d_differenzialiStipendiali2022} onChange={handleChange} riferimentoNormativo="Art. 79 c.1d CCNL 2022" />
        <FundingItem id="st_art79c1bis_diffStipendialiB3D3" description="Art. 79 c. 1-bis CCNL 2022 differenze stipendiali personale inquadrato in B3 e D3 (risorse non soggette al limite)." value={data.st_art79c1bis_diffStipendialiB3D3} onChange={handleChange} riferimentoNormativo="Art. 79 c.1-bis CCNL 2022" />
        <FundingItem id="st_incrementoDecretoPA" description={incrementoDecretoPADescription} value={data.st_incrementoDecretoPA} onChange={handleChange} riferimentoNormativo={RIF_INCREMENTO_DECRETO_PA} disabled={!isIncrementoDecretoPAActive} inputInfo={isIncrementoDecretoPAActive ? `Max: ${formatCurrency(maxIncrementoDecretoPA, '0.00')}` : "Attivabile tramite Simulatore"}/>
        <FundingItem id="st_riduzionePerIncrementoEQ" description="Riduzione del fondo per l'incremento delle risorse per le EQ nel limite del fondo. Art. 7 c. 4 lett. u) CCNL 2022" value={data.st_riduzionePerIncrementoEQ} onChange={handleChange} riferimentoNormativo={RIF_ART7_C4_U_CCNL2022} isSubtractor={true} disabled={true} inputInfo="Valore derivato dal Fondo Elevate Qualificazioni"/>
        <SectionTotal label="SOMMA RISORSE STABILI" total={sommaStabili} />
      </Card>

      <Card title="FONTI DI FINANZIAMENTO VARIABILI SOGGETTE AL LIMITE" className="mb-6" isCollapsible={true}>
        {/* ... Existing FundingItem components ... */}
        <FundingItem id="vs_art4c3_art15c1k_art67c3c_recuperoEvasione" description="Art. 4 del CCNL del 5/10/2001 c. 3), art. 15 c. 1 lett. k) CCNL 01.041999 - art. 67 del CCNL del 21.02.2018 c. 3 lett. c) Ricomprende sia le risorse derivanti dalla applicazione dell’art. 3, comma 57 della legge n. 662 del 1996 e dall’art. 59, comma 1, lett. p) del D. Lgs.n.446 del 1997 (recupero evasione ICI), sia le ulteriori risorse correlate agli effetti applicativi dell’art. 12, comma 1, lett. b) del D.L. n. 437 del 1996, convertito nella legge n. 556 del 1996." value={data.vs_art4c3_art15c1k_art67c3c_recuperoEvasione} onChange={handleChange} riferimentoNormativo="Art. 67 c.3c CCNL 2018 (e rif. precedenti)" />
        <FundingItem id="vs_art4c2_art67c3d_integrazioneRIAMensile" description="Art. 4 del CCNL 5/10/2001 c. 2 - art. 67 del CCNL del 21.05.2018 c. 3 lett. d) Integrazione risorse dell’importo mensile residuo della retribuzione individuale di anzianità e degli assegni ad personam in godimento da parte del personale comunque cessato nell'anno in corso." value={data.vs_art4c2_art67c3d_integrazioneRIAMensile} onChange={handleChange} riferimentoNormativo="Art. 67 c.3d CCNL 2018 (e rif. precedenti)" />
        <FundingItem id="vs_art67c3g_personaleCaseGioco" description="Art. 67 del CCNL del 21.05.2018 c. 3 lett. g) Risorse destinate ai trattamenti accessori personale delle case da gioco." value={data.vs_art67c3g_personaleCaseGioco} onChange={handleChange} riferimentoNormativo="Art. 67 c.3g CCNL 2018" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vs_art79c2b_max1_2MonteSalari1997" description="Art. 79 c. 2 lett. b) CCNL 2022 Un importo massimo corrispondente all’1,2 % su base annua, del monte salari dell’anno 1997, relativo al personale destinatario del presente CCNL." value={data.vs_art79c2b_max1_2MonteSalari1997} onChange={handleChange} riferimentoNormativo="Art. 79 c.2b CCNL 2022" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vs_art67c3k_integrazioneArt62c2e_personaleTrasferito" description="Art. 67 del CCNL del 21.05.2018 c. 3 lett. k) Integrazione all'art. 62 del CCNL del 21.02.2018 c. 2 lett. e) somme connesse al trattamento economico accessorio del personale trasferito agli enti del comparto a seguito processi di decentramento e delega di funzioni." value={data.vs_art67c3k_integrazioneArt62c2e_personaleTrasferito} onChange={handleChange} riferimentoNormativo="Art. 67 c.3k CCNL 2018" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vs_art79c2c_risorseScelteOrganizzative" description="Art. 79 c. 2 lett. c) CCNL 2022 Risorse finalizzate ad adeguare le disponibilità del Fondo sulla base di scelte organizzative, gestionali e di politica retributiva degli enti, anche connesse ad assunzioni di personale a tempo determinato." value={data.vs_art79c2c_risorseScelteOrganizzative} onChange={handleChange} riferimentoNormativo="Art. 79 c.2c CCNL 2022" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <SectionTotal label="SOMMA RISORSE VARIABILI SOGGETTE AL LIMITE" total={sommaVariabiliSoggette} />
      </Card>
      
      <Card title="FONTI DI FINANZIAMENTO VARIABILI NON SOGGETTE AL LIMITE" className="mb-6" isCollapsible={true}>
        {/* ... Existing FundingItem components ... */}
        <FundingItem id="vn_art15c1d_art67c3a_sponsorConvenzioni" description="Art. 15 del CCNL 1/4/1999 c. 1 lett. d) - Art. 67 del CCNL del 21.05.2018 c. 3 lett. a) Somme derivanti dall’attuazione dell’art. 43, L. 449/1997 (contratti di nuove sponsorizzazione – convenzioni – contributi dell’utenza per i servizi pubblici non essenziali e misure di incentivazione della produttivita')." value={data.vn_art15c1d_art67c3a_sponsorConvenzioni} onChange={handleChange} riferimentoNormativo="Art. 67 c.3a CCNL 2018 (e rif. precedenti)" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_art54_art67c3f_rimborsoSpeseNotifica" description="Art. 54 CCNL 14/9/2000 - Art. 67 del CCNL del 21.05.2018 c. 3 lett. f) Quota parte rimborso spese per notificazione atti dell’amministrazione finanziaria (messi notificatori)." value={data.vn_art54_art67c3f_rimborsoSpeseNotifica} onChange={handleChange} riferimentoNormativo="Art. 67 c.3f CCNL 2018 (e rif. precedenti)" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione" description="ART. 15 c. 1 lett. K), ART. 16, COMMI 4, 5 e 6 DL 98/2011 - Art. 67 del CCNL del 21.05.2018 c. 3 lett. b) Piani di razionalizzazione e riqualificazione della spesa." value={data.vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione} onChange={handleChange} riferimentoNormativo="Art. 67 c.3b CCNL 2018 (e rif. precedenti)" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_art15c1k_art67c3c_incentiviTecniciCondoni" description="Art. 15 c.1 lett. k) CCNL 1998-2001 - art. 67 del CCNL del 21.05.2018 c. 3 lett. c) Incentivi per funzioni tecniche, art. 45 dlgs 36/2023, art. 76 dlgs 56/2017, per condono edilizio, per repressione illeciti edilizi, indennità centralinisti non vedenti." value={data.vn_art15c1k_art67c3c_incentiviTecniciCondoni} onChange={handleChange} riferimentoNormativo="Art. 67 c.3c CCNL 2018 (e rif. precedenti)" />
        <FundingItem id="vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti" description="Art. 18 c. lett. h) e Art. 67 del CCNL del 21.05.2018 c. 3 lett. c) Incentivi spese del giudizio, compensi censimento e ISTAT." value={data.vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti} onChange={handleChange} riferimentoNormativo="Art. 67 c.3c CCNL 2018 (e rif. precedenti)" />
        <FundingItem id="vn_art15c1m_art67c3e_risparmiStraordinario" description="Art. 15, comma 1, del CCNL 1/4/1999 lett. m) - Art. 67 del CCNL del 21.05.2018 c. 3 lett. e) Eventuali risparmi derivanti dalla applicazione della disciplina dello straordinario di cui all’art. 14." value={data.vn_art15c1m_art67c3e_risparmiStraordinario} onChange={handleChange} riferimentoNormativo="Art. 67 c.3e CCNL 2018 (e rif. precedenti)" />
        <FundingItem id="vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale" description="Art. 67 del CCNL del 21.05.2018 c. 3 lett. j) Per le Regioni a statuto ordinario e Città Metropolitane ai sensi dell'art. 23 c. 4 del dlgs 75/2017 incremento percetuale dell'importo di cui all'art. 67 c. 1 e 2." value={data.vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale} onChange={handleChange} riferimentoNormativo="Art. 67 c.3j CCNL 2018" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_art80c1_sommeNonUtilizzateStabiliPrec" description="Art. 80 c. 1 CCNL 2022, Somme non utilizzate negli esercizi precedenti (di parte stabile)" value={data.vn_art80c1_sommeNonUtilizzateStabiliPrec} onChange={handleChange} riferimentoNormativo="Art. 80 c.1 CCNL 2022" />
        <FundingItem id="vn_l145_art1c1091_incentiviRiscossioneIMUTARI" description="Legge 145 del 30.12.2018 art. 1 c. 1091 Incentivi legati alla riscossione degli accertamenti IMU e TARI." value={data.vn_l145_art1c1091_incentiviRiscossioneIMUTARI} onChange={handleChange} riferimentoNormativo="L. 145/2018 Art.1 c.1091" />
        <FundingItem id="vn_l178_art1c870_risparmiBuoniPasto2020" description="Legge 178/2020 art. 1 c. 870 Risparmi certificati sui buoni pasto non erogati anno 2020." value={data.vn_l178_art1c870_risparmiBuoniPasto2020} onChange={handleChange} riferimentoNormativo="L. 178/2020 Art.1 c.870" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga" description="Dl 135/2018 art. 11 c. 1 lett. b) Risorse accessorie eventuali per le assunzioni finanziate in deroga." value={data.vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga} onChange={handleChange} riferimentoNormativo="DL 135/2018 Art.11 c.1b" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_art79c3_022MonteSalari2018_da2022Proporzionale" description="Art. 79 c. 3 CCNL 2022 0,22% del monte salari anno 2018 con decorrenza dal 01.01.2022, quota d'incremento del fondo proporzionale." value={data.vn_art79c3_022MonteSalari2018_da2022Proporzionale} onChange={handleChange} riferimentoNormativo="Art. 79 c.3 CCNL 2022" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_art79c1b_euro8450_unaTantum2021_2022" description="Art. 79 c. 1 lett. b) CCNL 2022 Euro 84,50 per n. unità in servizio al 31.12.2018, quota una tantum annualità 2021 e 2022." value={data.vn_art79c1b_euro8450_unaTantum2021_2022} onChange={handleChange} riferimentoNormativo="Art. 79 c.1b CCNL 2022" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_art79c3_022MonteSalari2018_da2022UnaTantum2022" description="Art. 79 c. 3 CCNL 2022 0,22% del monte salari anno 2018 con decorrenza dal 01.01.2022, quota d'incremento del fondo proporzionale, una tantum annualità 2022." value={data.vn_art79c3_022MonteSalari2018_da2022UnaTantum2022} onChange={handleChange} riferimentoNormativo="Art. 79 c.3 CCNL 2022" disabled={isEnteInCondizioniSpeciali} inputInfo={isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined} />
        <FundingItem id="vn_dl13_art8c3_incrementoPNRR_max5stabile2016" description="DL 13/2023 art. 8 c. 3. Incremento PNRR (max 5% fondo stabile 2016) per enti che rispettano i requisiti." value={data.vn_dl13_art8c3_incrementoPNRR_max5stabile2016} onChange={handleChange} riferimentoNormativo={RIF_ART8_DL13_2023} disabled={!arePNRR3ConditionsMet || isEnteInCondizioniSpeciali} inputInfo={displayInfoPerPNRR3}/>
        <SectionTotal label="SOMMA RISORSE VARIABILI NON SOGGETTE AL LIMITE" total={sommaVariabiliNonSoggette} />
      </Card>
      
      <Card title="ALTRE RISORSE E DECURTAZIONI FINALI" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
         <FundingItem id="fin_art4_dl16_misureMancatoRispettoVincoli" description="Art. 4 DL 16/2014 Misure conseguenti al mancato rispetto di vincoli finanziari posti alla contrattazione integrativa e all'utilizzo dei relativi fondi" value={data.fin_art4_dl16_misureMancatoRispettoVincoli} onChange={handleChange} isSubtractor riferimentoNormativo="Art. 4 DL 16/2014" />
      </Card>

      <Card title="CALCOLO DEL RISPETTO DEI LIMITI DEL SALARIO ACCESSORIO" className="mb-6" isCollapsible={true}>
        <FundingItem id="calculated_cl_totaleParzialeRisorsePerConfrontoTetto2016" description="Totale parziale risorse disponibili per il fondo (CALCOLATO) ai fini del confronto con il tetto complessivo del salario accessorio dell'anno 2016." value={data.cl_totaleParzialeRisorsePerConfrontoTetto2016} onChange={() => {}} riferimentoNormativo={RIF_ART23_DLGS75_2017} disabled={true} inputInfo="Valore calcolato automaticamente"/>
        <FundingItem id="cl_art23c2_decurtazioneIncrementoAnnualeTetto2016" description="Art. 23 c. 2 dlgs 75/2017 Eventuale decurtazione annuale rispetto il tetto complessivo del salario accessorio dell'anno 2016." value={data.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016} onChange={handleChange} riferimentoNormativo={RIF_ART23_DLGS75_2017} isSubtractor={true} />
      </Card>

      <Card title="TOTALE RISORSE EFFETTIVAMENTE DISPONIBILI" className="mb-6 bg-[#f3e7e8] border-[#d1c0c1]">
        <div className="p-4 text-center">
            <span className="text-2xl font-bold text-[#ea2832]">
            {totaleRisorseDisponibili === undefined || isNaN(totaleRisorseDisponibili) ? TEXTS_UI.notApplicable : `€ ${totaleRisorseDisponibili.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
        </div>
      </Card>

    </div>
  );
};