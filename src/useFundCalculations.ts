// src/useFundCalculations.ts
import { FundData, CalculatedFund, FundComponent, EmployeeCategory } from '../types.js';
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
  RIF_ART208_CDS
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

  const fondoBase2016 = 
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0);
    
  const personale2018 = historicalData.personaleServizio2018 || 0;

  const personaleNonDirigenteEQAttuale = annualData.personaleServizioAttuale
    .filter(p => p.category === EmployeeCategory.DIPENDENTE || p.category === EmployeeCategory.EQ)
    .reduce((sum, p) => sum + (p.count || 0), 0);

  const personaleTotaleAttuale = annualData.personaleServizioAttuale
    .reduce((sum, p) => sum + (p.count || 0), 0);

  // --- COMPONENTE STABILE ---
  const incrementiStabiliCCNL: FundComponent[] = [];

  // Art. 67, c.2, CCNL 2018 (€83,20 pro-capite)
  if (personale2018 > 0) { 
    const importoArt67 = personale2018 * VALORE_PROCAPITE_ART67_CCNL2018;
    incrementiStabiliCCNL.push({
      descrizione: `Incremento stabile CCNL (es. ${VALORE_PROCAPITE_ART67_CCNL2018}€ pro-capite su personale 2018)`,
      importo: importoArt67,
      riferimento: RIF_ART67_CCNL2018, 
      tipo: 'stabile',
      esclusoDalLimite2016: false, 
    });
  }
  
  // Art. 79, c.1, lett. b) CCNL 2022 (€84,50 pro-capite personale non dirigente/EQ)
  if (personaleNonDirigenteEQAttuale > 0) {
    const importoArt79b = personaleNonDirigenteEQAttuale * VALORE_PROCAPITE_ART79_CCNL2022_B;
    incrementiStabiliCCNL.push({
      descrizione: `Incremento stabile CCNL (es. ${VALORE_PROCAPITE_ART79_CCNL2022_B}€ pro-capite personale non Dir/EQ)`,
      importo: importoArt79b,
      riferimento: `${RIF_ART79_CCNL2022} lett. b)`,
      tipo: 'stabile',
      esclusoDalLimite2016: false, 
    });
  }

  // Adeguamento Pro-Capite (Art. 33 D.L. 34/2019)
  let importoAdeguamentoProCapite = 0;
  if (personale2018 > 0 && fondoBase2016 > 0) {
    const valoreMedioProCapite2018 = fondoBase2016 / personale2018; 
    importoAdeguamentoProCapite = (personaleTotaleAttuale - personale2018) * valoreMedioProCapite2018;
  }
  const adeguamentoProCapite: FundComponent = {
    descrizione: "Adeguamento invarianza valore medio pro-capite 2018 (Art. 33 DL 34/2019)",
    importo: importoAdeguamentoProCapite,
    riferimento: RIF_ART33_DL34_2019,
    tipo: 'stabile',
    esclusoDalLimite2016: false, 
  };

  // Incremento Facoltativo per Enti Virtuosi (Art. 14, comma 1-bis, D.L. 25/2025)
  let incrementoOpzionaleVirtuosi: FundComponent | undefined = undefined;
  const spesaStipendiTabellari2023 = historicalData.spesaStipendiTabellari2023 || 0;
  if (annualData.condizioniVirtuositaFinanziariaSoddisfatte && spesaStipendiTabellari2023 > 0) {
    const importoMaxIncremento48 = spesaStipendiTabellari2023 * LIMITE_INCREMENTO_VIRTUOSI_DL25_2025;
    incrementoOpzionaleVirtuosi = {
      descrizione: "Incremento facoltativo enti virtuosi (max 48% stip. tab. non dir. 2023)",
      importo: importoMaxIncremento48, 
      riferimento: RIF_ART14_DL25_2025,
      tipo: 'stabile',
      esclusoDalLimite2016: false, 
    };
  }

  const totaleIncrementiStabiliCCNL = incrementiStabiliCCNL.reduce((sum, item) => sum + item.importo, 0);
  const totaleComponenteStabile = fondoBase2016 + 
                                  totaleIncrementiStabiliCCNL + 
                                  adeguamentoProCapite.importo + 
                                  (incrementoOpzionaleVirtuosi?.importo || 0);

  // --- RISORSE VARIABILI ---
  const risorseVariabili: FundComponent[] = [];

  const proventiArt45 = annualData.proventiSpecifici.find(p => p.riferimentoNormativo === RIF_ART45_DLGS36_2023);
  if (proventiArt45 && proventiArt45.importo && proventiArt45.importo > 0) {
    risorseVariabili.push({
      descrizione: "Incentivi funzioni tecniche",
      importo: proventiArt45.importo,
      riferimento: RIF_ART45_DLGS36_2023,
      tipo: 'variabile',
      esclusoDalLimite2016: true, 
    });
  }

  const proventiArt208 = annualData.proventiSpecifici.find(p => p.riferimentoNormativo === RIF_ART208_CDS);
  if (proventiArt208 && proventiArt208.importo && proventiArt208.importo > 0) {
    risorseVariabili.push({
      descrizione: "Proventi Codice della Strada (quota destinata)",
      importo: proventiArt208.importo,
      riferimento: RIF_ART208_CDS,
      tipo: 'variabile',
      esclusoDalLimite2016: false, 
    });
  }
  
   annualData.proventiSpecifici.filter(p => p.riferimentoNormativo !== RIF_ART45_DLGS36_2023 && p.riferimentoNormativo !== RIF_ART208_CDS).forEach(p => {
    if (p.importo && p.importo > 0) {
        risorseVariabili.push({
            descrizione: p.descrizione,
            importo: p.importo,
            riferimento: p.riferimentoNormativo,
            tipo: 'variabile',
            esclusoDalLimite2016: false 
        });
    }
  });

  if (annualData.condizioniVirtuositaFinanziariaSoddisfatte && annualData.incentiviPNRROpMisureStraordinarie && annualData.incentiviPNRROpMisureStraordinarie > 0) {
    const limitePNRR = fondoBase2016 * LIMITE_INCREMENTO_PNRR_DL13_2023;
    const importoEffettivoPNRR = Math.min(annualData.incentiviPNRROpMisureStraordinarie, limitePNRR);
    risorseVariabili.push({
      descrizione: "Incremento variabile PNRR/Misure Straordinarie (fino a 5% del fondo stabile 2016)",
      importo: importoEffettivoPNRR,
      riferimento: RIF_ART8_DL13_2023, 
      tipo: 'variabile',
      esclusoDalLimite2016: true, 
    });
  }
  
  const totaleComponenteVariabile = risorseVariabili.reduce((sum, item) => sum + item.importo, 0);
  const totaleFondoRisorseDecentrate = totaleComponenteStabile + totaleComponenteVariabile;

  const ammontareSoggettoLimite2016 = 
    fondoBase2016 + 
    incrementiStabiliCCNL.filter(c => !c.esclusoDalLimite2016).reduce((s,c)=>s+c.importo,0) +
    (adeguamentoProCapite.esclusoDalLimite2016 ? 0 : adeguamentoProCapite.importo) + 
    (incrementoOpzionaleVirtuosi && !incrementoOpzionaleVirtuosi.esclusoDalLimite2016 ? incrementoOpzionaleVirtuosi.importo : 0) +
    risorseVariabili.filter(c => !c.esclusoDalLimite2016).reduce((s,c)=>s+c.importo,0);
  
  const superamentoLimite2016 = Math.max(0, ammontareSoggettoLimite2016 - fondoBase2016);

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
    (annualData.hasDirigenza ? dirigenti_soggette : 0);

  return {
    fondoBase2016,
    incrementiStabiliCCNL,
    adeguamentoProCapite,
    // incrementoDeterminatoArt23C2, // This property is optional in CalculatedFund and not calculated here.
    incrementoOpzionaleVirtuosi,
    totaleComponenteStabile,
    risorseVariabili,
    totaleComponenteVariabile,
    totaleFondoRisorseDecentrate,
    // limiteArt23C2Modificato, // This property is optional in CalculatedFund and not calculated here.
    ammontareSoggettoLimite2016,
    superamentoLimite2016: superamentoLimite2016 > 0 ? superamentoLimite2016 : undefined,
    totaleRisorseSoggetteAlLimiteDaFondiSpecifici,
  };
};
