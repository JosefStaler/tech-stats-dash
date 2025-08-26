import React from 'react';

export function TechStatsIntro(): JSX.Element {
  return (
    <div className="p-3 border rounded bg-white/50">
      <div className="text-sm text-gray-600">tech-stats-dash</div>
      <div className="text-base">Pacote integrado com sucesso. Pronto para receber dados da API.</div>
    </div>
  );
}

export { RetiradasKpis, RetiradasStatusChart } from './retiradas';
export { Charts } from './components/dashboard/charts';
export { StatCard } from './components/ui/stat-card';
export { RetiradasDashboard } from './retiradas-dashboard';


