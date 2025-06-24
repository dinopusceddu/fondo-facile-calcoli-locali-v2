// src/AnnualDataForm.tsx
import React, { ChangeEvent } from 'react';
import { useAppContext } from './AppContext.js';
import { AnnualData, TipologiaEnte } from '../types.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import { Card } from './Card.js';
import { EmployeeCountsForm } from './EmployeeCountsForm.js';
import { ProventiSpecificiForm } from './ProventiSpecificiForm.js';
import { TEXTS_UI, ALL_TIPOLOGIE_ENTE } from '../constants.js';

const booleanOptions = [
  { value: 'true', label: TEXTS_UI.trueText },
  { value: 'false', label: TEXTS_UI.falseText },
];

export const AnnualDataForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { annualData } = state.fundData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined | TipologiaEnte = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (name === 'tipologiaEnte') {
      processedValue = value as TipologiaEnte;
      if (value !== TipologiaEnte.ALTRO) {
        // Clear altroTipologiaEnte if a predefined type is selected
        dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { altroTipologiaEnte: '' } as Partial<AnnualData> });
      }
    }
    else if (['rispettoEquilibrioBilancioPrecedente', 
               'rispettoDebitoCommercialePrecedente',
               'approvazioneRendicontoPrecedente',
               'condizioniVirtuositaFinanziariaSoddisfatte',
               'isEnteDissestato',
               'isEnteStrutturalmenteDeficitario',
               'isEnteRiequilibrioFinanziario'].includes(name)) {
      processedValue = value === 'true' ? true : (value === 'false' ? false : undefined);
      if (value === "") processedValue = undefined;
    }
    
    dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { [name]: processedValue } as Partial<AnnualData> });
  };

  return (
    <>
      <Card title="Informazioni Generali Ente" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          <Input
            label="Denominazione Ente"
            type="text"
            id="denominazioneEnte"
            name="denominazioneEnte"
            value={annualData.denominazioneEnte ?? ''}
            onChange={handleChange}
            placeholder="Es. Comune di..."
            containerClassName="md:col-span-2"
          />
          <Select
            label="Tipologia Ente"
            id="tipologiaEnte"
            name="tipologiaEnte"
            options={ALL_TIPOLOGIE_ENTE}
            value={annualData.tipologiaEnte ?? ''}
            onChange={handleChange}
            placeholder="Seleziona tipologia..."
          />
          {annualData.tipologiaEnte === TipologiaEnte.ALTRO && (
            <Input
              label="Specifica Altra Tipologia Ente"
              type="text"
              id="altroTipologiaEnte"
              name="altroTipologiaEnte"
              value={annualData.altroTipologiaEnte ?? ''}
              onChange={handleChange}
              placeholder="Indicare la tipologia"
            />
          )}
           <Input
            label="Numero Abitanti al 31.12 Anno Precedente"
            type="number"
            id="numeroAbitanti"
            name="numeroAbitanti"
            value={annualData.numeroAbitanti ?? ''}
            onChange={handleChange}
            placeholder="Es. 15000"
            step="1"
            min="0"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-1">
           <Select
            label="Ente in dissesto finanziario (art. 244 TUEL)?"
            id="isEnteDissestato"
            name="isEnteDissestato"
            options={booleanOptions}
            value={annualData.isEnteDissestato === undefined ? '' : String(annualData.isEnteDissestato)}
            onChange={handleChange}
            placeholder="Seleziona..."
          />
           <Select
            label="Ente strutturalmente deficitario (art. 242 TUEL)?"
            id="isEnteStrutturalmenteDeficitario"
            name="isEnteStrutturalmenteDeficitario"
            options={booleanOptions}
            value={annualData.isEnteStrutturalmenteDeficitario === undefined ? '' : String(annualData.isEnteStrutturalmenteDeficitario)}
            onChange={handleChange}
            placeholder="Seleziona..."
          />
          <Select
            label="Ente in piano di riequilibrio finanziario pluriennale (art. 243-bis TUEL)?"
            id="isEnteRiequilibrioFinanziario"
            name="isEnteRiequilibrioFinanziario"
            options={booleanOptions}
            value={annualData.isEnteRiequilibrioFinanziario === undefined ? '' : String(annualData.isEnteRiequilibrioFinanziario)}
            onChange={handleChange}
            placeholder="Seleziona..."
          />
        </div>
      </Card>

      <Card title={`Dati Annuali di Riferimento (Anno ${annualData.annoRiferimento})`} className="mb-6">
        <Input
          label="Anno di Riferimento per la Costituzione del Fondo"
          type="number"
          id="annoRiferimento"
          name="annoRiferimento"
          value={annualData.annoRiferimento}
          onChange={(e) => dispatch({ type: 'SET_CURRENT_YEAR', payload: parseInt(e.target.value) || new Date().getFullYear() })}
          min="2000"
          max="2099"
          className="mb-6"
          containerClassName="mb-6"
        />

        <EmployeeCountsForm title="Numero Dipendenti in Servizio per Categoria (nell'anno di riferimento)" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-6">
          <Select
            label="Rispetto Equilibrio di Bilancio Anno Precedente?"
            id="rispettoEquilibrioBilancioPrecedente"
            name="rispettoEquilibrioBilancioPrecedente"
            options={booleanOptions}
            value={annualData.rispettoEquilibrioBilancioPrecedente === undefined ? '' : String(annualData.rispettoEquilibrioBilancioPrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
          />
          <Select
            label="Rispetto Parametri Debito Commerciale Anno Precedente?"
            id="rispettoDebitoCommercialePrecedente"
            name="rispettoDebitoCommercialePrecedente"
            options={booleanOptions}
            value={annualData.rispettoDebitoCommercialePrecedente === undefined ? '' : String(annualData.rispettoDebitoCommercialePrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
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
          />
          <Select
            label="Approvazione Rendiconto Anno Precedente nei Termini?"
            id="approvazioneRendicontoPrecedente"
            name="approvazioneRendicontoPrecedente"
            options={booleanOptions}
            value={annualData.approvazioneRendicontoPrecedente === undefined ? '' : String(annualData.approvazioneRendicontoPrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
          />
        </div>

        <ProventiSpecificiForm />
        
        <div className="mt-6">
          <Input
              label="Incentivi PNRR / Altre Misure Straordinarie Destinate al Fondo (€)"
              type="number"
              id="incentiviPNRROpMisureStraordinarie"
              name="incentiviPNRROpMisureStraordinarie"
              value={annualData.incentiviPNRROpMisureStraordinarie ?? ''}
              onChange={handleChange}
              placeholder="Es. 10000.00"
              step="0.01"
              containerClassName="mb-2"
          />
          <p className="mt-1 text-xs text-gray-500">
              Usato per incrementi come Art. 8 D.L. 13/2023 (fino al 5% del fondo stabile 2016).
          </p>
        </div>

        <div className="mt-6">
          <Select
              label="Condizioni di Virtuosità Finanziaria Soddisfatte?"
              id="condizioniVirtuositaFinanziariaSoddisfatte"
              name="condizioniVirtuositaFinanziariaSoddisfatte"
              options={booleanOptions}
              value={annualData.condizioniVirtuositaFinanziariaSoddisfatte === undefined ? '' : String(annualData.condizioniVirtuositaFinanziariaSoddisfatte)}
              onChange={handleChange}
              placeholder="Seleziona..."
              containerClassName="mb-2"
          />
          <p className="mt-1 text-xs text-gray-500">
              Necessario per incrementi facoltativi (es. 48% D.L. 25/2025, PNRR D.L. 13/2023).
          </p>
        </div>
      </Card>
    </>
  );
};