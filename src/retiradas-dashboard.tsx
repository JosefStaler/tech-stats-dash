import React, { useMemo } from 'react';
import { StatCard } from './components/ui/stat-card';
import { Charts } from './components/dashboard/charts';
import { ClipboardList, CheckCircle, AlertTriangle, FileSpreadsheet, XCircle } from 'lucide-react';

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const iso = value.includes('T') ? value : `${value}T00:00:00`;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export function RetiradasDashboard({ rows, monthName, year, tecnicoFilter = [], metaPercentTarget }: { rows: any[]; monthName: string; year: number; tecnicoFilter?: string[]; metaPercentTarget?: number }): JSX.Element {
  const debug = false; // mude para true para ver contornos de debug
  // normaliza nome do mês (aceita número ou nome)
  const canonicalMonths = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
  let referenceMonthName = monthName;
  if (/^\d+$/.test(String(monthName))) {
    const n = Math.max(1, Math.min(12, Number(monthName)));
    referenceMonthName = canonicalMonths[n - 1];
  }
  const referenceYear = year;

  const referenceMonth = useMemo(() => {
    const map = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
    const idx = map.indexOf(referenceMonthName?.toUpperCase?.() ?? '');
    return idx >= 0 ? idx : new Date().getMonth();
  }, [referenceMonthName]);

  const filteredServices = rows;

  const referenceMonthServices = useMemo(() => filteredServices.filter((s) => {
    const d = parseDate(s['Data Criação'] ?? s['Data Criacao']);
    return d && d.getMonth() === referenceMonth && d.getFullYear() === referenceYear;
  }), [filteredServices, referenceMonth, referenceYear]);

  // Entrantes do mês desconsiderando cancelados
  const referenceMonthServicesExcludingCancelled = useMemo(
    () => referenceMonthServices.filter((s) => !String(s['Status iCare'] ?? s['Status'] ?? '').includes('Cancelado')),
    [referenceMonthServices]
  );

  const referenceMonthExecutedServices = useMemo(() => filteredServices.filter((s) => {
    const d = parseDate(s['Data Execução'] ?? s['Data Execucao']);
    return d && d.getMonth() === referenceMonth && d.getFullYear() === referenceYear;
  }), [filteredServices, referenceMonth, referenceYear]);

  const isSucesso = (status?: string) => !!status && (status.includes('Sucesso-Reuso') || status.includes('Sucesso-Reversa'));
  const isFinalizado = (status?: string) => !!status && (status.includes('Finalizado') || isSucesso(status));

  const allSucessosTotal = useMemo(() => referenceMonthExecutedServices.filter((s) => isSucesso(s['Status iCare'] ?? s['Status'])).length, [referenceMonthExecutedServices]);

  const referenceMonthTotal = referenceMonthServices.length;
  // Percentual TOTAL deve considerar entrantes do mês desconsiderando cancelados
  const referenceMonthTotalExcludingCancelled = referenceMonthServicesExcludingCancelled.length;
  const sucessoPercentage = referenceMonthTotalExcludingCancelled > 0
    ? Math.round((allSucessosTotal / referenceMonthTotalExcludingCancelled) * 100)
    : 0;
  const metaPercent = typeof metaPercentTarget === 'number' && !Number.isNaN(metaPercentTarget) ? metaPercentTarget : undefined;
  const faltaParaMetaTotal = metaPercent !== undefined && referenceMonthTotalExcludingCancelled > 0
    ? Math.max(0, Math.ceil((metaPercent / 100) * referenceMonthTotalExcludingCancelled) - allSucessosTotal)
    : undefined;

  const canceladasTotal = filteredServices.filter((s) => (s['Status iCare'] ?? s['Status'])?.includes('Cancelado')).length;
  const canceladasTotalTrend = referenceMonthTotal > 0 ? Math.round((canceladasTotal / referenceMonthTotal) * 100) : 0;

  const insucessoTotal = filteredServices.filter((s) => (s['Status iCare'] ?? s['Status'])?.includes('Insucesso')).length;
  const insucessoTotalTrend = referenceMonthTotal > 0 ? Math.round((insucessoTotal / referenceMonthTotal) * 100) : 0;

  const backlogCount = filteredServices.filter((s) => {
    const st = s['Status iCare'] ?? s['Status'];
    return !!st && (st.includes('Backlog'));
  }).length;

  // FIBRA / PAYTV breakdown (seguindo modelo antigo)
  const sucessoModemFibraTotal = useMemo(() => referenceMonthExecutedServices.filter((s) => String(s['Modelo'] ?? '') === 'MODEM FIBRA' && isSucesso(s['Status iCare'] ?? s['Status'])).length, [referenceMonthExecutedServices]);
  const referenciaFibraTotal = referenceMonthServicesExcludingCancelled.filter((s) => String(s['Modelo'] ?? '') === 'MODEM FIBRA').length;
  // Totais por modelo considerando Data Criação no mês/ano de referência (inclui cancelados)
  const referenciaFibraTotalAll = referenceMonthServices.filter((s) => String(s['Modelo'] ?? '') === 'MODEM FIBRA').length;
  const sucessoModemFibraTrend = referenciaFibraTotal > 0 ? Math.round((sucessoModemFibraTotal / referenciaFibraTotal) * 100) : 0;
  const faltaParaMetaFibra = metaPercent !== undefined && referenciaFibraTotal > 0
    ? Math.max(0, Math.ceil((metaPercent / 100) * referenciaFibraTotal) - sucessoModemFibraTotal)
    : undefined;

  const sucessoOutrosTotal = useMemo(() => referenceMonthExecutedServices.filter((s) => String(s['Modelo'] ?? '') !== 'MODEM FIBRA' && isSucesso(s['Status iCare'] ?? s['Status'])).length, [referenceMonthExecutedServices]);
  const referenciaOutrosTotal = referenceMonthServicesExcludingCancelled.filter((s) => String(s['Modelo'] ?? '') !== 'MODEM FIBRA').length;
  const referenciaOutrosTotalAll = referenceMonthServices.filter((s) => String(s['Modelo'] ?? '') !== 'MODEM FIBRA').length;
  const sucessoOutrosTrend = referenciaOutrosTotal > 0 ? Math.round((sucessoOutrosTotal / referenciaOutrosTotal) * 100) : 0;
  const faltaParaMetaOutros = metaPercent !== undefined && referenciaOutrosTotal > 0
    ? Math.max(0, Math.ceil((metaPercent / 100) * referenciaOutrosTotal) - sucessoOutrosTotal)
    : undefined;

  const backlogFibraCount = filteredServices.filter((s) => (String(s['Modelo'] ?? '') === 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Backlog')).length;
  const backlogPaytvCount = filteredServices.filter((s) => (String(s['Modelo'] ?? '') !== 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Backlog')).length;
  const insucessoFibra = filteredServices.filter((s) => (String(s['Modelo'] ?? '') === 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Insucesso')).length;
  const canceladasFibra = referenceMonthServices.filter((s) => (String(s['Modelo'] ?? '') === 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Cancelado')).length;
  const insucessoPaytv = filteredServices.filter((s) => (String(s['Modelo'] ?? '') !== 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Insucesso')).length;
  const canceladasPaytv = referenceMonthServices.filter((s) => (String(s['Modelo'] ?? '') !== 'MODEM FIBRA') && String(s['Status iCare'] ?? s['Status']).includes('Cancelado')).length;

  // Build status datasets
  const statusICareData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const st = s['Status iCare'] ?? s['Status'] ?? 'Outros';
      const group = st.includes('Sucesso') ? 'Sucesso'
        : st.includes('Backlog') ? 'Backlog'
        : st.includes('Insucesso') ? 'Insucesso'
        : st.includes('Cancelado') ? 'Cancelado'
        : st;
      map.set(group, (map.get(group) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices]);

  const statusICareOriginalData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const st = s['Status iCare'] ?? s['Status'] ?? 'Outros';
      map.set(st, (map.get(st) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(referenceYear, i, 1).toLocaleDateString('pt-BR', { month: 'short' }));
    return months.map((m, i) => ({
      month: m,
      finalizados: filteredServices.filter((s) => isFinalizado(s['Status iCare'] ?? s['Status']) && parseDate(s['Data Criação'] ?? s['Data Criacao'])?.getMonth() === i).length,
      pendentes: filteredServices.filter((s) => (s['Status iCare'] ?? s['Status'])?.includes('Pendente') && parseDate(s['Data Criação'] ?? s['Data Criacao'])?.getMonth() === i).length,
      emAndamento: filteredServices.filter((s) => (s['Status iCare'] ?? s['Status'])?.includes('Andamento') && parseDate(s['Data Criação'] ?? s['Data Criacao'])?.getMonth() === i).length,
      cycleTime: 0,
    }));
  }, [filteredServices, referenceYear]);

  const tipoServicoData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const k = s['Tipo-Subtipo de Serviço'] ?? s['Tipo-Subtipo'] ?? 'Outros';
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filteredServices]);

  const modeloData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const k = s['Modelo'] ?? 'Outros';
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filteredServices]);

  // Status por Modelo (sem técnico)
  const statusByModelData = useMemo(() => {
    const toGroupStatus = (st: string): string =>
      st.includes('Sucesso') ? 'Sucesso'
      : st.includes('Backlog') ? 'Backlog'
      : st.includes('Insucesso') ? 'Insucesso'
      : 'Outros';

    const normalizeModel = (m: string): string => {
      const v = String(m || '').toUpperCase();
      if (v.includes('MODEM FIBRA')) return 'MODEM FIBRA';
      if (v.includes('DVR ANDROID 4K')) return 'DVR ANDROID 4K';
      if (v === 'HD' || v.includes('HD PLUS')) return 'HD PLUS';
      if (v.includes('HD SLIM') || v.includes('SLIM') || v.includes('SH10') || v.includes('ZAPPER')) return 'ZAPPER';
      if (v === 'LINHA' || v === 'S14') return 'LINHA';
      return 'OUTROS';
    };

    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const modelRaw = String(s['Modelo'] ?? '');
      const model = normalizeModel(modelRaw);
      if (model === 'OUTROS') continue;
      const statusGroup = toGroupStatus(String(s['Status iCare'] ?? s['Status'] ?? ''));
      if (statusGroup === 'Outros') continue; // ignora cancelado/outros
      const key = `${model} - ${statusGroup}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices]);

  const combinedBacklogEvolutionData = useMemo(() => {
    const daysInMonth = new Date(referenceYear, referenceMonth + 1, 0).getDate();
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === referenceYear && now.getMonth() === referenceMonth;
    const lastDay = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
    const out: Array<{ day: string; backlog: number; retiradas: number; backlogWithPrevious: number; sucessoWithPrevious: number; date: string; }> = [];
    for (let d = 1; d <= lastDay; d++) {
      const measurementDate = new Date(referenceYear, referenceMonth, d);
      const isSameDay = (dt: Date | null) => dt && dt.getDate() === d && dt.getMonth() === referenceMonth && dt.getFullYear() === referenceYear;
      const backlog = filteredServices.filter((s) => (s['Status iCare'] ?? s['Status'])?.includes('Backlog') && (parseDate(s['Data Criação'] ?? s['Data Criacao']) ?? new Date(0)) <= measurementDate).length;
      const retiradas = filteredServices.filter((s) => isSameDay(parseDate(s['Data Execução'] ?? s['Data Execucao'])) && isSucesso(s['Status iCare'] ?? s['Status'])).length;
      const backlogWithPrevious = filteredServices.filter((s) => (s['Status iCare'] ?? s['Status'])?.includes('Backlog') && (s['Técnico - Último Atendimento'] ?? s['Ultimo Atendimento']) && (parseDate(s['Data Criação'] ?? s['Data Criacao']) ?? new Date(0)) <= measurementDate).length;
      const sucessoWithPrevious = filteredServices.filter((s) => isSameDay(parseDate(s['Data Execução'] ?? s['Data Execucao'])) && isSucesso(s['Status iCare'] ?? s['Status']) && (s['Técnico - Último Atendimento'] ?? s['Ultimo Atendimento'])).length;
      out.push({ day: String(d).padStart(2, '0'), backlog, retiradas, backlogWithPrevious, sucessoWithPrevious, date: measurementDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) });
    }
    return out;
  }, [filteredServices, referenceMonth, referenceYear]);

  const statusAtividadeData: Array<{ name: string; value: number }> = [];
  // Derivar dados quando houver filtro de técnico (nome exato)
  const statusICareWithTecnicoData: Array<{ name: string; value: number }> = useMemo(() => {
    if (!tecnicoFilter || tecnicoFilter.length === 0) return [];
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const tecnico = String(s['Técnico - Último Atendimento'] ?? s['Ultimo Atendimento'] ?? '').trim();
      if (!tecnico || !tecnicoFilter.includes(tecnico)) continue;
      const st = s['Status iCare'] ?? s['Status'] ?? 'Outros';
      const group = st.includes('Sucesso') ? 'Sucesso'
        : st.includes('Backlog') ? 'Backlog'
        : st.includes('Insucesso') ? 'Insucesso'
        : st.includes('Cancelado') ? 'Cancelado'
        : 'Outros';
      map.set(group, (map.get(group) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredServices, tecnicoFilter]);

  const statusICareDetailedByTecnicoData: Array<{ name: string; value: number }> = useMemo(() => {
    if (!tecnicoFilter || tecnicoFilter.length === 0) return [];
    const map = new Map<string, number>();
    const toGroup = (st: string): string =>
      st.includes('Sucesso') ? 'Sucesso'
      : st.includes('Backlog') ? 'Backlog'
      : st.includes('Insucesso') ? 'Insucesso'
      : st.includes('Cancelado') ? 'Cancelado'
      : 'Outros';
    for (const s of filteredServices) {
      const tecnico = String(s['Técnico - Último Atendimento'] ?? s['Ultimo Atendimento'] ?? '').trim();
      if (!tecnico || !tecnicoFilter.includes(tecnico)) continue;
      const st = String(s['Status iCare'] ?? s['Status'] ?? 'Outros');
      const group = toGroup(st);
      if (group === 'Cancelado') continue;
      const key = `${tecnico} - ${group}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const orderIndex = (g: string) => (g === 'Backlog' ? 0 : g === 'Sucesso' ? 1 : 2);
    const extractGroup = (name: string) => {
      const parts = name.split(' - ');
      return parts[parts.length - 1] || '';
    };
    const extractTech = (name: string) => {
      const parts = name.split(' - ');
      parts.pop();
      return parts.join(' - ');
    };
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const ga = extractGroup(a.name);
        const gb = extractGroup(b.name);
        const oi = orderIndex(ga) - orderIndex(gb);
        if (oi !== 0) return oi;
        // Dentro do mesmo grupo, ordena alfabeticamente por técnico para estabilidade
        return extractTech(a.name).localeCompare(extractTech(b.name), 'pt-BR');
      });
  }, [filteredServices, tecnicoFilter]);

  // Status por Modelo (agrupado) com Técnico
  const statusByModelWithTecnicoData: Array<{ name: string; value: number }> = useMemo(() => {
    if (!tecnicoFilter || tecnicoFilter.length === 0) return [];
    const toGroupStatus = (st: string): string =>
      st.includes('Sucesso') ? 'Sucesso'
      : st.includes('Backlog') ? 'Backlog'
      : st.includes('Insucesso') ? 'Insucesso'
      : 'Outros';
    const map = new Map<string, number>();
    for (const s of filteredServices) {
      const tecnico = String(s['Técnico - Último Atendimento'] ?? s['Ultimo Atendimento'] ?? '').trim();
      if (!tecnico || !tecnicoFilter.includes(tecnico)) continue;
      const statusGroup = toGroupStatus(String(s['Status iCare'] ?? s['Status'] ?? ''));
      if (statusGroup === 'Outros') continue; // ignora cancelado/outros
      const model = String(s['Modelo'] ?? 'OUTROS').trim() || 'OUTROS';
      const key = `${model} - ${statusGroup}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const orderStatus = (g: string) => (g === 'Backlog' ? 0 : g === 'Sucesso' ? 1 : 2);
    const extract = (name: string) => {
      const parts = name.split(' - ');
      return { model: parts[0] || '', status: parts[1] || '' };
    };
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const ea = extract(a.name), eb = extract(b.name);
        const m = ea.model.localeCompare(eb.model, 'pt-BR');
        if (m !== 0) return m;
        return orderStatus(ea.status) - orderStatus(eb.status);
      })
      .slice(0, 30);
  }, [filteredServices, tecnicoFilter]);

  return (
    <div className="space-y-6">
      {/* Linha superior: 3 cards principais lado a lado */}
      <div className={`grid grid-cols-3 gap-4 auto-rows-fr${debug ? ' outline outline-1 outline-red-300' : ''}`}>
        <StatCard size="sm" className={`h-full min-w-0 w-full${debug ? ' outline outline-1 outline-blue-300' : ''}`} title={`Total Entrantes em ${referenceMonthName}/${referenceYear}`} value={referenceMonthServices.length} icon={<ClipboardList className="h-5 w-5" />} variant="accent" />
        <StatCard size="sm" className={`h-full min-w-0 w-full${debug ? ' outline outline-1 outline-blue-300' : ''}`} title={`FIBRA Entrantes em ${referenceMonthName}/${referenceYear}`} value={referenciaFibraTotalAll} icon={<ClipboardList className="h-5 w-5" />} variant="accent" />
        <StatCard size="sm" className={`h-full min-w-0 w-full${debug ? ' outline outline-1 outline-blue-300' : ''}`} title={`PAYTV Entrantes em ${referenceMonthName}/${referenceYear}`} value={referenciaOutrosTotalAll} icon={<ClipboardList className="h-5 w-5" />} variant="accent" />
      </div>

      {/* Coluna Total: 2 + 2 abaixo, mesma largura da primeira coluna */}
      <div className={`grid grid-cols-3 gap-4${debug ? ' outline outline-1 outline-green-300' : ''}`}>
        <div className={`space-y-4 min-w-0 flex flex-col w-full${debug ? ' outline outline-1 outline-blue-200' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Backlog de Retiradas TOTAL" value={backlogCount} icon={<FileSpreadsheet className="h-5 w-5" />} trend={{ isPositive: true, description: "Total de Retiradas em Backlog", hideValue: true }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Realizadas TOTAL" value={allSucessosTotal} icon={<CheckCircle className="h-5 w-5" />} variant="success" trend={{ value: sucessoPercentage, isPositive: true, description: metaPercent !== undefined && faltaParaMetaTotal !== undefined ? `Faltam ${faltaParaMetaTotal} para meta de ${metaPercent}%` : "Entrantes menos cancelados" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Insucesso TOTAL" value={insucessoTotal} icon={<XCircle className="h-5 w-5" />} variant="danger" trend={{ value: insucessoTotalTrend, isPositive: false, description: "Em relação às retiradas entrantes", percentageColor: "text-destructive" }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Canceladas TOTAL" value={canceladasTotal} icon={<AlertTriangle className="h-5 w-5" />} variant="amber" trend={{ value: canceladasTotalTrend, isPositive: false, description: "Total de itens cancelados", percentageColor: "text-amber-600" }} />
          </div>
        </div>

        {/* Coluna Fibra: 2 + 2 abaixo */}
        <div className={`space-y-4 min-w-0 flex flex-col w-full${debug ? ' outline outline-1 outline-blue-200' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Backlog de Retiradas FIBRA" value={backlogFibraCount} icon={<FileSpreadsheet className="h-5 w-5" />} trend={{ isPositive: true, description: "Retiradas de Modems em Backlog", hideValue: true }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Realizadas FIBRA" value={sucessoModemFibraTotal} icon={<CheckCircle className="h-5 w-5" />} variant="success" trend={{ value: sucessoModemFibraTrend, isPositive: true, description: metaPercent !== undefined && faltaParaMetaFibra !== undefined ? `Faltam ${faltaParaMetaFibra} para meta de ${metaPercent}%` : "Entrantes menos cancelados" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Insucesso FIBRA" value={insucessoFibra} icon={<XCircle className="h-5 w-5" />} variant="danger" trend={{ value: referenciaFibraTotal > 0 ? Math.round((insucessoFibra / referenciaFibraTotal) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Canceladas FIBRA" value={canceladasFibra} icon={<AlertTriangle className="h-5 w-5" />} variant="amber" trend={{ value: referenciaFibraTotalAll > 0 ? Math.round((canceladasFibra / referenciaFibraTotalAll) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
          </div>
        </div>

        {/* Coluna PAYTV: 2 + 2 abaixo */}
        <div className={`space-y-4 min-w-0 flex flex-col w-full${debug ? ' outline outline-1 outline-blue-200' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Backlog de Retiradas PAYTV" value={backlogPaytvCount} icon={<FileSpreadsheet className="h-5 w-5" />} trend={{ isPositive: true, description: "Retiradas de Receptores em Backlog", hideValue: true }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Realizadas PAYTV" value={sucessoOutrosTotal} icon={<CheckCircle className="h-5 w-5" />} variant="success" trend={{ value: sucessoOutrosTrend, isPositive: true, description: metaPercent !== undefined && faltaParaMetaOutros !== undefined ? `Faltam ${faltaParaMetaOutros} para meta de ${metaPercent}%` : "Entrantes menos cancelados" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Insucesso PAYTV" value={insucessoPaytv} icon={<XCircle className="h-5 w-5" />} variant="danger" trend={{ value: referenciaOutrosTotal > 0 ? Math.round((insucessoPaytv / referenciaOutrosTotal) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
            <StatCard className="h-full min-w-0 w-full" title="Retiradas Canceladas PAYTV" value={canceladasPaytv} icon={<AlertTriangle className="h-5 w-5" />} variant="amber" trend={{ value: referenciaOutrosTotalAll > 0 ? Math.round((canceladasPaytv / referenciaOutrosTotalAll) * 100) : 0, isPositive: false, description: "Em relação às retiradas entrantes" }} />
          </div>
        </div>
      </div>

      <Charts
        statusICareData={statusICareData}
        statusICareOriginalData={statusICareOriginalData}
        statusAtividadeData={statusAtividadeData}
        monthlyData={monthlyData}
        tipoServicoData={tipoServicoData}
        modeloData={modeloData}
        statusByModelData={statusByModelData}
        combinedBacklogEvolutionData={combinedBacklogEvolutionData}
        referenceMonthName={referenceMonthName}
        referenceYear={referenceYear}
        statusICareWithTecnicoData={statusICareWithTecnicoData}
        statusICareDetailedByTecnicoData={statusICareDetailedByTecnicoData}
        tecnicoFilter={tecnicoFilter}
      />
    </div>
  );
}


