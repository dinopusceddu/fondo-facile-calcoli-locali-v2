// components/dataInput/Art23EmployeeAndIncrementForm.tsx
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.js';
import { HistoricalData } from '../../types.js';
import { Input } from '../shared/Input.js';
import { Button } from '../shared/Button.js';
import { Card } from '../shared/Card.js';
import { TEXTS_UI } from '../../constants.js';
import { Art23EmployeeEntryPage } from '../../pages/Art23EmployeeEntryPage.js';

const formatNumberForDisplay = (value?: number, digits = 2) => {
  if (value === undefined || value === null || isNaN(value)) return TEXTS_UI.notApplicable;
  return value.toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return TEXTS_UI.notApplicable;
    return `€ ${formatNumberForDisplay(value)}`;
};


export const Art23EmployeeAndIncrementForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { historicalData, annualData } = state.fundData;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleHistoricalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = value === '' ? undefined : parseFloat(value);
    dispatch({ type: 'UPDATE_HISTORICAL_DATA', payload: { [name]: processedValue } as Partial<HistoricalData> });
  };
  
  const fondoPersonale2018Art23 = historicalData.fondoPersonaleNonDirEQ2018_Art23 || 0;
  const fondoEQ2018Art23 = historicalData.fondoEQ2018_Art23 || 0;
  const fondoBase2018Complessivo = fondoPersonale2018Art23 + fondoEQ2018Art23;

  const dipendentiEquivalenti2018 = annualData.personale2018PerArt23.reduce((sum, emp) => {
    return sum + ((emp.partTimePercentage || 0) / 100);
  }, 0);

  const dipendentiEquivalentiAnnoRif = annualData.personaleAnnoRifPerArt23.reduce((sum, emp) => {
    const ptPerc = (emp.partTimePercentage || 0) / 100;
    const cedoliniRatio = emp.cedoliniEmessi !== undefined && emp.cedoliniEmessi > 0 && emp.cedoliniEmessi <=12 ? emp.cedoliniEmessi / 12 : 0;
    return sum + (ptPerc * cedoliniRatio);
  }, 0);

  let valoreMedioProCapite2018 = 0;
  if (fondoBase2018Complessivo > 0 && dipendentiEquivalenti2018 > 0) {
    valoreMedioProCapite2018 = fondoBase2018Complessivo / dipendentiEquivalenti2018;
  }
  const variazioneDipendenti = dipendentiEquivalentiAnnoRif - dipendentiEquivalenti2018;
  const incrementoLordoCalculated = valoreMedioProCapite2018 * variazioneDipendenti;
  const incrementoNettoPerLimite2016 = Math.max(0, incrementoLordoCalculated);

  const limiteComplessivoOriginale2016 = 
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0);

  const nuovoLimiteArt23Complessivo = limiteComplessivoOriginale2016 + incrementoNettoPerLimite2016;

  return (
    <>
    <Card title="Adeguamento Limite Fondo 2016 (Art. 23 c.2 D.Lgs. 75/2017 - Variazione Personale su Base 2018)" className="mb-8">
      <p className="text-sm text-[#5f5252] mb-4">Questa sezione calcola l'adeguamento del limite del fondo 2016 in base alla variazione del numero di dipendenti equivalenti tra il 31.12.2018 e l'anno di riferimento, utilizzando i fondi del personale non dirigente/EQ del 2018 come base di calcolo per il valore pro-capite.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0 mb-6">
        <Input
          label="Fondo Personale (non Dir/EQ) 2018 (per Art. 23c2) (€)"
          type="number"
          id="fondoPersonaleNonDirEQ2018_Art23"
          name="fondoPersonaleNonDirEQ2018_Art23"
          value={historicalData.fondoPersonaleNonDirEQ2018_Art23 ?? ''}
          onChange={handleHistoricalChange}
          placeholder="Es. 100000.00"
          step="0.01"
          aria-required="true"
          containerClassName="mb-3"
        />
        <Input
          label="Fondo Elevate Qualificazioni (EQ) 2018 (per Art. 23c2) (€)"
          type="number"
          id="fondoEQ2018_Art23"
          name="fondoEQ2018_Art23"
          value={historicalData.fondoEQ2018_Art23 ?? ''}
          onChange={handleHistoricalChange}
          placeholder="Es. 10000.00"
          step="0.01"
          containerClassName="mb-3"
        />
      </div>
       <div className="mb-6 p-4 bg-[#f3e7e8] border border-[#f3e7e8] rounded-lg">
         <p className="text-base font-medium text-[#1b0e0e]">Fondo Base 2018 Complessivo (per Art. 23c2): 
            <strong className="ml-2 text-[#1b0e0e]">{formatCurrency(fondoBase2018Complessivo)}</strong>
         </p>
      </div>

      <div className="mb-6">
          <Button variant="secondary" size="lg" onClick={() => setIsModalOpen(true)}>
            Gestisci Personale per Calcolo Art. 23 c.2
          </Button>
          <p className="text-xs text-[#5f5252] mt-2">
            Clicca qui per aggiungere, modificare o rimuovere i dipendenti per gli anni 2018 e {annualData.annoRiferimento}.
          </p>
      </div>
      
      <div className="mt-6 p-4 bg-[#f3e7e8] border border-[#f3e7e8] rounded-lg space-y-2">
        <h4 className="text-lg font-bold text-[#ea2832] mb-2">Risultati Calcolo Adeguamento Art. 23 c.2</h4>
        <p className="text-sm">Totale Dipendenti Equivalenti 2018: <strong className="ml-1">{formatNumberForDisplay(dipendentiEquivalenti2018)}</strong></p>
        <p className="text-sm">Totale Dipendenti Equivalenti Anno {annualData.annoRiferimento}: <strong className="ml-1">{formatNumberForDisplay(dipendentiEquivalentiAnnoRif)}</strong></p>
        <hr className="my-2 border-[#d1c0c1]"/>
        <p className="text-sm">Valore Medio Pro-Capite 2018 (Art. 23c2): <strong className="ml-1">{formatCurrency(valoreMedioProCapite2018)}</strong></p>
        <p className="text-sm">Variazione Dipendenti Equivalenti (Anno {annualData.annoRiferimento} vs 2018): <strong className="ml-1">{formatNumberForDisplay(variazioneDipendenti)}</strong></p>
        <p className="text-sm">Incremento / Decremento Lordo Limite Fondo 2016 (Art. 23c2): 
            <strong className={`ml-2 ${incrementoLordoCalculated >= 0 ? 'text-green-600' : 'text-[#ea2832]'}`}>
                {formatCurrency(incrementoLordoCalculated)}
            </strong>
        </p>
        <p className="text-sm font-medium">Incremento Netto da sommare al Limite 2016 (Art. 23c2, non negativo): 
            <strong className={`ml-2 text-green-600`}>
                {formatCurrency(incrementoNettoPerLimite2016)}
            </strong>
        </p>
        <hr className="my-2 border-[#d1c0c1]"/>
        <p className="text-base font-medium">Limite Complessivo Art. 23 c.2 D.Lgs. 75/2017 (originario 2016): 
            <strong className="ml-2">{formatCurrency(limiteComplessivoOriginale2016)}</strong>
        </p>
         <p className="text-lg font-bold text-[#ea2832]">Nuovo Limite Art. 23 c.2 D.Lgs. 75/2017 (modificato): 
            <strong className="ml-2">
                {formatCurrency(nuovoLimiteArt23Complessivo)}
            </strong>
        </p>
        <p className="text-xs text-[#5f5252] mt-1">L'incremento netto (se positivo) verrà sommato al limite del fondo 2016 originale e aggiunto come componente stabile del fondo. Se l'adeguamento calcolato fosse negativo, si considera un incremento pari a zero.</p>
      </div>
    </Card>
    {isModalOpen && <Art23EmployeeEntryPage onClose={() => setIsModalOpen(false)} />}
    </>
  );
};