// hooks/useComplianceChecks.ts
import { CalculatedFund, FundData, ComplianceCheck } from '../types.js';
import { RIF_ART23_DLGS75_2017, LIMITE_INCIDENZA_SALARIO_ACCESSORIO } from '../constants.js';

export const runAllComplianceChecks = (calculatedFund: CalculatedFund, fundData: FundData): ComplianceCheck[] => {
  const checks: ComplianceCheck[] = [];
  const { annualData } = fundData;

  // 1. Verifica Limite Art. 23, comma 2, D.Lgs. 75/2017 (Limite Fondo 2016, modificato) - CALCOLO GLOBALE
  const limiteDaUsarePerConfronto2016 = calculatedFund.limiteArt23C2Modificato !== undefined 
                                      ? calculatedFund.limiteArt23C2Modificato 
                                      : calculatedFund.fondoBase2016;

  if (calculatedFund.superamentoLimite2016 && calculatedFund.superamentoLimite2016 > 0) {
    checks.push({
      id: 'limite_2016_globale', // Rinominato per chiarezza
      descrizione: "Superamento limite Art. 23, c.2, D.Lgs. 75/2017 (Fondo 2016, modificato) - CALCOLO GLOBALE",
      isCompliant: false,
      valoreAttuale: `€ ${calculatedFund.ammontareSoggettoLimite2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limite: `€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      messaggio: `Rilevato superamento del limite storico del 2016 (modificato dal calcolo globale) di € ${calculatedFund.superamentoLimite2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Valutare piano di recupero.`,
      riferimentoNormativo: RIF_ART23_DLGS75_2017,
      gravita: 'error',
    });
  } else {
    checks.push({
      id: 'limite_2016_globale', // Rinominato per chiarezza
      descrizione: "Rispetto limite Art. 23, c.2, D.Lgs. 75/2017 (Fondo 2016, modificato) - CALCOLO GLOBALE",
      isCompliant: true,
      valoreAttuale: `€ ${calculatedFund.ammontareSoggettoLimite2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limite: `€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      messaggio: "Il fondo (calcolo globale) rispetta il limite storico del 2016 (come modificato).",
      riferimentoNormativo: RIF_ART23_DLGS75_2017,
      gravita: 'info',
    });
  }

  // NUOVO CHECK: Verifica Somma Risorse da Fondi Specifici vs. Limite Modificato 2016
  const sommaFondiSpecifici = calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici;
  const superamentoLimiteFondiSpecifici = Math.max(0, sommaFondiSpecifici - limiteDaUsarePerConfronto2016);

  if (superamentoLimiteFondiSpecifici > 0) {
    checks.push({
      id: 'limite_2016_fondi_specifici',
      descrizione: "Superamento limite Art. 23, c.2 (Fondo 2016 modificato) - SOMMA FONDI SPECIFICI",
      isCompliant: false,
      valoreAttuale: `€ ${sommaFondiSpecifici.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limite: `€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      messaggio: `Rilevato superamento del limite storico del 2016 (modificato) di € ${superamentoLimiteFondiSpecifici.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. La somma delle risorse soggette al limite provenienti dai singoli fondi (€ ${sommaFondiSpecifici.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) eccede il limite modificato (€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Si prega di ridurre le risorse complessive del salario accessorio rilevante ai fini dell'art. 23 c. 2 del D.Lgs. n. 75/2017.`,
      riferimentoNormativo: RIF_ART23_DLGS75_2017,
      gravita: 'error',
    });
  } else {
    checks.push({
      id: 'limite_2016_fondi_specifici',
      descrizione: "Rispetto limite Art. 23, c.2 (Fondo 2016 modificato) - SOMMA FONDI SPECIFICI",
      isCompliant: true,
      valoreAttuale: `€ ${sommaFondiSpecifici.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limite: `€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      messaggio: "La somma delle risorse soggette al limite provenienti dai singoli fondi rispetta il limite storico del 2016 (come modificato).",
      riferimentoNormativo: RIF_ART23_DLGS75_2017,
      gravita: 'info',
    });
  }
  
  // 2. Verifica incidenza salario accessorio (punto 4.2 piano indicatori)
  if (annualData.incidenzaSalarioAccessorioUltimoRendiconto !== undefined) {
    const isCompliant = annualData.incidenzaSalarioAccessorioUltimoRendiconto <= LIMITE_INCIDENZA_SALARIO_ACCESSORIO;
    checks.push({
      id: 'incidenza_8_percento',
      descrizione: "Incidenza salario accessorio su spesa totale del personale (ultimo rendiconto)",
      isCompliant: isCompliant,
      valoreAttuale: `${annualData.incidenzaSalarioAccessorioUltimoRendiconto.toFixed(2)}%`,
      limite: `<= ${LIMITE_INCIDENZA_SALARIO_ACCESSORIO}%`,
      messaggio: isCompliant ? "L'incidenza rispetta il limite." : "L'incidenza supera il limite dell'8%. Verificare.",
      riferimentoNormativo: "Punto 4.2 Piano Indicatori e Risultati di Bilancio",
      gravita: isCompliant ? 'info' : 'warning',
    });
  } else {
     checks.push({
      id: 'incidenza_8_percento',
      descrizione: "Incidenza salario accessorio su spesa totale del personale (ultimo rendiconto)",
      isCompliant: true, 
      valoreAttuale: "N/D",
      limite: `<= ${LIMITE_INCIDENZA_SALARIO_ACCESSORIO}%`,
      messaggio: "Dato sull'incidenza del salario accessorio non inserito.",
      riferimentoNormativo: "Punto 4.2 Piano Indicatori e Risultati di Bilancio",
      gravita: 'info',
    });
  }

  // 3. Verifica rispetto equilibrio di bilancio anno precedente
  if (annualData.rispettoEquilibrioBilancioPrecedente !== undefined) {
    checks.push({
        id: 'equilibrio_bilancio',
        descrizione: "Rispetto equilibrio di bilancio anno precedente (Art. 1, c.821, L. 145/2018)",
        isCompliant: !!annualData.rispettoEquilibrioBilancioPrecedente,
        valoreAttuale: annualData.rispettoEquilibrioBilancioPrecedente ? "Rispettato" : "Non Rispettato / Non Dichiarato",
        messaggio: annualData.rispettoEquilibrioBilancioPrecedente ? "Equilibrio di bilancio rispettato." : "Attenzione: equilibrio di bilancio non rispettato o non dichiarato per l'anno precedente.",
        riferimentoNormativo: "Art. 1, c.821, L. 145/2018",
        gravita: annualData.rispettoEquilibrioBilancioPrecedente ? 'info' : 'warning',
    });
  }

  // 4. Verifica approvazione rendiconto anno precedente
  if (annualData.approvazioneRendicontoPrecedente !== undefined) {
    checks.push({
        id: 'approvazione_rendiconto',
        descrizione: "Approvazione rendiconto anno precedente nei termini di legge",
        isCompliant: !!annualData.approvazioneRendicontoPrecedente,
        valoreAttuale: annualData.approvazioneRendicontoPrecedente ? "Approvato" : "Non Approvato / Non Dichiarato",
        messaggio: annualData.approvazioneRendicontoPrecedente ? "Rendiconto approvato." : "Attenzione: rendiconto non approvato o non dichiarato nei termini.",
        riferimentoNormativo: "Normativa Contabile",
        gravita: annualData.approvazioneRendicontoPrecedente ? 'info' : 'warning',
    });
  }
  
  return checks;
};