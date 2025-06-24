// src/HistoricalDataForm.tsx
import React from 'react';
import { useAppContext } from './AppContext.js';
import { HistoricalData } from '../types.js';
import { Input } from './Input.js';
import { Card } from './Card.js';
import { TEXTS_UI } from '../constants.js'; // TEXTS_UI is used for notApplicable

export const HistoricalDataForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { historicalData } = state.fundData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined = value; 

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    dispatch({ type: 'UPDATE_HISTORICAL_DATA', payload: { [name]: processedValue } as Partial<HistoricalData> });
  };

  const {
    fondoSalarioAccessorioPersonaleNonDirEQ2016,
    fondoElevateQualificazioni2016,
    fondoDirigenza2016,
    risorseSegretarioComunale2016,
  } = historicalData;

  const limiteComplessivo2016 = 
    (fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (fondoElevateQualificazioni2016 || 0) +
    (fondoDirigenza2016 || 0) +
    (risorseSegretarioComunale2016 || 0);

  const formatCurrencyForDisplay = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return TEXTS_UI.notApplicable;
    return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card title="Dati Storici Consolidati" className="mb-6">
      <h4 className="text-md font-semibold text-gray-700 mb-1">Dettaglio Fondi Anno 2016 (Limite Art. 23 c.2 D.Lgs. 75/2017)</h4>
      <p className="text-xs text-gray-500 mb-3">Inserire i valori certificati per l'anno 2016.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <Input
          label="Fondo Salario Accessorio Personale (non Dirigente/non EQ) 2016 (€)"
          type="number"
          id="fondoSalarioAccessorioPersonaleNonDirEQ2016"
          name="fondoSalarioAccessorioPersonaleNonDirEQ2016"
          value={historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 ?? ''}
          onChange={handleChange}
          placeholder="Es. 120000.00"
          step="0.01"
        />
        <Input
          label="Fondo Elevate Qualificazioni (EQ) 2016 (€)"
          type="number"
          id="fondoElevateQualificazioni2016"
          name="fondoElevateQualificazioni2016"
          value={historicalData.fondoElevateQualificazioni2016 ?? ''}
          onChange={handleChange}
          placeholder="Es. 15000.00"
          step="0.01"
        />
        <Input
          label="Fondo Dirigenza 2016 (€)"
          type="number"
          id="fondoDirigenza2016"
          name="fondoDirigenza2016"
          value={historicalData.fondoDirigenza2016 ?? ''}
          onChange={handleChange}
          placeholder="Es. 25000.00"
          step="0.01"
        />
        <Input
          label="Risorse Segretario Comunale 2016 (€)"
          type="number"
          id="risorseSegretarioComunale2016"
          name="risorseSegretarioComunale2016"
          value={historicalData.risorseSegretarioComunale2016 ?? ''}
          onChange={handleChange}
          placeholder="Es. 10000.00"
          step="0.01"
        />
      </div>
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <label className="block text-sm font-medium text-gray-700">Limite Complessivo Art. 23 c.2 D.Lgs. 75/2017 (€):</label>
        <p className="text-lg font-semibold text-blue-700 mt-1">
          {formatCurrencyForDisplay(limiteComplessivo2016)}
        </p>
      </div>

      <hr className="my-6"/>

      <h4 className="text-md font-semibold text-gray-700 mb-3">Altri Dati Storici Rilevanti</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <Input
          label="Numero Personale in Servizio al 31/12/2018 (per Art. 33 DL 34/2019)"
          type="number"
          id="personaleServizio2018"
          name="personaleServizio2018"
          value={historicalData.personaleServizio2018 ?? ''}
          onChange={handleChange}
          placeholder="Es. 50"
          step="1"
        />
      </div>
      <div className="mt-4">
        <Input
          label="Spesa Complessiva Stipendi Tabellari Aree Professionali 2023 (€) (Personale non Dirigente, per Art. 14 DL 25/2025)"
          type="number"
          id="spesaStipendiTabellari2023"
          name="spesaStipendiTabellari2023"
          value={historicalData.spesaStipendiTabellari2023 ?? ''}
          onChange={handleChange}
          placeholder="Es. 800000.00"
          step="0.01"
          containerClassName="mb-2"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeDifferenzialiStipendiali2023"
            name="includeDifferenzialiStipendiali2023"
            checked={!!historicalData.includeDifferenzialiStipendiali2023}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="includeDifferenzialiStipendiali2023" className="ml-2 block text-sm text-gray-700">
            Includere i "differenziali stipendiali" (Art. 78, c.3, lett.b CCNL 2019-21) nel calcolo del limite 48% (Art. 14 DL 25/2025)?
          </label>
        </div>
         <p className="mt-1 text-xs text-gray-500">
            Il sistema adeguerà il calcolo per l'incremento facoltativo enti virtuosi in base a questa scelta.
         </p>
      </div>
    </Card>
  );
};
