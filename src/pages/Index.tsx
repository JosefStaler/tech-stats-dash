
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, ServiceData } from "@/components/ui/data-table";
import { FileUpload } from "@/components/ui/file-upload";
import { Filters, FilterState } from "@/components/dashboard/filters";
import { Charts } from "@/components/dashboard/charts";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Download
} from "lucide-react";
import { parseExcelFile } from "@/lib/excel-utils";

const Index = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [referenceMonth, setReferenceMonth] = useState(new Date().getMonth());
  const [referenceYear, setReferenceYear] = useState(new Date().getFullYear());
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: undefined, to: undefined },
    dataExecRange: { from: undefined, to: undefined },
    statusICare: "todos",
    statusAtividade: "todos",
    tipoSubtipo: "todos",
    modelo: "todos",
    tecnicoUltimoAtendimento: []
  });
  const { toast } = useToast();

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Extract unique values for filters
  const tipoSubtipos = [...new Set(services.map(s => s["Tipo-Subtipo de Serviço"]))].filter(Boolean);
  const modelos = [...new Set(services.map(s => s["Modelo"]))].filter(Boolean);
  const statusICardOptions = [...new Set(services.map(s => s["Status iCare"]))].filter(Boolean);
  const statusAtividadeOptions = [];
  const tecnicoUltimoAtendimentoOptions = [...new Set(services.map(s => s["Técnico - Último Atendimento"]))].filter(Boolean);


  // Helper function to parse dates that might be Excel serial numbers
  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    // If it's a number (Excel serial date)
    if (typeof dateValue === 'number') {
      // Excel serial date to JavaScript date conversion
      const excelEpoch = new Date(1900, 0, 1);
      const days = dateValue - 2; // Adjust for Excel's leap year bug
      return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    }
    
    // If it's a string in DD/MM/YYYY format
    if (typeof dateValue === 'string') {
      if (dateValue.includes('/')) {
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }
    }
    
    return null;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...services];

    // Data Criação filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(service => {
        const serviceDate = parseDate(service["Data Criação"]);
        if (!serviceDate) return false;
        if (filters.dateRange.from && serviceDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && serviceDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Data Execução filter
    if (filters.dataExecRange.from || filters.dataExecRange.to) {
      filtered = filtered.filter(service => {
        const serviceDate = parseDate(service["Data Execução"]);
        if (!serviceDate) return false;
        if (filters.dataExecRange.from && serviceDate < filters.dataExecRange.from) return false;
        if (filters.dataExecRange.to && serviceDate > filters.dataExecRange.to) return false;
        return true;
      });
    }

    // Status iCare filter
    if (filters.statusICare && filters.statusICare !== "todos") {
      filtered = filtered.filter(service => service["Status iCare"] === filters.statusICare);
    }

    // Status Atividade filter
    if (filters.statusAtividade && filters.statusAtividade !== "todos") {
      filtered = filtered.filter(service => service["Status Atividade"] === filters.statusAtividade);
    }

    // Tipo-Subtipo filter
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") {
      filtered = filtered.filter(service => service["Tipo-Subtipo de Serviço"] === filters.tipoSubtipo);
    }

    // Modelo filter
    if (filters.modelo && filters.modelo !== "todos") {
      filtered = filtered.filter(service => service["Modelo"] === filters.modelo);
    }

    setFilteredServices(filtered);
    setCurrentPage(1);
  }, [services, filters]);

  const handleFileUpload = async (file: File) => {
    try {
      const result = await parseExcelFile(file);
      
      if (result.success) {
        setServices(result.data);
        toast({
          title: "Arquivo carregado com sucesso!",
          description: `${result.data.length} serviços foram importados.`,
        });
      } else {
        toast({
          title: "Erro ao carregar arquivo",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar o arquivo.",
        variant: "destructive",
      });
    }
  };


  // Function to check if service is finalized
  const isFinalized = (status: string | undefined) => {
    if (!status) return false;
    return status.includes('Finalizado-Sucesso-Reuso') || 
           status.includes('Executado-Sucesso-Reversa') || 
           status.includes('Finalizado-Insucesso');
  };

  // Function to check if service has success status
  const isSucesso = (status: string | undefined) => {
    if (!status) return false;
    return status.includes('Sucesso-Reuso') || status.includes('Sucesso-Reversa');
  };

  // Get reference month name and create variables for display
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const referenceMonthName = monthNames[referenceMonth];
  const displayPeriod = `${referenceMonthName}/${referenceYear}`;

  // Get period services based on reference month for percentage calculations
  const referenceMonthServices = services.filter(s => {
    const serviceDate = parseDate(s["Data Criação"]);
    if (!serviceDate) return false;
    return serviceDate.getMonth() === referenceMonth && serviceDate.getFullYear() === referenceYear;
  });

  // Get period services excluding cancelled items for entrance counting
  const referenceMonthServicesExcludingCancelled = referenceMonthServices.filter(s => {
    const status = s["Status iCare"];
    return !status?.includes('Cancelado');
  });

  // Statistics calculations for cards with "Data Execução"
  // These cards should only count services executed in the reference month
  
  // Filter services that have execution date in the reference month
  const referenceMonthExecutedServices = services.filter(s => {
    const execDate = parseDate(s["Data Execução"]);
    if (!execDate) return false;
    return execDate.getMonth() === referenceMonth && execDate.getFullYear() === referenceYear;
  });

  // Total successes (only from reference month executions)
  const allSucessosTotal = referenceMonthExecutedServices.filter(s => {
    // Apply all filters except date filters  
    let matches = isSucesso(s["Status iCare"]);
    
    if (filters.statusICare && filters.statusICare !== "todos") {
      matches = matches && s["Status iCare"] === filters.statusICare;
    }
    if (filters.statusAtividade && filters.statusAtividade !== "todos") {
      matches = matches && s["Status Atividade"] === filters.statusAtividade;
    }
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") {
      matches = matches && s["Tipo-Subtipo de Serviço"] === filters.tipoSubtipo;
    }
    if (filters.modelo && filters.modelo !== "todos") {
      matches = matches && s["Modelo"] === filters.modelo;
    }
    if (filters.dataExecRange.from || filters.dataExecRange.to) {
      const execDate = parseDate(s["Data Execução"]);
      if (!execDate) return false;
      if (filters.dataExecRange.from && execDate < filters.dataExecRange.from) return false;
      if (filters.dataExecRange.to && execDate > filters.dataExecRange.to) return false;
    }
    
    return matches;
  }).length;

  // For percentage: use reference month total as base
  const referenceMonthTotal = referenceMonthServices.length;
  const sucessoPercentage = referenceMonthTotal > 0 ? Math.round((allSucessosTotal / referenceMonthTotal) * 100) : 0;

  // MODEM FIBRA calculations (only from reference month executions)
  const sucessoModemFibraTotal = referenceMonthExecutedServices.filter(s => {
    let matches = s["Modelo"] === "MODEM FIBRA" && isSucesso(s["Status iCare"]);
    
    // Apply non-date filters
    if (filters.statusICare && filters.statusICare !== "todos") {
      matches = matches && s["Status iCare"] === filters.statusICare;
    }
    if (filters.statusAtividade && filters.statusAtividade !== "todos") {
      matches = matches && s["Status Atividade"] === filters.statusAtividade;
    }
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") {
      matches = matches && s["Tipo-Subtipo de Serviço"] === filters.tipoSubtipo;
    }
    if (filters.dataExecRange.from || filters.dataExecRange.to) {
      const execDate = parseDate(s["Data Execução"]);
      if (!execDate) return false;
      if (filters.dataExecRange.from && execDate < filters.dataExecRange.from) return false;
      if (filters.dataExecRange.to && execDate > filters.dataExecRange.to) return false;
    }
    
    return matches;
  }).length;
  
  const referenceModemFibraTotal = referenceMonthServicesExcludingCancelled.filter(s => s["Modelo"] === "MODEM FIBRA").length;
  const sucessoModemFibraPercentage = referenceModemFibraTotal > 0 ? Math.round((sucessoModemFibraTotal / referenceModemFibraTotal) * 100) : 0;
  
  // Other models calculations (only from reference month executions)
  const sucessoOutrosTotal = referenceMonthExecutedServices.filter(s => {
    let matches = s["Modelo"] !== "MODEM FIBRA" && isSucesso(s["Status iCare"]);
    
    // Apply non-date filters
    if (filters.statusICare && filters.statusICare !== "todos") {
      matches = matches && s["Status iCare"] === filters.statusICare;
    }
    if (filters.statusAtividade && filters.statusAtividade !== "todos") {
      matches = matches && s["Status Atividade"] === filters.statusAtividade;
    }
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") {
      matches = matches && s["Tipo-Subtipo de Serviço"] === filters.tipoSubtipo;
    }
    if (filters.dataExecRange.from || filters.dataExecRange.to) {
      const execDate = parseDate(s["Data Execução"]);
      if (!execDate) return false;
      if (filters.dataExecRange.from && execDate < filters.dataExecRange.from) return false;
      if (filters.dataExecRange.to && execDate > filters.dataExecRange.to) return false;
    }
    
    return matches;
  }).length;
  
  const referenceOutrosTotal = referenceMonthServicesExcludingCancelled.filter(s => s["Modelo"] !== "MODEM FIBRA").length;
  const sucessoOutrosPercentage = referenceOutrosTotal > 0 ? Math.round((sucessoOutrosTotal / referenceOutrosTotal) * 100) : 0;

  // Filter services excluding those with creation date > reference month or > max filter date
  const eligibleBacklogServices = services.filter(s => {
    const creationDate = parseDate(s["Data Criação"]);
    if (!creationDate) return false;
    
    // Exclude if creation date > reference month
    const refDate = new Date(referenceYear, referenceMonth + 1, 0); // Last day of reference month
    if (creationDate > refDate) return false;
    
    // Exclude if creation date > max filter date (if specified)
    if (filters.dateRange.to && creationDate > filters.dateRange.to) return false;
    
    return true;
  });

  // Calculate backlog count for all eligible services
  const backlogCount = eligibleBacklogServices.filter(s => {
    // Check if service has backlog status
    const status = s["Status iCare"];
    const isBacklog = status?.includes('Backlog ≤ 4 Dias') || 
                      status?.includes('Backlog > 4 Dias') || 
                      status?.includes('Backlog > 30 Dias') ||
                      status?.includes('Backlog > 60 Dias');
    
    if (!isBacklog) return false;
    
    // Apply other filters
    if (filters.statusICare && filters.statusICare !== "todos") {
      if (!s["Status iCare"]?.includes(filters.statusICare)) return false;
    }
    if (filters.modelo && filters.modelo !== "todos") {
      if (s["Modelo"] !== filters.modelo) return false;
    }
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") {
      if (s["Tipo-Subtipo de Serviço"] !== filters.tipoSubtipo) return false;
    }
    
    return true;
  }).length;

  // Calculate backlog count for MODEM FIBRA
  const backlogFibraCount = eligibleBacklogServices.filter(s => {
    // Check if service has backlog status and is MODEM FIBRA
    const status = s["Status iCare"];
    const isBacklog = status?.includes('Backlog ≤ 4 Dias') || 
                      status?.includes('Backlog > 4 Dias') || 
                      status?.includes('Backlog > 30 Dias') ||
                      status?.includes('Backlog > 60 Dias');
    
    if (!isBacklog || s["Modelo"] !== "MODEM FIBRA") return false;
    
    // Apply other filters
    if (filters.statusICare && filters.statusICare !== "todos") {
      if (!s["Status iCare"]?.includes(filters.statusICare)) return false;
    }
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") {
      if (s["Tipo-Subtipo de Serviço"] !== filters.tipoSubtipo) return false;
    }
    
    return true;
  }).length;

  // Calculate backlog count for PAYTV (other models)
  const backlogPaytvCount = eligibleBacklogServices.filter(s => {
    // Check if service has backlog status and is not MODEM FIBRA
    const status = s["Status iCare"];
    const isBacklog = status?.includes('Backlog ≤ 4 Dias') || 
                      status?.includes('Backlog > 4 Dias') || 
                      status?.includes('Backlog > 30 Dias') ||
                      status?.includes('Backlog > 60 Dias');
    
    if (!isBacklog || s["Modelo"] === "MODEM FIBRA") return false;
    
    // Apply other filters
    if (filters.statusICare && filters.statusICare !== "todos") {
      if (!s["Status iCare"]?.includes(filters.statusICare)) return false;
    }
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") {
      if (s["Tipo-Subtipo de Serviço"] !== filters.tipoSubtipo) return false;
    }
    
    return true;
  }).length;

  // Cálculos de Insucesso (Status iCare "Insucesso")
  const insucessoTotal = filteredServices.filter(s => {
    const status = s["Status iCare"];
    return status?.includes('Insucesso');
  }).length;

  const insucessoFibra = filteredServices.filter(s => {
    const status = s["Status iCare"];
    return status?.includes('Insucesso') && s["Modelo"] === "MODEM FIBRA";
  }).length;

  const insucessoPaytv = filteredServices.filter(s => {
    const status = s["Status iCare"];
    return status?.includes('Insucesso') && s["Modelo"] !== "MODEM FIBRA";
  }).length;

  // Percentuais de Insucesso em relação ao total de retiradas entrantes do mês
  const insucessoTotalPercentage = referenceMonthServices.length > 0 ? 
    Math.round((insucessoTotal / referenceMonthServices.length) * 100) : 0;
  const insucessoFibraPercentage = referenceMonthServices.length > 0 ? 
    Math.round((insucessoFibra / referenceMonthServices.length) * 100) : 0;
  const insucessoPaytvPercentage = referenceMonthServices.length > 0 ? 
    Math.round((insucessoPaytv / referenceMonthServices.length) * 100) : 0;

  // Cálculos de Canceladas (Status iCare "Cancelado")
  const canceladasTotal = filteredServices.filter(s => {
    const status = s["Status iCare"];
    return status?.includes('Cancelado');
  }).length;

  const canceladasFibra = referenceMonthServices.filter(s => {
    const status = s["Status iCare"];
    return status?.includes('Cancelado') && s["Modelo"] === "MODEM FIBRA";
  }).length;

  const canceladasPaytv = referenceMonthServices.filter(s => {
    const status = s["Status iCare"];
    return status?.includes('Cancelado') && s["Modelo"] !== "MODEM FIBRA";
  }).length;

  // Percentuais de Canceladas em relação ao total de retiradas entrantes do mês
  const canceladasTotalPercentage = referenceMonthServices.length > 0 ? 
    Math.round((canceladasTotal / referenceMonthServices.length) * 100) : 0;
  const canceladasFibraPercentage = referenceMonthServices.length > 0 ? 
    Math.round((canceladasFibra / referenceMonthServices.length) * 100) : 0;
  const canceladasPaytvPercentage = referenceMonthServices.length > 0 ? 
    Math.round((canceladasPaytv / referenceMonthServices.length) * 100) : 0;

  const stats = {
    total: filteredServices.length,
    backlog: backlogCount,
    finalizados: filteredServices.filter(s => isFinalized(s["Status iCare"])).length,
    sucesso: allSucessosTotal,
    sucessoTrend: sucessoPercentage,
    insucesso: referenceMonthExecutedServices.filter(s => s["Status iCare"]?.includes('Insucesso')).length,
    emAndamento: filteredServices.filter(s => s["Status iCare"]?.includes('Andamento')).length,
    sucessoModemFibra: sucessoModemFibraTotal,
    sucessoModemFibraTrend: sucessoModemFibraPercentage,
    sucessoOutros: sucessoOutrosTotal,
    sucessoOutrosTrend: sucessoOutrosPercentage,
    cycleTimeTotal: filteredServices.reduce((sum, s) => sum + (parseInt(s["Cycle Time"]) || 0), 0),
    insucessoTotal,
    insucessoTotalTrend: insucessoTotalPercentage,
    insucessoFibra,
    insucessoFibraTrend: insucessoFibraPercentage,
    insucessoPaytv,
    insucessoPaytvTrend: insucessoPaytvPercentage,
    canceladasTotal,
    canceladasTotalTrend: canceladasTotalPercentage,
    canceladasFibra,
    canceladasFibraTrend: canceladasFibraPercentage,
    canceladasPaytv,
    canceladasPaytvTrend: canceladasPaytvPercentage
  };

  // Chart data preparation - Status iCare agrupado
  const getGroupedStatus = (status: string) => {
    if (status?.includes('Sucesso-Reuso') || status?.includes('Sucesso-Reversa')) {
      return 'Sucesso';
    }
    if (status?.includes('Backlog ≤ 4 Dias') || status?.includes('Backlog > 4 Dias') || 
        status?.includes('Backlog > 30 Dias') || status?.includes('Backlog > 60 Dias')) {
      return 'Backlog';
    }
    if (status?.includes('Insucesso')) {
      return 'Insucesso';
    }
    if (status?.includes('Cancelado')) {
      return 'Cancelado';
    }
    return status || 'Outros';
  };

  const groupedStatusCounts = filteredServices.reduce((acc, service) => {
    const groupedStatus = getGroupedStatus(service["Status iCare"]);
    acc[groupedStatus] = (acc[groupedStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusICareData = Object.entries(groupedStatusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    fill: status === 'Sucesso' ? 'hsl(142 76% 36%)' :
          status === 'Backlog' ? 'hsl(45 93% 47%)' :
          status === 'Insucesso' ? 'hsl(0 84% 60%)' :
          status === 'Cancelado' ? 'hsl(210 12% 45%)' :
          'hsl(210 12% 45%)'
  }));

  // Chart data preparation - Status iCare original (não agrupado)
  const originalStatusCounts = filteredServices.reduce((acc, service) => {
    const status = service["Status iCare"] || 'Outros';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusICareOriginalData = Object.entries(originalStatusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    fill: status.includes('Sucesso-Reuso') ? 'hsl(159 84% 39%)' :
          status.includes('Sucesso-Reversa') ? 'hsl(142 76% 36%)' :
          status.includes('Backlog ≤ 4 Dias') ? 'hsl(54 91% 55%)' :
          status.includes('Backlog > 4 Dias') ? 'hsl(45 93% 47%)' :
          status.includes('Backlog > 30 Dias') ? 'hsl(35 91% 40%)' :
          status.includes('Backlog > 60 Dias') ? 'hsl(25 91% 35%)' :
          status.includes('Insucesso') ? 'hsl(0 84% 60%)' :
          status.includes('Cancelado') ? 'hsl(210 12% 45%)' :
          'hsl(210 12% 45%)'
  }));

  // Chart data preparation - Status Atividade
  const statusAtividadeData = statusAtividadeOptions.map(status => ({
    name: status || 'Sem Status',
    value: filteredServices.filter(s => s["Status Atividade"] === status).length
  }));

  // Monthly data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'short' });
    const monthServices = filteredServices.filter(s => {
      const dateStr = s["Data Criação"];
      if (!dateStr || typeof dateStr !== 'string') return false;
      try {
        const serviceMonth = new Date(dateStr.split('/').reverse().join('-')).getMonth();
        return serviceMonth === i;
      } catch (error) {
        return false;
      }
    });
    
    return {
      month,
      finalizados: monthServices.filter(s => isFinalized(s["Status iCare"])).length,
      pendentes: monthServices.filter(s => s["Status iCare"]?.includes('Pendente')).length,
      emAndamento: monthServices.filter(s => s["Status iCare"]?.includes('Andamento')).length,
      cycleTime: monthServices.length > 0 ? 
        Math.round(monthServices.reduce((sum, s) => sum + (parseInt(s["Cycle Time"]) || 0), 0) / monthServices.length * 10) / 10 : 0
    };
  });

  // Service type data
  const tipoServicoData = tipoSubtipos.map(tipo => ({
    name: tipo,
    value: filteredServices.filter(s => s["Tipo-Subtipo de Serviço"] === tipo).length
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  // Model data
  const modeloData = modelos.map(modelo => ({
    name: modelo,
    value: filteredServices.filter(s => s["Modelo"] === modelo).length
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  // Combined backlog evolution data with all metrics
  const combinedBacklogEvolutionData = (() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    const daysInMonth = new Date(referenceYear, referenceMonth + 1, 0).getDate();
    
    // If analyzing current month, limit to current day, otherwise show full month
    const maxDay = (referenceMonth === currentMonth && referenceYear === currentYear) 
      ? currentDay 
      : daysInMonth;
    
    const evolutionData = [];
    
    for (let day = 1; day <= maxDay; day++) {
      const measurementDate = new Date(referenceYear, referenceMonth, day);
      
      // Count services that are in backlog as of this measurement date
      const backlogCount = services.filter(service => {
        const status = service["Status iCare"];
        const isBacklogStatus = status?.includes('Backlog ≤ 4 Dias') || 
                               status?.includes('Backlog > 4 Dias') || 
                               status?.includes('Backlog > 30 Dias') ||
                               status?.includes('Backlog > 60 Dias');
        
        if (!isBacklogStatus) return false;
        
        // Check if service creation date is before or equal to measurement date
        const creationDate = parseDate(service["Data Criação"]);
        if (!creationDate) return false;
        
        return creationDate <= measurementDate;
      }).length;
      
      // Count successful withdrawals executed on this specific day
      const retirasRealizadas = services.filter(service => {
        const execDate = parseDate(service["Data Execução"]);
        if (!execDate) return false;
        
        // Check if execution date matches this day
        const isSameDay = execDate.getDate() === day && 
                         execDate.getMonth() === referenceMonth && 
                         execDate.getFullYear() === referenceYear;
        
        if (!isSameDay) return false;
        
        // Check if service has success status
        return isSucesso(service["Status iCare"]);
      }).length;

      // Count services that are in backlog with previous service as of this measurement date
      const backlogWithPreviousCount = services.filter(service => {
        const status = service["Status iCare"];
        const isBacklogStatus = status?.includes('Backlog ≤ 4 Dias') || 
                               status?.includes('Backlog > 4 Dias') || 
                               status?.includes('Backlog > 30 Dias') ||
                               status?.includes('Backlog > 60 Dias');
        
        if (!isBacklogStatus) return false;
        
        // Check if "Técnico - Último Atendimento" is filled
        const hasLastService = service["Técnico - Último Atendimento"] && 
                              service["Técnico - Último Atendimento"].trim() !== '';
        
        if (!hasLastService) return false;
        
        // Check if service creation date is before or equal to measurement date
        const creationDate = parseDate(service["Data Criação"]);
        if (!creationDate) return false;
        
        return creationDate <= measurementDate;
      }).length;
      
      // Count successful withdrawals with previous service executed on this specific day
      const sucessoWithPreviousCount = services.filter(service => {
        const execDate = parseDate(service["Data Execução"]);
        if (!execDate) return false;
        
        // Check if execution date matches this day
        const isSameDay = execDate.getDate() === day && 
                         execDate.getMonth() === referenceMonth && 
                         execDate.getFullYear() === referenceYear;
        
        if (!isSameDay) return false;
        
        // Check if service has success status
        if (!isSucesso(service["Status iCare"])) return false;
        
        // Check if "Técnico - Último Atendimento" is filled
        const hasLastService = service["Técnico - Último Atendimento"] && 
                              service["Técnico - Último Atendimento"].trim() !== '';
        
        return hasLastService;
      }).length;
      
      evolutionData.push({
        day: day.toString().padStart(2, '0'),
        backlog: backlogCount,
        retiradas: retirasRealizadas,
        backlogWithPrevious: backlogWithPreviousCount,
        sucessoWithPrevious: sucessoWithPreviousCount,
        date: measurementDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      });
    }
    
    return evolutionData;
  })();

  // Filter services by "Técnico - Último Atendimento" for the new charts
  const getFilteredByTecnico = (baseFilter?: (service: any) => boolean) => {
    let filtered = filteredServices;
    
    if (filters.tecnicoUltimoAtendimento.length > 0) {
      filtered = filtered.filter(s => {
        const tecnicoValue = s["Técnico - Último Atendimento"];
        const hasValue = tecnicoValue && tecnicoValue.trim() !== '';
        
        return filters.tecnicoUltimoAtendimento.some(filter => {
          if (filter === "preenchido") return hasValue;
          if (filter === "vazio") return !hasValue;
          return tecnicoValue === filter;
        });
      });
    }
    
    if (baseFilter) {
      filtered = filtered.filter(baseFilter);
    }
    
    return filtered;
  };

  // Chart data for Status iCare filtered by "Técnico - Último Atendimento"
  const statusICareWithTecnicoData = (() => {
    if (filters.tecnicoUltimoAtendimento.length === 0) return [];
    
    const filteredByTecnico = getFilteredByTecnico();
    
    const groupedStatusCounts = filteredByTecnico.reduce((acc, service) => {
      const groupedStatus = getGroupedStatus(service["Status iCare"]);
      acc[groupedStatus] = (acc[groupedStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedStatusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: status === 'Sucesso' ? 'hsl(142 76% 36%)' :
            status === 'Backlog' ? 'hsl(45 93% 47%)' :
            status === 'Insucesso' ? 'hsl(0 84% 60%)' :
            status === 'Cancelado' ? 'hsl(210 12% 45%)' :
            'hsl(210 12% 45%)'
    }));
  })();

  // Chart data for Status iCare detailed separated by "Técnico - Último Atendimento"
  const statusICareDetailedByTecnicoData = (() => {
    if (filters.tecnicoUltimoAtendimento.length === 0) return [];
    
    const filteredByTecnico = getFilteredByTecnico();
    
    // Helper function to format technician names
    const formatTecnicoName = (name: string) => {
      if (!name || name === 'Sem Técnico') return name;
      
      const words = name.trim().split(' ').filter(word => word.length > 0);
      if (words.length <= 3) return name;
      
      // Show first two names and last name
      return `${words[0]} ${words[1]} ${words[words.length - 1]}`;
    };
    
    const statusByTecnico = filteredByTecnico.reduce((acc, service) => {
      const originalTecnico = service["Técnico - Último Atendimento"] || 'Sem Técnico';
      const tecnico = formatTecnicoName(originalTecnico);
      const originalStatus = service["Status iCare"] || 'Outros';
      
      // Group all backlog types into a single "Backlog" category
      // Group all success types into a single "Sucesso" category
      let status;
      if (originalStatus.includes('Backlog')) {
        status = 'Backlog';
      } else if (originalStatus.includes('Sucesso')) {
        status = 'Sucesso';
      } else {
        status = originalStatus;
      }
      
      if (!acc[tecnico]) {
        acc[tecnico] = {};
      }
      acc[tecnico][status] = (acc[tecnico][status] || 0) + 1;
      
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Convert to chart format - show each technician as a separate data point with status counts
    const result = [];
    for (const [tecnico, statusCounts] of Object.entries(statusByTecnico)) {
      for (const [status, count] of Object.entries(statusCounts)) {
        result.push({
          name: `${tecnico} - ${status}`,
          value: count,
          tecnico,
          status,
          fill: status === 'Sucesso' ? 'hsl(142 76% 36%)' :
                status === 'Backlog' ? 'hsl(45 93% 47%)' :
                status.includes('Insucesso') ? 'hsl(0 84% 60%)' :
                status.includes('Cancelado') ? 'hsl(210 12% 45%)' :
                'hsl(210 12% 45%)'
        });
      }
    }
    
    return result.sort((a, b) => b.value - a.value);
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard de Serviços Técnicos</h1>
              <p className="text-primary-foreground/80">
                Análise completa dos serviços realizados e estatísticas de performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-12 w-12 text-primary-foreground/80" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* File Upload Section */}
        <div className="w-full">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {services.length > 0 && (
          <>
            {/* Month Selector */}
            <MonthSelector 
              selectedMonth={referenceMonth}
              selectedYear={referenceYear}
              onMonthChange={(month, year) => {
                setReferenceMonth(month);
                setReferenceYear(year);
              }}
            />

            {/* Filters */}
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              tipoSubtipos={tipoSubtipos}
              modelos={modelos}
              statusICardOptions={statusICardOptions}
              statusAtividadeOptions={statusAtividadeOptions}
              tecnicoUltimoAtendimentoOptions={tecnicoUltimoAtendimentoOptions}
            />

            {/* Small Total Cards - Current Month */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Entrantes em {displayPeriod}</p>
                        <p className="text-xl font-bold">{referenceMonthServices.length}</p>
                      </div>
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    title="Backlog de Retiradas TOTAL"
                    value={stats.backlog}
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    trend={{ isPositive: true, description: "Total de Retiradas em Backlog", hideValue: true }}
                  />
                  <StatCard
                    title="Retiradas Realizadas TOTAL"
                    value={stats.sucesso}
                    icon={<CheckCircle className="h-5 w-5" />}
                    variant="success"
                    trend={{ value: stats.sucessoTrend, isPositive: true }}
                  />
                  <StatCard
                    title="Retiradas Insucesso TOTAL"
                    value={stats.insucessoTotal}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    variant="danger"
                    trend={{ value: stats.insucessoTotalTrend, isPositive: false, description: "Em relação às retiradas entrantes", percentageColor: "text-destructive" }}
                  />
                   <StatCard
                     title="Retiradas Canceladas TOTAL"
                     value={stats.canceladasTotal}
                     icon={<AlertTriangle className="h-5 w-5" />}
                     variant="amber"
                     trend={{ value: stats.canceladasTotalTrend, isPositive: false, description: "Total de retiradas canceladas", percentageColor: "text-amber-600" }}
                   />
                </div>
              </div>
              
              <div className="space-y-4">
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">FIBRA Entrantes em {displayPeriod}</p>
                        <p className="text-xl font-bold">{referenceMonthServicesExcludingCancelled.filter(s => s["Modelo"] === "MODEM FIBRA").length}</p>
                      </div>
                      <Users className="h-6 w-6 text-success" />
                    </div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    title="Backlog de Retiradas FIBRA"
                    value={backlogFibraCount}
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    trend={{ isPositive: true, description: "Retiradas de Modem em Backlog", hideValue: true }}
                  />
                  <StatCard
                    title="Retiradas Realizadas FIBRA"
                    value={stats.sucessoModemFibra}
                    icon={<CheckCircle className="h-5 w-5" />}
                    variant="success"
                    trend={{ value: stats.sucessoModemFibraTrend, isPositive: true, description: "Retiradas entrantes menos itens cancelados" }}
                  />
                  <StatCard
                    title="Retiradas Insucesso FIBRA"
                    value={stats.insucessoFibra}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    variant="danger"
                    trend={{ value: stats.insucessoFibraTrend, isPositive: false, description: "Em relação às retiradas entrantes", percentageColor: "text-destructive" }}
                  />
                   <StatCard
                     title="Retiradas Canceladas FIBRA"
                     value={stats.canceladasFibra}
                     icon={<AlertTriangle className="h-5 w-5" />}
                     variant="amber"
                     trend={{ value: stats.canceladasFibraTrend, isPositive: false, description: "Em relação às retiradas entrantes", percentageColor: "text-amber-600" }}
                   />
                </div>
              </div>
              
              <div className="space-y-4">
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">PAYTV Entrantes em {displayPeriod}</p>
                        <p className="text-xl font-bold">{referenceMonthServicesExcludingCancelled.filter(s => s["Modelo"] !== "MODEM FIBRA").length}</p>
                      </div>
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    title="Backlog de Retiradas PAYTV"
                    value={backlogPaytvCount}
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    trend={{ isPositive: true, description: "Retiradas de Receptores em Backlog", hideValue: true }}
                  />
                  <StatCard
                    title="Retiradas Realizadas PAYTV"
                    value={stats.sucessoOutros}
                    icon={<CheckCircle className="h-5 w-5" />}
                    variant="success"
                    trend={{ value: stats.sucessoOutrosTrend, isPositive: true, description: "Retiradas entrantes menos itens cancelados" }}
                  />
                  <StatCard
                    title="Retiradas Insucesso PAYTV"
                    value={stats.insucessoPaytv}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    variant="danger"
                    trend={{ value: stats.insucessoPaytvTrend, isPositive: false, description: "Em relação às retiradas entrantes", percentageColor: "text-destructive" }}
                  />
                   <StatCard
                     title="Retiradas Canceladas PAYTV"
                     value={stats.canceladasPaytv}
                     icon={<AlertTriangle className="h-5 w-5" />}
                     variant="amber"
                     trend={{ value: stats.canceladasPaytvTrend, isPositive: false, description: "Em relação às retiradas entrantes", percentageColor: "text-amber-600" }}
                   />
                </div>
              </div>
            </div>

            {/* Charts */}
            <Charts
              statusICareData={statusICareData}
              statusICareOriginalData={statusICareOriginalData}
              statusAtividadeData={statusAtividadeData}
              monthlyData={monthlyData}
              tipoServicoData={tipoServicoData}
              modeloData={modeloData}
              combinedBacklogEvolutionData={combinedBacklogEvolutionData}
              referenceMonthName={referenceMonthName}
              referenceYear={referenceYear}
              statusICareWithTecnicoData={statusICareWithTecnicoData}
              statusICareDetailedByTecnicoData={statusICareDetailedByTecnicoData}
              tecnicoFilter={filters.tecnicoUltimoAtendimento}
            />

            {/* Data Table */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Lista de Serviços
                  <span className="text-muted-foreground text-sm font-normal">
                    ({filteredServices.length} {filteredServices.length === 1 ? 'item' : 'itens'})
                  </span>
                </CardTitle>
                <CardDescription>
                  Visualização detalhada de todos os serviços técnicos filtrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={paginatedServices}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
