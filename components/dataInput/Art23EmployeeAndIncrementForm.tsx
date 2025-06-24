// components/dataInput/Art23EmployeeAndIncrementForm.tsx
import React from 'react';
import { useAppContext } from '../../contexts/AppContext.js';
import { HistoricalData, AnnualData, Art23EmployeeDetail } from '../../types.js';
import { Input } from '../shared/Input.js';
import { Button } from '../shared/Button.js';
import { Card } from '../shared/Card.js';
import { TEXTS_UI } from '../../constants.js';

const formatNumberForDisplay = (value?: number, digits = 2) => {
  if (value === undefined || value === null || isNaN(value)) return TEXTS_UI.notApplicable;
  return value.toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return TEXTS_UI.notApplicable;
    return `€ ${formatNumberForDisplay(value)}`;
};


interface EmployeeTableProps {
  yearType: '2018' | 'annoRif';
  title: string;
  employees: Art23EmployeeDetail[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Art23EmployeeDetail, value: any) => void;
  onRemove: (index: number) => void;
}

const EmployeeDetailTable: React.FC<EmployeeTableProps> = ({ yearType, title, employees, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="mb-6">
      <h5 className="text-base font-semibold text-[#1b0e0e] mb-3">{title}</h5>
      {employees.map((emp, index) => (
        <div key={emp.id} className="grid grid-cols-12 gap-x-3 gap-y-2 mb-2 p-3 border border-[#f3e7e8] rounded-lg items-end bg-white">
          <Input
            label="Matricola (Opz.)"
            id={`matricola_${yearType}_${index}`}
            value={emp.matricola ?? ''}
            onChange={(e) => onUpdate(index, 'matricola', e.target.value)}
            containerClassName="col-span-12 sm:col-span-4 md:col-span-3 mb-0"
            inputClassName="text-sm h-10 p-2" labelClassName="text-xs"
          />
          <Input
            label="% Part-Time"
            type="number"
            id={`pt_${yearType}_${index}`}
            value={emp.partTimePercentage ?? ''}
            onChange={(e) => onUpdate(index, 'partTimePercentage', e.target.value === '' ? undefined : parseFloat(e.target.value))}
            min="1" max="100" step="0.01" placeholder="100"
            containerClassName="col-span-6 sm:col-span-3 md:col-span-3 mb-0"
            inputClassName="text-sm h-10 p-2" labelClassName="text-xs"
            aria-required="true"
          />
          {yearType === 'annoRif' && (
            <Input
              label="Cedolini (su 12)"
              type="number"
              id={`cedolini_${yearType}_${index}`}
              value={emp.cedoliniEmessi ?? ''}
              onChange={(e) => onUpdate(index, 'cedoliniEmessi', e.target.value === '' ? undefined : parseInt(e.target.value))}
              min="1" max="12" step="1" placeholder="12"
              containerClassName="col-span-6 sm:col-span-3 md:col-span-3 mb-0"
              inputClassName="text-sm h-10 p-2" labelClassName="text-xs"
              aria-required="true"
            />
          )}
          <div className={`col-span-12 ${yearType === 'annoRif' ? 'sm:col-span-2 md:col-span-3' : 'sm:col-span-5 md:col-span-6'} flex justify-end items-end h-full`}>
            <Button variant="danger" size="sm" onClick={() => onRemove(index)} className="py-1 px-2 text-xs h-10">
              {TEXTS_UI.remove}
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondary" size="md" onClick={onAdd}>
        {TEXTS_UI.add} Dipendente
      </Button>
    </div>
  );
};


export const Art23EmployeeAndIncrementForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { historicalData, annualData } = state.fundData;

  const handleHistoricalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = value === '' ? undefined : parseFloat(value);
    dispatch({ type: 'UPDATE_HISTORICAL_DATA', payload: { [name]: processedValue } as Partial<HistoricalData> });
  };
  
  const handleEmployeeDetailChange = (yearType: '2018' | 'annoRif', index: number, field: keyof Art23EmployeeDetail, value: any) => {
    const listKey = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
    const employeeList = annualData[listKey];
    let processedValue = value;
    if (field === 'partTimePercentage' || field === 'cedoliniEmessi') {
      processedValue = value === '' ? undefined : (field === 'partTimePercentage' ? parseFloat(value) : parseInt(value));
    }
    const updatedEmployee = { ...employeeList[index], [field]: processedValue };
    dispatch({ type: 'UPDATE_ART23_EMPLOYEE_DETAIL', payload: { yearType, index, detail: updatedEmployee } });
  };

  const addEmployeeDetail = (yearType: '2018' | 'annoRif') => {
    const newDetail: Art23EmployeeDetail = { id: Date.now().toString(), partTimePercentage: 100 };
    if (yearType === 'annoRif') newDetail.cedoliniEmessi = 12;
    dispatch({ type: 'ADD_ART23_EMPLOYEE_DETAIL', payload: { yearType, detail: newDetail } });
  };

  const removeEmployeeDetail = (yearType: '2018' | 'annoRif', index: number) => {
    dispatch({ type: 'REMOVE_ART23_EMPLOYEE_DETAIL', payload: { yearType, index } });
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

      <EmployeeDetailTable
        yearType="2018"
        title="Personale in servizio al 31.12.2018 (ai fini Art. 23 c.2)"
        employees={annualData.personale2018PerArt23}
        onAdd={() => addEmployeeDetail('2018')}
        onUpdate={(index, field, value) => handleEmployeeDetailChange('2018', index, field, value)}
        onRemove={(index) => removeEmployeeDetail('2018', index)}
      />
      <div className="mb-6 p-4 bg-[#f3e7e8] border border-[#f3e7e8] rounded-lg">
         <p className="text-base font-medium text-[#1b0e0e]">Totale Dipendenti Equivalenti 2018 (Art. 23c2): 
            <strong className="ml-2 text-[#1b0e0e]">{formatNumberForDisplay(dipendentiEquivalenti2018)}</strong>
         </p>
      </div>

      <EmployeeDetailTable
        yearType="annoRif"
        title={`Personale in servizio Anno ${annualData.annoRiferimento} (previsto da PIAO, ai fini Art. 23 c.2)`}
        employees={annualData.personaleAnnoRifPerArt23}
        onAdd={() => addEmployeeDetail('annoRif')}
        onUpdate={(index, field, value) => handleEmployeeDetailChange('annoRif', index, field, value)}
        onRemove={(index) => removeEmployeeDetail('annoRif', index)}
      />
       <div className="mb-6 p-4 bg-[#f3e7e8] border border-[#f3e7e8] rounded-lg">
         <p className="text-base font-medium text-[#1b0e0e]">Totale Dipendenti Equivalenti Anno {annualData.annoRiferimento} (Art. 23c2): 
            <strong className="ml-2 text-[#1b0e0e]">{formatNumberForDisplay(dipendentiEquivalentiAnnoRif)}</strong>
         </p>
      </div>
      
      <div className="mt-6 p-4 bg-[#f3e7e8] border border-[#f3e7e8] rounded-lg space-y-2">
        <h4 className="text-lg font-bold text-[#ea2832] mb-2">Risultati Calcolo Adeguamento Art. 23 c.2</h4>
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
  );
};