// hooks/useComplianceChecks.ts
import { CalculatedFund, FundData, ComplianceCheck } from '../types.js';
import { RIF_ART23_DLGS75_2017 } from '../constants.js';
import { calculateFadTotals } from '../pages/FondoAccessorioDipendentePageHelpers.js'; // Importato helper per i totali FAD

export const runAllComplianceChecks = (calculatedFund: CalculatedFund, fundData: FundData): ComplianceCheck[] => {
  const checks: ComplianceCheck[] = [];
  const { annualData, fondoAccessorioDipendenteData, fondoElevateQualificazioniData } = fundData;

  // 1. Verifica Limite Art. 23, comma 2, D.Lgs. 75/2017 (Limite Fondo 2016, modificato) - CALCOLO GLOBALE
  const limiteDaUsarePerConfronto2016 = calculatedFund.limiteArt23C2Modificato !== undefined 
                                      ? calculatedFund.limiteArt23C2Modificato 
                                      : calculatedFund.fondoBase2016;
  
  const ammontareSoggettoLimiteGlobale = calculatedFund.ammontareSoggettoLimite2016; // Questo è il valore globale corretto
  const superamentoDelLimiteGlobale = Math.max(0, ammontareSoggettoLimiteGlobale - limiteDaUsarePerConfronto2016);


  if (superamentoDelLimiteGlobale > 0) {
    checks.push({
      id: 'limite_2016_globale', 
      descrizione: "Superamento limite Art. 23, c.2, D.Lgs. 75/2017 (Fondo 2016, modificato) - CALCOLO GLOBALE",
      isCompliant: false,
      valoreAttuale: `€ ${ammontareSoggettoLimiteGlobale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limite: `€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      messaggio: `Il totale delle risorse soggette al limite Art. 23 c.2 (€ ${ammontareSoggettoLimiteGlobale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) supera il limite modificato del fondo 2016 (€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) di € ${superamentoDelLimiteGlobale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Verificare la composizione del fondo o applicare le necessarie decurtazioni.`,
      riferimentoNormativo: RIF_ART23_DLGS75_2017,
      gravita: 'error',
    });
  } else {
    checks.push({
      id: 'limite_2016_globale',
      descrizione: "Rispetto limite Art. 23, c.2, D.Lgs. 75/2017 (Fondo 2016, modificato) - CALCOLO GLOBALE",
      isCompliant: true,
      valoreAttuale: `€ ${ammontareSoggettoLimiteGlobale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      limite: `€ ${limiteDaUsarePerConfronto2016.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      messaggio: "Il fondo (calcolo globale) rispetta il limite storico del 2016 (come modificato).",
      riferimentoNormativo: RIF_ART23_DLGS75_2017,
      gravita: 'info',
    });
  }

  // Il check 'limite_2016_fondi_specifici' è stato rimosso come da richiesta (doppione).
  
  // 2. Verifica incidenza salario accessorio (Nuova logica con limite 48%)
  const { simulatoreRisultati, isEnteDissestato, isEnteStrutturalmenteDeficitario, isEnteRiequilibrioFinanziario } = annualData;
  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;
  const incrementoEQconRiduzioneDipendenti = fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti;

  const fadTotals = calculateFadTotals(
      fondoAccessorioDipendenteData || {}, 
      simulatoreRisultati,
      isEnteInCondizioniSpeciali,
      incrementoEQconRiduzioneDipendenti
  );
  const sommaStabiliDipendenti = fadTotals.sommaStabili_Dipendenti;

  const eqData = fondoElevateQualificazioniData || {};
  const sommaRisorseSpecificheEQ =
      (eqData.ris_fondoPO2017 || 0) +
      (eqData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
      (eqData.ris_incrementoLimiteArt23c2_DL34 || 0) +
      (eqData.ris_incremento022MonteSalari2018 || 0) -
      (eqData.fin_art23c2_adeguamentoTetto2016 || 0);
  
  const spesaPersonale2023 = annualData.simulatoreInput?.simSpesaPersonaleConsuntivo2023;
  let incidenzaCalcolata: number | undefined = undefined;
  let messaggioIncidenza = "";
  const LIMITE_INCIDENZA_48_PERCENTO = 48;

  if (spesaPersonale2023 !== undefined && spesaPersonale2023 > 0) {
      const totaleAccessorioPerIncidenza = sommaStabiliDipendenti + sommaRisorseSpecificheEQ;
      incidenzaCalcolata = (totaleAccessorioPerIncidenza / spesaPersonale2023) * 100;
  } else {
      messaggioIncidenza = "Spesa del personale (Consuntivo 2023) non definita nel Simulatore Incremento. Impossibile calcolare l'incidenza.";
  }

  const isIncidenzaCompliant = incidenzaCalcolata !== undefined ? incidenzaCalcolata <= LIMITE_INCIDENZA_48_PERCENTO : true;
  let gravitaIncidenza: 'info' | 'warning' | 'error' = 'info';

  if (incidenzaCalcolata === undefined) {
      // messaggioIncidenza already set
      gravitaIncidenza = 'warning'; // Dato mancante per il calcolo
  } else if (!isIncidenzaCompliant) {
      messaggioIncidenza = `L'incidenza (${incidenzaCalcolata.toFixed(2)}%) supera il limite del ${LIMITE_INCIDENZA_48_PERCENTO}%. Verificare.`;
      gravitaIncidenza = 'error';
  } else {
      messaggioIncidenza = `L'incidenza (${incidenzaCalcolata.toFixed(2)}%) rispetta il limite del ${LIMITE_INCIDENZA_48_PERCENTO}%.`;
  }

  checks.push({
    id: 'incidenza_accessorio_su_spesapersonale', // Nuovo ID
    descrizione: "Incidenza salario accessorio su spesa totale del personale",
    isCompliant: isIncidenzaCompliant,
    valoreAttuale: incidenzaCalcolata !== undefined ? `${incidenzaCalcolata.toFixed(2)}%` : "N/D",
    limite: `<= ${LIMITE_INCIDENZA_48_PERCENTO}%`,
    messaggio: messaggioIncidenza,
    riferimentoNormativo: "Indicatore di Sostenibilità (Obiettivo Gestionale / Art. 14 DL 25/2025 correlato)", 
    gravita: gravitaIncidenza,
  });


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