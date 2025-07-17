// hooks/useSimulatoreCalculations.ts
import { SimulatoreIncrementoInput, SimulatoreIncrementoRisultati, TipologiaEnte } from '../types.js';

export const getSogliaSpesaPersonale = (numeroAbitanti?: number, tipologiaEnte?: TipologiaEnte): number => {
  if (numeroAbitanti === undefined || tipologiaEnte === undefined) return 0;

  if (tipologiaEnte === TipologiaEnte.COMUNE) {
    if (numeroAbitanti <= 999) return 29.50;
    if (numeroAbitanti <= 1999) return 28.60;
    if (numeroAbitanti <= 2999) return 27.60;
    if (numeroAbitanti <= 4999) return 27.20;
    if (numeroAbitanti <= 9999) return 26.90;
    if (numeroAbitanti <= 59999) return 27.00;
    if (numeroAbitanti <= 249999) return 27.60;
    if (numeroAbitanti <= 1499999) return 28.80;
    return 25.30; // Oltre 1.500.000
  } else if (tipologiaEnte === TipologiaEnte.PROVINCIA) {
    if (numeroAbitanti <= 250000) return 20.80;
    if (numeroAbitanti <= 349999) return 19.10;
    if (numeroAbitanti <= 449999) return 19.10; 
    if (numeroAbitanti <= 699999) return 19.70;
    return 13.90; // Da 700.000 abitanti in su
  }
  return 0; 
};

export const calculateSimulazione = (
    currentInputs?: SimulatoreIncrementoInput, 
    numAbitanti?: number, 
    tipoEnte?: TipologiaEnte
): SimulatoreIncrementoRisultati | undefined => {
    if (!currentInputs) return undefined;

    const stipendiTabellari2023 = currentInputs.simStipendiTabellari2023 || 0;
    const fondoStabileAnnoApplicazione = currentInputs.simFondoStabileAnnoApplicazione || 0;
    const risorsePOEQAnnoApplicazione = currentInputs.simRisorsePOEQAnnoApplicazione || 0;
    const spesaPersonaleConsuntivo2023 = currentInputs.simSpesaPersonaleConsuntivo2023 || 0;
    const mediaEntrateCorrenti = currentInputs.simMediaEntrateCorrenti2021_2023 || 0;
    const tettoSpesaL296_06 = currentInputs.simTettoSpesaPersonaleL296_06 || 0;
    const costoNuoveAssunzioni = currentInputs.simCostoAnnuoNuoveAssunzioniPIAO || 0;
    const percOneri = currentInputs.simPercentualeOneriIncremento || 0;

    // Fase 1: Incremento Potenziale Massimo (Regola del 48%)
    const fase1_obiettivo48 = stipendiTabellari2023 * 0.48;
    const fase1_fondoAttualeComplessivo = fondoStabileAnnoApplicazione + risorsePOEQAnnoApplicazione;
    const fase1_incrementoPotenzialeLordo = Math.max(0, fase1_obiettivo48 - fase1_fondoAttualeComplessivo);

    // Fase 2: Verifica Limite di Spesa del Personale (DM 17/3/2020)
    const fase2_spesaPersonaleAttualePrevista = spesaPersonaleConsuntivo2023 + costoNuoveAssunzioni;
    const fase2_sogliaPercentualeDM17_03_2020 = getSogliaSpesaPersonale(numAbitanti, tipoEnte);
    const fase2_limiteSostenibileDL34 = mediaEntrateCorrenti * (fase2_sogliaPercentualeDM17_03_2020 / 100);
    const fase2_spazioDisponibileDL34 = Math.max(0, fase2_limiteSostenibileDL34 - fase2_spesaPersonaleAttualePrevista);

    // Fase 3: Verifica Limite del Tetto Storico (L. 296/06)
    const fase3_margineDisponibileL296_06 = Math.max(0, tettoSpesaL296_06 - fase2_spesaPersonaleAttualePrevista);

    // Fase 4: Determinazione dello Spazio Utilizzabile Lordo
    const fase4_spazioUtilizzabileLordo = Math.min(
      fase1_incrementoPotenzialeLordo,
      fase2_spazioDisponibileDL34,
      fase3_margineDisponibileL296_06
    );

    // Fase 5: Calcolo dell'Incremento Netto Effettivo del Fondo
    let fase5_incrementoNettoEffettivoFondo = 0;
    if (percOneri >= 0 && percOneri < 100) { 
        fase5_incrementoNettoEffettivoFondo = fase4_spazioUtilizzabileLordo / (1 + (percOneri / 100));
    } else if (percOneri >=100) { 
        fase5_incrementoNettoEffettivoFondo = 0;
    }


    return {
      fase1_obiettivo48,
      fase1_fondoAttualeComplessivo,
      fase1_incrementoPotenzialeLordo,
      fase2_spesaPersonaleAttualePrevista,
      fase2_sogliaPercentualeDM17_03_2020,
      fase2_limiteSostenibileDL34,
      fase2_spazioDisponibileDL34,
      fase3_margineDisponibileL296_06,
      fase4_spazioUtilizzabileLordo,
      fase5_incrementoNettoEffettivoFondo,
    };
};
