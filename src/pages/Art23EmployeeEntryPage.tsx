// pages/Art23EmployeeEntryPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Art23EmployeeDetail } from '../types.js';
import { Input } from '../components/shared/Input.js';
import { Button } from '../components/shared/Button.js';
import { TEXTS_UI } from '../constants.js';

interface EmployeeTableProps {
  yearType: '2018' | 'annoRif';
  title: string;
  employees: Art23EmployeeDetail[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Art23EmployeeDetail, value: any) => void;
  onRemove: (id: string) => void;
}

const EmployeeDetailTable: React.FC<EmployeeTableProps> = ({ yearType, title, employees, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="mb-6">
      <h5 className="text-base font-semibold text-[#1b0e0e] mb-3">{title}</h5>
      {employees.map((emp, index) => (
        <div key={emp.id} className="grid grid-cols-12 gap-x-3 gap-y-2 mb-2 p-3 border border-[#f3e7e8] rounded-lg items-end bg-white">
          <Input
            label="Matricola (Opz.)"
            id={`modal_matricola_${yearType}_${index}`}
            value={emp.matricola ?? ''}
            onChange={(e) => onUpdate(emp.id, 'matricola', e.target.value)}
            containerClassName="col-span-12 sm:col-span-4 md:col-span-3 mb-0"
            inputClassName="text-sm h-10 p-2" labelClassName="text-xs"
          />
          <Input
            label="% Part-Time"
            type="number"
            id={`modal_pt_${yearType}_${index}`}
            value={emp.partTimePercentage ?? ''}
            onChange={(e) => onUpdate(emp.id, 'partTimePercentage', e.target.value === '' ? undefined : parseFloat(e.target.value))}
            min="1" max="100" step="0.01" placeholder="100"
            containerClassName="col-span-6 sm:col-span-3 md:col-span-3 mb-0"
            inputClassName="text-sm h-10 p-2" labelClassName="text-xs"
            aria-required="true"
          />
          {yearType === 'annoRif' && (
            <Input
              label="Cedolini (su 12)"
              type="number"
              id={`modal_cedolini_${yearType}_${index}`}
              value={emp.cedoliniEmessi ?? ''}
              onChange={(e) => onUpdate(emp.id, 'cedoliniEmessi', e.target.value === '' ? undefined : parseInt(e.target.value))}
              min="1" max="12" step="1" placeholder="12"
              containerClassName="col-span-6 sm:col-span-3 md:col-span-3 mb-0"
              inputClassName="text-sm h-10 p-2" labelClassName="text-xs"
              aria-required="true"
            />
          )}
          <div className={`col-span-12 ${yearType === 'annoRif' ? 'sm:col-span-2 md:col-span-3' : 'sm:col-span-5 md:col-span-6'} flex justify-end items-end h-full`}>
            <Button variant="danger" size="sm" onClick={() => onRemove(emp.id)} className="py-1 px-2 text-xs h-10">
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


interface Art23EmployeeEntryPageProps {
  onClose: () => void;
}

export const Art23EmployeeEntryPage: React.FC<Art23EmployeeEntryPageProps> = ({ onClose }) => {
  const { state, dispatch } = useAppContext();
  const { annualData } = state.fundData;

  const handleEmployeeDetailChange = (yearType: '2018' | 'annoRif', id: string, field: keyof Art23EmployeeDetail, value: any) => {
    const listKey = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
    const employeeList = annualData[listKey] || [];
    const index = employeeList.findIndex(e => e.id === id);
    if (index === -1) return;

    let processedValue = value;
    if (field === 'partTimePercentage' || field === 'cedoliniEmessi') {
      processedValue = value === '' ? undefined : (field === 'partTimePercentage' ? parseFloat(value) : parseInt(value));
    }
    const updatedEmployee = { ...employeeList[index], [field]: processedValue };
    dispatch({ type: 'UPDATE_ART23_EMPLOYEE_DETAIL', payload: { yearType, detail: updatedEmployee } });
  };

  const addEmployeeDetail = (yearType: '2018' | 'annoRif') => {
    const newDetail: Art23EmployeeDetail = { id: crypto.randomUUID(), partTimePercentage: 100 };
    if (yearType === 'annoRif') newDetail.cedoliniEmessi = 12;
    dispatch({ type: 'ADD_ART23_EMPLOYEE_DETAIL', payload: { yearType, detail: newDetail } });
  };

  const removeEmployeeDetail = (yearType: '2018' | 'annoRif', id: string) => {
    dispatch({ type: 'REMOVE_ART23_EMPLOYEE_DETAIL', payload: { yearType, id } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#fcf8f8] rounded-lg shadow-xl flex flex-col">
        <div className="p-6 border-b border-[#f3e7e8]">
          <h2 id="modal-title" className="text-xl font-bold text-[#1b0e0e]">Gestione Personale per Calcolo Art. 23 c.2</h2>
          <p className="text-sm text-[#5f5252]">Inserisci i dettagli del personale in servizio al 31.12.2018 e nell'anno di riferimento.</p>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
            <EmployeeDetailTable
                yearType="2018"
                title="Personale in servizio al 31.12.2018"
                employees={annualData.personale2018PerArt23}
                onAdd={() => addEmployeeDetail('2018')}
                onUpdate={(id, field, value) => handleEmployeeDetailChange('2018', id, field, value)}
                onRemove={(id) => removeEmployeeDetail('2018', id)}
            />
            <hr className="my-6 border-t border-[#f3e7e8]"/>
            <EmployeeDetailTable
                yearType="annoRif"
                title={`Personale in servizio Anno ${annualData.annoRiferimento} (previsto da PIAO)`}
                employees={annualData.personaleAnnoRifPerArt23}
                onAdd={() => addEmployeeDetail('annoRif')}
                onUpdate={(id, field, value) => handleEmployeeDetailChange('annoRif', id, field, value)}
                onRemove={(id) => removeEmployeeDetail('annoRif', id)}
            />
        </div>
        <div className="p-6 border-t border-[#f3e7e8] bg-white rounded-b-lg flex justify-end">
          <Button onClick={onClose} variant="primary" size="lg">
            Conferma e Chiudi
          </Button>
        </div>
      </div>
    </div>
  );
};