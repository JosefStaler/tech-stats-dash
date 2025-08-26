import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function RetiradasKpis({ rows }: { rows: any[] }): JSX.Element {
  const total = rows.length;
  const withExec = useMemo(() => rows.filter((r) => Boolean(r['Data Execução'] || r['Data Execucao'])).length, [rows]);
  const withUltAt = useMemo(() => rows.filter((r) => Boolean(r['Último Atendimento'] || r['Ultimo Atendimento'] || r['Técnico - Último Atendimento'])).length, [rows]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="p-3 border rounded"><div className="text-gray-600 text-sm">Total</div><div className="text-xl font-semibold">{total}</div></div>
      <div className="p-3 border rounded"><div className="text-gray-600 text-sm">Com Data Execução</div><div className="text-xl font-semibold">{withExec}</div></div>
      <div className="p-3 border rounded"><div className="text-gray-600 text-sm">Com Último Atendimento</div><div className="text-xl font-semibold">{withUltAt}</div></div>
    </div>
  );
}

export function RetiradasStatusChart({ rows }: { rows: any[] }): JSX.Element {
  const { key, data } = useMemo(() => {
    const candidateKeys = ['Status iCare', 'Status', 'Status Atividade'];
    const chosen = candidateKeys.find((k) => rows[0] && Object.prototype.hasOwnProperty.call(rows[0], k));
    const map: Record<string, number> = {};
    if (chosen) {
      for (const r of rows) {
        const v = String(r[chosen] ?? 'Indefinido');
        map[v] = (map[v] ?? 0) + 1;
      }
    }
    const chart = Object.entries(map).map(([name, value]) => ({ name, value }));
    return { key: chosen ?? 'Status', data: chart };
  }, [rows]);

  if (!data.length) {
    return <div className="p-3 border rounded text-sm text-gray-600">Sem coluna de status detectada para gráfico.</div>;
  }

  return (
    <div className="p-3 border rounded">
      <div className="mb-2 text-sm text-gray-600">Distribuição por {key}</div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide={data.length > 12} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


