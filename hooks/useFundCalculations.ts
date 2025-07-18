// hooks/useFundCalculations.ts
import { FundData, CalculatedFund, FundComponent, EmployeeCategory } from '../types.js';
import { calculateFadTotals } from '../pages/FondoAccessorioDipendentePageHelpers.js';
import {
  VALORE_PROCAPITE_ART67_CCNL2018,
  VALORE_PROCAPITE_ART79_CCNL2022_B,
  RIF_ART67_CCNL2018,
  RIF_ART79_CCNL2022,
  RIF_ART33_DL34_2019,
  RIF_ART14_DL25_2025,
  LIMITE_INCREMENTO_VIRTUOSI_DL25_2025,
  RIF_ART8_DL13_2023,
  LIMITE_INCREMENTO_PNRR_DL13_2023,
  RIF_ART45_DLGS36_2023,
  RIF_ART208_CDS,
  RIF_ART23_DLGS75_2017
} from '../constants.js';

export const calculateFundCompletely = (fundData: FundData): CalculatedFund => {
  const { 
    historicalData, 
    annualData, 
    fondoAccessorioDipendenteData,
    fondoElevateQualificazioniData,
    fondoSegretarioComunaleData,
    fondoDirigenzaData 
  } = fundData;

  const fondoBase2016_originale = 
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0);
    
  // --- START: Calcolo Incremento Art. 23 c.2 D.Lgs. 75/2017 (su base 2018) ---
  const fondoPersonaleNonDirEQ2018_Art23 = historicalData.fondoPersonaleNonDirEQ2018_Art23 || 0;
  const fondoEQ2018_Art23 = historicalData.fondoEQ2018_Art23 || 0;
  const fondoBase2018_perArt23 = fondoPersonaleNonDirEQ2018_Art23 + fondoEQ2018_Art23;

  let dipendentiEquivalenti2018_Art23 = 0;
  if (annualData.personale2018PerArt23) {
    dipendentiEquivalenti2018_Art23 = annualData.personale2018PerArt23.reduce((sum, emp) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >=0 && emp.partTimePercentage <=100) ? emp.partTimePercentage / 100 : 0;
      return sum + ptPerc;
    }, 0);
  }

  let dipendentiEquivalentiAnnoRif_Art23 = 0;
  if (annualData.personaleAnnoRifPerArt23) {
    dipendentiEquivalentiAnnoRif_Art23 = annualData.personaleAnnoRifPerArt23.reduce((sum, emp) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >=0 && emp.partTimePercentage <=100) ? emp.partTimePercentage / 100 : 0;
      const cedolini = (typeof emp.cedoliniEmessi === 'number' && emp.cedoliniEmessi >=0 && emp.cedoliniEmessi <=12) ? emp.cedoliniEmessi : 0;
      const cedoliniRatio = cedolini > 0 ? cedolini / 12 : 0;
      return sum + (ptPerc * cedoliniRatio);
    }, 0);
  }
  
  let valoreIncrementoLordoArt23C2 = 0;
  if (fondoBase2018_perArt23 > 0 && dipendentiEquivalenti2018_Art23 > 0) {
    const valoreMedioProCapite2018_Art23 = fondoBase2018_perArt23 / dipendentiEquivalenti2018_Art23;
    const differenzaDipendenti_Art23 = dipendentiEquivalentiAnnoRif_Art23 - dipendentiEquivalenti2018_Art23;
    valoreIncrementoLordoArt23C2 = valoreMedioProCapite2018_Art23 * differenzaDipendenti_Art23;
  }
  const importoEffettivoAdeguamentoArt23C2 = Math.max(0, valoreIncrementoLordoArt23C2);


  const incrementoDeterminatoArt23C2: FundComponent | undefined = importoEffettivoAdeguamentoArt23C2 > 0 ? {
    descrizione: `Adeguamento fondo per variazione personale (Art. 23 c.2 D.Lgs. 75/2017, base 2018)`,
    importo: importoEffettivoAdeguamentoArt23C2,
    riferimento: RIF_ART23_DLGS75_2017,
    tipo: 'stabile',
    esclusoDalLimite2016: false, 
  } : undefined;
  // --- END: Calcolo Incremento Art. 23 c.2 ---


  const personale2018_perArt33 = historicalData.personaleServizio2018 || 0; 
  const spesaStipendiTabellari2023_perArt14 = historicalData.spesaStipendiTabellari2023 || 0;

  const personaleNonDirigenteEQAttuale_perArt33 = annualData.personaleServizioAttuale
    .filter(p => p.category === EmployeeCategory.DIPENDENTE || p.category === EmployeeCategory.EQ)
    .reduce((sum, p) => sum + (p.count || 0), 0);
  const personaleTotaleAttuale_perArt33 = annualData.personaleServizioAttuale
    .reduce((sum, p) => sum + (p.count || 0), 0);


  // --- COMPONENTE STABILE (Calcolo Globale) ---
  const incrementiStabiliCCNL: FundComponent[] = [];

  if (personale2018_perArt33 > 0) { 
    const importoArt67 = personale2018_perArt33 * VALORE_PROCAPITE_ART67_CCNL2018;
    incrementiStabiliCCNL.push({
      descrizione: `Incremento stabile CCNL (${VALORE_PROCAPITE_ART67_CCNL2018}€ pro-capite su personale 2018 per Art.33)`,
      importo: importoArt67,
      riferimento: RIF_ART67_CCNL2018, 
      tipo: 'stabile',
      esclusoDalLimite2016: false, 
    });
  }
  
  if (personaleNonDirigenteEQAttuale_perArt33 > 0) {
    const importoArt79b = personaleNonDirigenteEQAttuale_perArt33 * VALORE_PROCAPITE_ART79_CCNL2022_B;
    incrementiStabiliCCNL.push({
      descrizione: `Incremento stabile CCNL (${VALORE_PROCAPITE_ART79_CCNL2022_B}€ pro-capite personale non Dir/EQ per Art.33)`,
      importo: importoArt79b,
      riferimento: `${RIF_ART79_CCNL2022} lett. b)`,
      tipo: 'stabile',
      esclusoDalLimite2016: false, 
    });
  }

  let importoAdeguamentoProCapiteArt33 = 0;
  const valoreMedioProCapite2018_Art33 = (personale2018_perArt33 > 0 && fondoBase2016_originale > 0) 
                                        ? fondoBase2016_originale / personale2018_perArt33 
                                        : 0;
  if (valoreMedioProCapite2018_Art33 > 0) {
    importoAdeguamentoProCapiteArt33 = (personaleTotaleAttuale_perArt33 - personale2018_perArt33) * valoreMedioProCapite2018_Art33;
  }
  const adeguamentoProCapite: FundComponent = { 
    descrizione: "Adeguamento invarianza valore medio pro-capite 2018 (Art. 33 DL 34/2019)",
    importo: importoAdeguamentoProCapiteArt33,
    riferimento: RIF_ART33_DL34_2019,
    tipo: 'stabile',
    esclusoDalLimite2016: false, 
  };

  let incrementoOpzionaleVirtuosi: FundComponent | undefined = undefined;
  if (annualData.condizioniVirtuositaFinanziariaSoddisfatte && spesaStipendiTabellari2023_perArt14 > 0) {
    const importoMaxIncremento48 = spesaStipendiTabellari2023_perArt14 * LIMITE_INCREMENTO_VIRTUOSI_DL25_2025;
    incrementoOpzionaleVirtuosi = {
      descrizione: "Incremento facoltativo enti virtuosi (max 48% stip. tab. non dir. 2023)",
      importo: importoMaxIncremento48, 
      riferimento: RIF_ART14_DL25_2025,
      tipo: 'stabile',
      esclusoDalLimite2016: false, 
    };
  }

  const fadTotals = calculateFadTotals(
    fondoAccessorioDipendenteData || {},
    annualData.simulatoreRisultati,
    !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario,
    fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti
  );

  const totaleComponenteStabile = fadTotals.sommaStabili_Dipendenti;
  const totaleComponenteVariabile = fadTotals.sommaVariabiliSoggette_Dipendenti + fadTotals.sommaVariabiliNonSoggette_Dipendenti;
  const risorseVariabili: FundComponent[] = []; // Placeholder, as the detailed components are not needed for the summary
  const totaleFondoRisorseDecentrate = totaleComponenteStabile + totaleComponenteVariabile;

  const limiteArt23C2Modificato = fondoBase2016_originale + (incrementoDeterminatoArt23C2?.importo || 0);

  // Ammontare soggetto al limite (calcolo globale per compliance check esistente)
  const ammontareSoggettoLimite2016_global = 
    fondoBase2016_originale + 
    incrementiStabiliCCNL.filter(c => !c.esclusoDalLimite2016).reduce((s,c)=>s+c.importo,0) +
    (adeguamentoProCapite.esclusoDalLimite2016 ? 0 : adeguamentoProCapite.importo) +
    (incrementoDeterminatoArt23C2 && !incrementoDeterminatoArt23C2.esclusoDalLimite2016 ? incrementoDeterminatoArt23C2.importo : 0) +
    (incrementoOpzionaleVirtuosi && !incrementoOpzionaleVirtuosi.esclusoDalLimite2016 ? incrementoOpzionaleVirtuosi.importo : 0) +
    risorseVariabili.filter(c => !c.esclusoDalLimite2016).reduce((s,c)=>s+c.importo,0);
  
  const superamentoDelLimite2016 = Math.max(0, ammontareSoggettoLimite2016_global - limiteArt23C2Modificato);

  // --- Calcolo Somma Risorse Soggette al Limite dai Singoli Fondi Specifici ---
  const dipendenti_soggette = fondoAccessorioDipendenteData?.cl_totaleParzialeRisorsePerConfrontoTetto2016 || 0;
  
  let eq_soggette = 0;
  if (fondoElevateQualificazioniData) {
    eq_soggette = (fondoElevateQualificazioniData.ris_fondoPO2017 || 0) +
                  (fondoElevateQualificazioniData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
                  (fondoElevateQualificazioniData.ris_incrementoLimiteArt23c2_DL34 || 0) -
                  (fondoElevateQualificazioniData.fin_art23c2_adeguamentoTetto2016 || 0);
  }

  const segretario_soggette = fondoSegretarioComunaleData?.fin_totaleRisorseRilevantiLimite || 0;
  const dirigenti_soggette = fondoDirigenzaData?.lim_totaleParzialeRisorseConfrontoTetto2016 || 0;

  const totaleRisorseSoggetteAlLimiteDaFondiSpecifici = 
    dipendenti_soggette + 
    eq_soggette + 
    segretario_soggette + 
    (annualData.hasDirigenza ? dirigenti_soggette : 0); // Include dirigenti solo se hasDirigenza è true

  return {
    fondoBase2016: fondoBase2016_originale,
    incrementiStabiliCCNL,
    adeguamentoProCapite, 
    incrementoDeterminatoArt23C2, 
    incrementoOpzionaleVirtuosi,
    totaleComponenteStabile,
    risorseVariabili,
    totaleComponenteVariabile,
    totaleFondoRisorseDecentrate,
    limiteArt23C2Modificato, 
    ammontareSoggettoLimite2016: ammontareSoggettoLimite2016_global, 
    superamentoLimite2016: superamentoDelLimite2016 > 0 ? superamentoDelLimite2016 : undefined,
    totaleRisorseSoggetteAlLimiteDaFondiSpecifici, // Nuovo campo
  };
};