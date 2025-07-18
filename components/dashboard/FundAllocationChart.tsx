// components/dashboard/FundAllocationChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../shared/Card';

const FundAllocationChart: React.FC = () => {
  const { state } = useAppContext();
  const { calculatedFund } = state;

  if (!calculatedFund) {
    return <Card title="Ripartizione Fondo"><p>Dati non disponibili. Esegui prima il calcolo.</p></Card>;
  }

  const parteStabile = calculatedFund.totaleComponenteStabile;
  const parteVariabile = calculatedFund.totaleComponenteVariabile;
  const totalFund = parteStabile + parteVariabile;

  const data = [
    { name: 'Parte Stabile', value: parteStabile },
    { name: 'Parte Variabile', value: parteVariabile },
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <Card title="Ripartizione Fondo">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default FundAllocationChart;
