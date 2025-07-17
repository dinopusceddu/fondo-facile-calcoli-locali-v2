// components/dataInput/AnnualDataForm.tsx
import React, { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext.js';
import { AnnualData } from '../../types.js';
import { Input } from '../shared/Input.js';
import { Select } from '../shared/Select.js';
import { Card } from '../shared/Card.js';
import { TEXTS_UI } from '../../constants.js'; 

const booleanOptions = [
  { value: 'true', label: TEXTS_UI.trueText },
  { value: 'false', label: TEXTS_UI.falseText },
];

const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return defaultText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const AnnualDataForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { annualData } = state.fundData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } 
    else if (['rispettoEquilibrioBilancioPrecedente', 
               'rispettoDebitoCommercialePrecedente',
               'approvazioneRendicontoPrecedente',
             ].includes(name)) {
      processedValue = value === 'true' ? true : (value === 'false' ? false : undefined);
      if (value === "") processedValue = undefined;
    }
    
    dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { [name]: processedValue } as Partial<AnnualData> });
  };

  const {
    rispettoEquilibrioBilancioPrecedente,
    rispettoDebitoCommercialePrecedente,
    approvazioneRendicontoPrecedente,
    incidenzaSalarioAccessorioUltimoRendiconto,
    fondoStabile2016PNRR
  } = annualData;

  const isEquilibrioOk = rispettoEquilibrioBilancioPrecedente === true;
  const isDebitoOk = rispettoDebitoCommercialePrecedente === true;
  const isRendicontoOk = approvazioneRendicontoPrecedente === true;
  const isIncidenzaOk = incidenzaSalarioAccessorioUltimoRendiconto !== undefined && incidenzaSalarioAccessorioUltimoRendiconto <= 8;

  const allConditionsMetForPNRR3 = isEquilibrioOk && isDebitoOk && isRendicontoOk && isIncidenzaOk;

  let possibileIncrementoPNRR3 = 0;
  let messaggioIncrementoPNRR3 = "";

  if (allConditionsMetForPNRR3) {
    if (fondoStabile2016PNRR && fondoStabile2016PNRR > 0) {
        possibileIncrementoPNRR3 = fondoStabile2016PNRR * 0.05;
        messaggioIncrementoPNRR3 = "Calcolato come 5% del Fondo Stabile 2016 (PNRR 3).";
    } else {
        messaggioIncrementoPNRR3 = "Inserire il valore del 'Fondo del salario accessorio di parte stabile 2016 (per calcolo PNRR 3)' per calcolare l'incremento.";
        possibileIncrementoPNRR3 = 0;
    }
  } else {
    messaggioIncrementoPNRR3 = "Condizioni di virtuosità finanziaria non soddisfatte per l'incremento PNRR 3:";
    if (!isEquilibrioOk) messaggioIncrementoPNRR3 += "\n- Equilibrio bilancio non rispettato o non specificato.";
    if (!isDebitoOk) messaggioIncrementoPNRR3 += "\n- Parametri debito commerciale non rispettati o non specificati.";
    if (!isRendicontoOk) messaggioIncrementoPNRR3 += "\n- Rendiconto anno precedente non approvato nei termini o non specificato.";
    if (!isIncidenzaOk) {
        messaggioIncrementoPNRR3 += incidenzaSalarioAccessorioUltimoRendiconto === undefined 
            ? "\n- Incidenza salario accessorio non definita." 
            : `\n- Incidenza salario accessorio (${incidenzaSalarioAccessorioUltimoRendiconto.toFixed(2)}%) > 8%.`;
    }
     possibileIncrementoPNRR3 = 0; 
  }

  useEffect(() => {
    dispatch({ type: 'UPDATE_CALCOLATO_INCREMENTO_PNRR3', payload: possibileIncrementoPNRR3 });
  }, [possibileIncrementoPNRR3, dispatch]);


  return (
    <>
      <Card title="Calcolo Incremento Variabile PNRR 3" className="mb-8">
        <p className="text-sm text-[#5f5252] mb-4">
            Questa sezione permette di calcolare il potenziale incremento variabile del fondo ai sensi dell'Art. 8, c.3 del D.L. 13/2023, basato sul rispetto di specifici indicatori di virtuosità finanziaria.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
          <Select
            label="Rispetto Equilibrio di Bilancio Anno Precedente?"
            id="rispettoEquilibrioBilancioPrecedente"
            name="rispettoEquilibrioBilancioPrecedente"
            options={booleanOptions}
            value={annualData.rispettoEquilibrioBilancioPrecedente === undefined ? '' : String(annualData.rispettoEquilibrioBilancioPrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
            aria-required="true"
            containerClassName="mb-3"
          />
          <Select
            label="Rispetto Parametri Debito Commerciale Anno Precedente?"
            id="rispettoDebitoCommercialePrecedente"
            name="rispettoDebitoCommercialePrecedente"
            options={booleanOptions}
            value={annualData.rispettoDebitoCommercialePrecedente === undefined ? '' : String(annualData.rispettoDebitoCommercialePrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
            aria-required="true"
            containerClassName="mb-3"
          />
          <Input
            label="Incidenza Salario Accessorio su Spesa Personale (Ultimo Rendiconto Approvato %)"
            type="number"
            id="incidenzaSalarioAccessorioUltimoRendiconto"
            name="incidenzaSalarioAccessorioUltimoRendiconto"
            value={annualData.incidenzaSalarioAccessorioUltimoRendiconto ?? ''}
            onChange={handleChange}
            placeholder="Es. 7.5"
            step="0.01"
            min="0"
            max="100"
            aria-required="true"
            containerClassName="mb-3"
          />
          <Select
            label="Approvazione Rendiconto Anno Precedente nei Termini?"
            id="approvazioneRendicontoPrecedente"
            name="approvazioneRendicontoPrecedente"
            options={booleanOptions}
            value={annualData.approvazioneRendicontoPrecedente === undefined ? '' : String(annualData.approvazioneRendicontoPrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
            aria-required="true"
            containerClassName="mb-3"
          />
        </div>
        
        <Input
            label="Fondo del salario accessorio di parte stabile 2016 (per calcolo PNRR 3) (€)"
            type="number"
            id="fondoStabile2016PNRR"
            name="fondoStabile2016PNRR"
            value={annualData.fondoStabile2016PNRR ?? ''}
            onChange={handleChange}
            placeholder="Es. 100000.00"
            step="0.01"
            containerClassName="mt-4 mb-3"
            aria-required="true"
        />

        <div className="mt-6 p-4 bg-[#f3e7e8] border border-[#f3e7e8] rounded-lg">
            <label className="block text-base font-medium text-[#1b0e0e]">Possibile incremento variabile PNRR 3 (Art. 8 c.3 DL 13/2023):</label>
            <p className={`text-xl font-bold ${allConditionsMetForPNRR3 && (fondoStabile2016PNRR || 0) > 0 ? 'text-[#ea2832]' : 'text-[#5f5252]'} mt-1`}>
                {formatCurrency(possibileIncrementoPNRR3)}
            </p>
            <p className="text-xs text-[#5f5252] mt-1 whitespace-pre-line">{messaggioIncrementoPNRR3}</p>
        </div>
      </Card>
    </>
  );
};