

// components/dataInput/ProventiSpecificiForm.tsx
import React from 'react'; // Removed useState as it's not used
import { useAppContext } from '../../contexts/AppContext.js';
import { ProventoSpecifico } from '../../types.js';
import { Input } from '../shared/Input.js';
import { Button } from '../shared/Button.js';
import { RIF_ART45_DLGS36_2023, RIF_ART208_CDS, TEXTS_UI } from '../../constants.js'; // RIF_ART8_DL13_2023 not used

export const ProventiSpecificiForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { proventiSpecifici } = state.fundData.annualData;

  const predefinedRefs = [
    { label: "Incentivi Funzioni Tecniche (Art. 45 D.Lgs. 36/2023)", value: RIF_ART45_DLGS36_2023 },
    { label: "Proventi Codice della Strada (Art. 208)", value: RIF_ART208_CDS },
    { label: "Altro (specificare)", value: "ALTRO" }
  ];

  const handleAddProvento = () => {
    dispatch({ type: 'ADD_PROVENTO_SPECIFICO', payload: { id: Date.now().toString(), descrizione: '', importo: undefined, riferimentoNormativo: '' } });
  };

  const handleRemoveProvento = (index: number) => {
    dispatch({ type: 'REMOVE_PROVENTO_SPECIFICO', payload: index });
  };

  const handleChange = (index: number, field: keyof ProventoSpecifico, value: string | number | undefined) => {
    const updatedProvento = { ...proventiSpecifici[index], [field]: value };
    if (field === 'riferimentoNormativo' && value !== 'ALTRO') {
        const predefined = predefinedRefs.find(r => r.value === value);
        if (predefined) updatedProvento.descrizione = predefined.label;
    }
     if (field === 'importo' && typeof value === 'string') { // Ensure importo is number or undefined
        updatedProvento.importo = value === '' ? undefined : parseFloat(value);
    }
    dispatch({ type: 'UPDATE_PROVENTO_SPECIFICO', payload: { index, provento: updatedProvento } });
  };

  return (
    <div className="mt-6">
      <h4 className="text-md font-semibold text-gray-700 mb-2">Proventi da Servizi Specifici e Incentivazioni Particolari</h4>
      {proventiSpecifici.map((provento, index) => (
        <div key={provento.id || index} className="p-3 mb-3 border border-gray-200 rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
                 <label htmlFor={`provento_ref_${index}`} className="block text-sm font-medium text-gray-700 mb-1">Tipo Provento/Incentivo</label>
                 <select 
                    id={`provento_ref_${index}`}
                    value={predefinedRefs.find(r => r.value === provento.riferimentoNormativo) ? provento.riferimentoNormativo : "ALTRO"}
                    onChange={(e) => handleChange(index, 'riferimentoNormativo', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                 >
                    {predefinedRefs.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                 </select>

                {(provento.riferimentoNormativo === "ALTRO" || !predefinedRefs.find(r => r.value === provento.riferimentoNormativo)) && (
                     <Input
                        label="Descrizione (se 'Altro')"
                        type="text"
                        id={`provento_desc_${index}`}
                        value={provento.descrizione}
                        onChange={(e) => handleChange(index, 'descrizione', e.target.value)}
                        placeholder="Es. Contributi specifici regionali"
                        containerClassName="mt-2"
                    />
                )}
            </div>
            <Input
              label="Importo (€)"
              type="number"
              id={`provento_importo_${index}`}
              value={provento.importo ?? ''}
              onChange={(e) => handleChange(index, 'importo', e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <Button variant="danger" size="sm" onClick={() => handleRemoveProvento(index)} className="mt-3">
            {TEXTS_UI.remove} Voce
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={handleAddProvento}>
        {TEXTS_UI.add} Provento/Incentivo
      </Button>
    </div>
  );
};