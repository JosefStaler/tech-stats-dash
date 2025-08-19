
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
    modelo: "todos"
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
  const statusICardOptions = [...new Set(services.map(s => s["Satus iCare"]))].filter(Boolean);
  const statusAtividadeOptions = [...new Set(services.map(s => s["Status Atividade"]))].filter(Boolean);


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
      filtered = filtered.filter(service => service["Satus iCare"] === filters.statusICare);
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

  // Get period services based on reference month for percentage calculations
  const referenceMonthServices = services.filter(s => {
    const serviceDate = parseDate(s["Data Criação"]);
    if (!serviceDate) return false;
    return serviceDate.getMonth() === referenceMonth && serviceDate.getFullYear() === referenceYear;
  });

  // Statistics calculations
  // For "Retiradas Realizadas" cards: count ALL successes regardless of creation date
  // But for percentage calculation, use current month total from selected period
  
  // Get services filtered only by date range (for percentage calculation base)
  const periodFilteredServices = services.filter(service => {
    if (filters.dateRange.from || filters.dateRange.to) {
      const serviceDate = parseDate(service["Data Criação"]);
      if (!serviceDate) return false;
      if (filters.dateRange.from && serviceDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && serviceDate > filters.dateRange.to) return false;
      return true;
    }
    return true; // If no date filter, consider all
  });

  // Total successes (independent of creation date, but respecting other filters except date)
  const allSucessosTotal = services.filter(s => {
    // Apply all filters except date filters
    let matches = isSucesso(s["Satus iCare"]);
    
    if (filters.statusICare && filters.statusICare !== "todos") {
      matches = matches && s["Satus iCare"] === filters.statusICare;
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

  // MODEM FIBRA calculations
  const sucessoModemFibraTotal = services.filter(s => {
    let matches = s["Modelo"] === "MODEM FIBRA" && isSucesso(s["Satus iCare"]);
    
    // Apply non-date filters
    if (filters.statusICare && filters.statusICare !== "todos") {
      matches = matches && s["Satus iCare"] === filters.statusICare;
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
  
  const referenceModemFibraTotal = referenceMonthServices.filter(s => s["Modelo"] === "MODEM FIBRA").length;
  const sucessoModemFibraPercentage = referenceModemFibraTotal > 0 ? Math.round((sucessoModemFibraTotal / referenceModemFibraTotal) * 100) : 0;
  
  // Other models calculations
  const sucessoOutrosTotal = services.filter(s => {
    let matches = s["Modelo"] !== "MODEM FIBRA" && isSucesso(s["Satus iCare"]);
    
    // Apply non-date filters
    if (filters.statusICare && filters.statusICare !== "todos") {
      matches = matches && s["Satus iCare"] === filters.statusICare;
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
  
  const referenceOutrosTotal = referenceMonthServices.filter(s => s["Modelo"] !== "MODEM FIBRA").length;
  const sucessoOutrosPercentage = referenceOutrosTotal > 0 ? Math.round((sucessoOutrosTotal / referenceOutrosTotal) * 100) : 0;

  // Calculate backlog count using the same grouping logic as the status chart
  const backlogCount = filteredServices.filter(s => {
    const status = s["Satus iCare"];
    return status?.includes('Backlog ≤ 4 Dias') || 
           status?.includes('Backlog > 4 Dias') || 
           status?.includes('Backlog > 14 Dias');
  }).length;

  // Calculate backlog count for MODEM FIBRA
  const backlogFibraCount = filteredServices.filter(s => {
    const status = s["Satus iCare"];
    const isBacklog = status?.includes('Backlog ≤ 4 Dias') || 
                      status?.includes('Backlog > 4 Dias') || 
                      status?.includes('Backlog > 14 Dias');
    return isBacklog && s["Modelo"] === "MODEM FIBRA";
  }).length;

  // Calculate backlog count for PAYTV (other models)
  const backlogPaytvCount = filteredServices.filter(s => {
    const status = s["Satus iCare"];
    const isBacklog = status?.includes('Backlog ≤ 4 Dias') || 
                      status?.includes('Backlog > 4 Dias') || 
                      status?.includes('Backlog > 14 Dias');
    return isBacklog && s["Modelo"] !== "MODEM FIBRA";
  }).length;

  const stats = {
    total: filteredServices.length,
    backlog: backlogCount,
    finalizados: filteredServices.filter(s => isFinalized(s["Satus iCare"])).length,
    sucesso: allSucessosTotal,
    sucessoTrend: sucessoPercentage,
    insucesso: filteredServices.filter(s => s["Satus iCare"]?.includes('Insucesso')).length,
    emAndamento: filteredServices.filter(s => s["Satus iCare"]?.includes('Andamento')).length,
    sucessoModemFibra: sucessoModemFibraTotal,
    sucessoModemFibraTrend: sucessoModemFibraPercentage,
    sucessoOutros: sucessoOutrosTotal,
    sucessoOutrosTrend: sucessoOutrosPercentage,
    cycleTimeTotal: filteredServices.reduce((sum, s) => sum + (parseInt(s["Cycle Time"]) || 0), 0),
    cycleTimeMedia: filteredServices.length > 0 ? 
      Math.round(filteredServices.reduce((sum, s) => sum + (parseInt(s["Cycle Time"]) || 0), 0) / filteredServices.length * 10) / 10 : 0
  };

  // Chart data preparation - Status iCare agrupado
  const getGroupedStatus = (status: string) => {
    if (status?.includes('Sucesso-Reuso') || status?.includes('Sucesso-Reversa')) {
      return 'Sucesso';
    }
    if (status?.includes('Backlog ≤ 4 Dias') || status?.includes('Backlog > 4 Dias') || status?.includes('Backlog > 14 Dias')) {
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
    const groupedStatus = getGroupedStatus(service["Satus iCare"]);
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
    const status = service["Satus iCare"] || 'Outros';
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
          status.includes('Backlog > 14 Dias') ? 'hsl(35 91% 40%)' :
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
      finalizados: monthServices.filter(s => isFinalized(s["Satus iCare"])).length,
      pendentes: monthServices.filter(s => s["Satus iCare"]?.includes('Pendente')).length,
      emAndamento: monthServices.filter(s => s["Satus iCare"]?.includes('Andamento')).length,
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
            {/* Filters */}
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              tipoSubtipos={tipoSubtipos}
              modelos={modelos}
              statusICardOptions={statusICardOptions}
              statusAtividadeOptions={statusAtividadeOptions}
            />

            {/* Small Total Cards - Current Month */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Entrantes no Mês de Referência</p>
                      <p className="text-xl font-bold">{referenceMonthServices.length}</p>
                    </div>
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">FIBRA Entrantes no Mês de Referência</p>
                      <p className="text-xl font-bold">{referenceMonthServices.filter(s => s["Modelo"] === "MODEM FIBRA").length}</p>
                    </div>
                    <Users className="h-6 w-6 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">PAYTV Entrantes no Mês de Referência</p>
                      <p className="text-xl font-bold">{referenceMonthServices.filter(s => s["Modelo"] !== "MODEM FIBRA").length}</p>
                    </div>
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <StatCard
                title="Backlog de Retiradas TOTAL"
                value={stats.backlog}
                icon={<FileSpreadsheet className="h-5 w-5" />}
                trend={{ isPositive: true, description: "Total de Retiradas em Backlog", hideValue: true }}
              />
              <StatCard
                title="Backlog de Retiradas FIBRA"
                value={backlogFibraCount}
                icon={<FileSpreadsheet className="h-5 w-5" />}
                trend={{ isPositive: true, description: "Retiradas de Modem em Backlog", hideValue: true }}
              />
              <StatCard
                title="Backlog de Retiradas PAYTV"
                value={backlogPaytvCount}
                icon={<FileSpreadsheet className="h-5 w-5" />}
                trend={{ isPositive: true, description: "Retiradas de Receptores em Backlog", hideValue: true }}
              />
              <StatCard
                title="Retiradas Realizadas"
                value={stats.sucesso}
                icon={<CheckCircle className="h-5 w-5" />}
                variant="success"
                trend={{ value: stats.sucessoTrend, isPositive: true }}
              />
              <StatCard
                title="Retiradas Realizadas FIBRA"
                value={stats.sucessoModemFibra}
                icon={<CheckCircle className="h-5 w-5" />}
                variant="success"
                trend={{ value: stats.sucessoModemFibraTrend, isPositive: true }}
              />
              <StatCard
                title="Retiradas Realizadas PAYTV"
                value={stats.sucessoOutros}
                icon={<CheckCircle className="h-5 w-5" />}
                variant="success"
                trend={{ value: stats.sucessoOutrosTrend, isPositive: true }}
              />
              <StatCard
                title="Total Insucesso"
                value={stats.insucesso}
                icon={<AlertTriangle className="h-5 w-5" />}
                variant="warning"
                trend={{ value: 15, isPositive: false, description: "Total de retiradas sem sucesso" }}
              />
              <StatCard
                title="Cycle Time Médio"
                value={`${stats.cycleTimeMedia} dias`}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="default"
                trend={{ value: 10, isPositive: true }}
              />
            </div>

            {/* Charts */}
            <Charts
              statusICareData={statusICareData}
              statusICareOriginalData={statusICareOriginalData}
              statusAtividadeData={statusAtividadeData}
              monthlyData={monthlyData}
              tipoServicoData={tipoServicoData}
              modeloData={modeloData}
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
