// pages/FondoDirigenzaPage.tsx
import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { FondoDirigenzaData } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI, RIF_CCNL_DIR_17122020_ART57C2A, RIF_CCNL_DIR_17122020_ART56C1, RIF_CCNL_DIR_17122020_ART57C2C, RIF_CCNL_DIR_17122020_ART57C2E, RIF_CCNL_DIR_16072024_ART39C1, RIF_CCNL_DIR_17122020_ART57C2B, RIF_CCNL_DIR_17122020_ART57C2D, RIF_CCNL_DIR_17122020_ART57C3, RIF_ART8_DL13_2023, RIF_CCNL_DIR_16072024_ART39C2, RIF_ART33_DL34_2019, RIF_ART23_DLGS75_2017, RIF_DL16_2014_ART4 } from '../constants.js';
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


export const FondoDirigenzaPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const data = state.fundData.fondoDirigenzaData || {} as FondoDirigenzaData;

  const handleChange = (field: keyof FondoDirigenzaData, value?: number) => {
    dispatch({ type: 'UPDATE_FONDO_DIRIGENZA_DATA', payload: { [field]: value } });
  };
  
  const sommaRisorseStabili = 
    (data.st_art57c2a_CCNL2020_unicoImporto2020 || 0) +
    (data.st_art57c2a_CCNL2020_riaPersonaleCessato2020 || 0) +
    (data.st_art56c1_CCNL2020_incremento1_53MonteSalari2015 || 0) +
    (data.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo || 0) +
    (data.st_art57c2e_CCNL2020_risorseAutonomeStabili || 0) +
    (data.st_art39c1_CCNL2024_incremento2_01MonteSalari2018 || 0);

  const sommaRisorseVariabili =
    (data.va_art57c2b_CCNL2020_risorseLeggeSponsor || 0) +
    (data.va_art57c2d_CCNL2020_sommeOnnicomprensivita || 0) +
    (data.va_art57c2e_CCNL2020_risorseAutonomeVariabili || 0) +
    (data.va_art57c3_CCNL2020_residuiAnnoPrecedente || 0) +
    (data.va_dl13_2023_art8c3_incrementoPNRR || 0) +
    (data.va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020 || 0) +
    (data.va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023 || 0) +
    (data.va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione || 0) +
    (data.va_art33c2_DL34_2019_incrementoDeroga || 0);
    
  const lim_totaleParzialeRisorseConfrontoTetto2016_calculated =
    (data.st_art57c2a_CCNL2020_unicoImporto2020 || 0) +
    (data.st_art57c2a_CCNL2020_riaPersonaleCessato2020 || 0) +
    (data.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo || 0) +
    (data.st_art57c2e_CCNL2020_risorseAutonomeStabili || 0) +
    (data.va_art57c2d_CCNL2020_sommeOnnicomprensivita || 0) +
    (data.va_art57c2e_CCNL2020_risorseAutonomeVariabili || 0) +
    (data.va_art33c2_DL34_2019_incrementoDeroga || 0);

  useEffect(() => {
    if (data.lim_totaleParzialeRisorseConfrontoTetto2016 !== lim_totaleParzialeRisorseConfrontoTetto2016_calculated) {
      dispatch({
        type: 'UPDATE_FONDO_DIRIGENZA_DATA',
        payload: { lim_totaleParzialeRisorseConfrontoTetto2016: isNaN(lim_totaleParzialeRisorseConfrontoTetto2016_calculated) ? 0 : lim_totaleParzialeRisorseConfrontoTetto2016_calculated }
      });
    }
  }, [data.lim_totaleParzialeRisorseConfrontoTetto2016, lim_totaleParzialeRisorseConfrontoTetto2016_calculated, dispatch]);
  
  const totaleRisorseEffettivamenteDisponibili = 
    sommaRisorseStabili + 
    sommaRisorseVariabili +
    (data.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 || 0) -
    (data.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0);

  const infoTotaleRisorseRilevantiLimite = `Calcolato automaticamente come somma di: Unico Importo 2020, RIA Personale Cessato 2020, RIA Cessati Anno Successivo, Risorse Autonome Stabili, Somme Onnicomprensività, Risorse Autonome Variabili, Incremento Deroga DL 34/2019. Valore base: ${formatCurrency(lim_totaleParzialeRisorseConfrontoTetto2016_calculated)}.`;

  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo Dirigenza</h2>

      <Card title="RISORSE STABILI" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoDirigenzaData> id="st_art57c2a_CCNL2020_unicoImporto2020" description="Unico importo annuale nel quale confluiscono tutte le risorse certe e stabili -negli importi certificati dagli organi di controllo interno di cui all’art. 40-bis, comma 1 del d. lgs. n. 165/2001 - destinate a retribuzione di posizione e di risultato nell’anno di sottoscrizione del presente CCNL (2020)." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C2A} value={data.st_art57c2a_CCNL2020_unicoImporto2020} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="st_art57c2a_CCNL2020_riaPersonaleCessato2020" description="La RIA del personale dirigenziale cessato fino al 31 dicembre del 2020." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C2A} value={data.st_art57c2a_CCNL2020_riaPersonaleCessato2020} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="st_art56c1_CCNL2020_incremento1_53MonteSalari2015" description="A decorrere dal 1° gennaio 2018, le risorse destinate alla retribuzione di posizione e di risultato di cui all’art. 5 del CCNL del 3/8/2010 (biennio economico 2008-2009) per l’Area II, sono incrementate di una percentuale pari all’1,53% da calcolarsi sul monte salari anno 2015, relativo ai dirigenti di cui alla presente Sezione (non soggetto al limite del salario accessorio)." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART56C1} value={data.st_art56c1_CCNL2020_incremento1_53MonteSalari2015} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo" description="Importo corrispondente alle retribuzioni individuali di anzianità non più corrisposte al personale cessato dal servizio dall’anno successivo a quello di sottoscrizione del presente CCNL (anno precedente a quello di competenza del Fondo), compresa la quota di tredicesima mensilità; l’importo confluisce stabilmente nel Fondo, dall’anno successivo alla cessazione dal servizio, in misura intera in ragione d’anno; solo per tale anno successivo, nel Fondo confluiscono altresì i ratei di RIA del personale cessato dal servizio nel corso dell’anno precedente, calcolati in misura pari alle mensilità residue dopo la cessazione, computandosi a tal fine, oltre ai ratei di tredicesima mensilità, le frazioni di mese superiori a quindici giorni." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C2C} value={data.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="st_art57c2e_CCNL2020_risorseAutonomeStabili" description="Risorse autonomamente stanziate dagli enti per adeguare il Fondo alle proprie scelte organizzative e gestionali, in base alla propria capacità di bilancio, ed entro i limiti di cui al comma 1 oltreché nel rispetto delle disposizioni derivanti dai rispettivi ordinamenti finanziari e contabili (componente stabile)." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C2E} value={data.st_art57c2e_CCNL2020_risorseAutonomeStabili} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="st_art39c1_CCNL2024_incremento2_01MonteSalari2018" description="Incremento dello 2,01% del monte salari dirigenza anno 2018 a decorrere dall'anno 2021 (non soggetto al limite del salario accessorio)." riferimentoNormativo={RIF_CCNL_DIR_16072024_ART39C1} value={data.st_art39c1_CCNL2024_incremento2_01MonteSalari2018} onChange={handleChange} />
        <SectionTotal label="SOMMA RISORSE STABILI" total={sommaRisorseStabili} />
      </Card>

      <Card title="RISORSE VARIABILI" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoDirigenzaData> id="va_art57c2b_CCNL2020_risorseLeggeSponsor" description="Risorse previste da disposizioni di legge, ivi comprese quelle di cui all’art. 43 della legge 449/1997 (Contratti di sponsorizzazione ed accordi di collaborazione, convenzioni con soggetti pubblici o privati, contributi dell'utenza per i servizi pubblici non essenziali e misure di incentivazione della produttivita'), di cui all’art. 24, comma 3 del d.lgs. 165/2001 (qualsiasi incarico ad essi conferito in ragione del loro ufficio o comunque conferito dall'amministrazione presso cui prestano servizio o su designazione della stessa)." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C2B} value={data.va_art57c2b_CCNL2020_risorseLeggeSponsor} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_art57c2d_CCNL2020_sommeOnnicomprensivita" description="Le somme connesse all’applicazione del principio di onnicomprensività della retribuzione ai sensi dell’art. 60 (c. 3. Le somme risultanti dall'applicazione del principio dell'onnicomprensività del trattamento economico dei dirigenti, riferite anche ai compensi per incarichi aggiuntivi non connessi direttamente alla posizione dirigenziale attribuita, integrano le risorse destinate al finanziamento della retribuzione di posizione e di risultato, secondo la disciplina dell'art. 57, garantendo comunque una quota a titolo di retribuzione di risultato al dirigente che ha reso la prestazione)." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C2D} value={data.va_art57c2d_CCNL2020_sommeOnnicomprensivita} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_art57c2e_CCNL2020_risorseAutonomeVariabili" description="Risorse autonomamente stanziate dagli enti per adeguare il Fondo alle proprie scelte organizzative e gestionali, in base alla propria capacità di bilancio, ed entro i limiti di cui al comma 1 oltreché nel rispetto delle disposizioni derivanti dai rispettivi ordinamenti finanziari e contabili (componente variabile)." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C2E} value={data.va_art57c2e_CCNL2020_risorseAutonomeVariabili} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_art57c3_CCNL2020_residuiAnnoPrecedente" description="Qualora l’integrale destinazione delle risorse in un determinato anno non sia stata oggettivamente possibile, gli importi residui incrementano una tantum le risorse destinate a retribuzione di risultato del Fondo dell’anno successivo (non soggetto al limite del salario accessorio)." riferimentoNormativo={RIF_CCNL_DIR_17122020_ART57C3} value={data.va_art57c3_CCNL2020_residuiAnnoPrecedente} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_dl13_2023_art8c3_incrementoPNRR" description="Per i segretari comunali e provinciali, la medesima facoltà di incremento percentuale (in misura non superiore al 5 per cento) del trattamento accessorio oltre il limite di cui all'articolo 23, comma 2, del decreto legislativo 25 maggio 2017, n. 75, è calcolata sui valori della retribuzione di posizione, spettanti in base all'ente di titolarità, come definiti dal comma 1 dell'articolo 107 del contratto collettivo nazionale di lavoro relativo al personale dell'area delle funzioni locali, sottoscritto in data 17 dicembre 2020, nonché sul valore della retribuzione di risultato come risultante dai contratti collettivi vigenti." riferimentoNormativo={RIF_ART8_DL13_2023} value={data.va_dl13_2023_art8c3_incrementoPNRR} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020" description="Recupero incremento dello 0,46% del monte salari dirigenza anno 2018 per l'anno 2020 (non soggetto al limite del salario accessorio e al netto degli arretrati contrattuali liquidati)." riferimentoNormativo={RIF_CCNL_DIR_16072024_ART39C1} value={data.va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023" description="Recupero incremento dello 2,01% del monte salari dirigenza anno 2018 per gli anni 2021, 2022 e 2023 (non soggetto al limite del salario accessorioe al netto degli arretrati contrattuali liquidati)." riferimentoNormativo={RIF_CCNL_DIR_16072024_ART39C1} value={data.va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione" description="Incremento fino allo 0,22% del monte salari dirigenza anno 2018 ai fini delle Misure per la valorizzazione del personale e per il riconoscimento del merito (non soggetto al limite del salario accessorio)." riferimentoNormativo={RIF_CCNL_DIR_16072024_ART39C2} value={data.va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione} onChange={handleChange} />
        <FundingItem<FondoDirigenzaData> id="va_art33c2_DL34_2019_incrementoDeroga" description="Eventuale incremento salario accessorio in deroga realizzabile nell'anno." riferimentoNormativo={RIF_ART33_DL34_2019} value={data.va_art33c2_DL34_2019_incrementoDeroga} onChange={handleChange} />
        <SectionTotal label="SOMMA RISORSE VARIABILI" total={sommaRisorseVariabili} />
      </Card>
      
      <Card title="CALCOLO DEL RISPETTO DEI LIMITI DEL SALARIO ACCESSORIO" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoDirigenzaData> id="lim_totaleParzialeRisorseConfrontoTetto2016" description="Totale parziale risorse disponibili per il fondo anno corrente ai fini del confronto con il tetto complessivo del salario accessorio dell'anno 2016." riferimentoNormativo={RIF_ART23_DLGS75_2017} value={data.lim_totaleParzialeRisorseConfrontoTetto2016} onChange={handleChange} disabled={true} inputInfo={infoTotaleRisorseRilevantiLimite}/>
        <FundingItem<FondoDirigenzaData> id="lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016" description="Eventuale decurtazione o aumento annuale rispetto il tetto complessivo del salario accessorio dell'anno 2016." riferimentoNormativo={RIF_ART23_DLGS75_2017} value={data.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016} onChange={handleChange} />
      </Card>

      <Card title="ALTRE RISORSE E DECURTAZIONI FINALI" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoDirigenzaData> id="lim_art4_DL16_2014_misureMancatoRispettoVincoli" description="Art. 4 DL 16/2014 Misure conseguenti al mancato rispetto di vincoli finanziari posti alla contrattazione integrativa e all'utilizzo dei relativi fondi" riferimentoNormativo={RIF_DL16_2014_ART4} value={data.lim_art4_DL16_2014_misureMancatoRispettoVincoli} onChange={handleChange} isSubtractor />
      </Card>
      
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-[#fcf8f8]/80 backdrop-blur-sm border-t border-t-[#f3e7e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[960px] mx-auto flex justify-between items-center">
            <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE DISPONIBILI:</span>
            <span className="text-2xl font-bold text-[#ea2832]">
                {formatCurrency(totaleRisorseEffettivamenteDisponibili)}
            </span>
        </div>
      </div>

    </div>
  );
};