
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, ServiceData } from "@/components/ui/data-table";
import { FileUpload } from "@/components/ui/file-upload";
import { Filters, FilterState } from "@/components/dashboard/filters";
import { Charts } from "@/components/dashboard/charts";
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
import { parseExcelFile, generateSampleData } from "@/lib/excel-utils";

const Index = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Load sample data on mount
  useEffect(() => {
    const sampleData = generateSampleData();
    setServices(sampleData);
    toast({
      title: "Dados de exemplo carregados",
      description: "Carregue sua planilha para visualizar seus dados reais.",
    });
  }, [toast]);

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

    // Data Exec. filter
    if (filters.dataExecRange.from || filters.dataExecRange.to) {
      filtered = filtered.filter(service => {
        const serviceDate = parseDate(service["Data Exec."]);
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

  const handleLoadSample = () => {
    const sampleData = generateSampleData();
    setServices(sampleData);
    toast({
      title: "Dados de exemplo carregados",
      description: `${sampleData.length} serviços de exemplo foram carregados.`,
    });
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

  // Get current month services from all services (not filtered)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthServices = services.filter(s => {
    const serviceDate = parseDate(s["Data Criação"]);
    if (!serviceDate) return false;
    return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
  });

  // Statistics calculations
  const sucessoCount = filteredServices.filter(s => isSucesso(s["Satus iCare"])).length;
  const currentMonthTotal = currentMonthServices.length;
  const sucessoPercentage = currentMonthTotal > 0 ? Math.round((sucessoCount / currentMonthTotal) * 100) : 0;

  // Em Andamento calculations - separating Modem Fibra from others
  const emAndamentoServices = filteredServices.filter(s => s["Satus iCare"]?.includes('Andamento'));
  
  // Modem Fibra calculations - showing only success
  const sucessoModemFibra = filteredServices.filter(s => s["Modelo"] === "Modem Fibra" && isSucesso(s["Satus iCare"])).length;
  const currentMonthModemFibra = currentMonthServices.filter(s => s["Modelo"] === "Modem Fibra").length;
  const sucessoModemFibraPercentage = currentMonthModemFibra > 0 ? Math.round((sucessoModemFibra / currentMonthModemFibra) * 100) : 0;
  
  // Other models calculations - showing only success
  const sucessoOutros = filteredServices.filter(s => s["Modelo"] !== "Modem Fibra" && isSucesso(s["Satus iCare"])).length;
  const currentMonthOutros = currentMonthServices.filter(s => s["Modelo"] !== "Modem Fibra").length;
  const sucessoOutrosPercentage = currentMonthOutros > 0 ? Math.round((sucessoOutros / currentMonthOutros) * 100) : 0;

  const stats = {
    total: filteredServices.length,
    finalizados: filteredServices.filter(s => isFinalized(s["Satus iCare"])).length,
    sucesso: sucessoCount,
    sucessoTrend: sucessoPercentage,
    pendentes: filteredServices.filter(s => s["Satus iCare"]?.includes('Pendente')).length,
    emAndamento: emAndamentoServices.length,
    sucessoModemFibra: sucessoModemFibra,
    sucessoModemFibraTrend: sucessoModemFibraPercentage,
    sucessoOutros: sucessoOutros,
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
          <Card className="bg-gradient-secondary border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Dados de Exemplo
              </CardTitle>
              <CardDescription>
                Experimente o dashboard com dados simulados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLoadSample}
                variant="outline"
                className="w-full"
              >
                Carregar Dados de Exemplo
              </Button>
            </CardContent>
          </Card>
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total de Serviços"
                value={stats.total}
                icon={<FileSpreadsheet className="h-5 w-5" />}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Retiradas Realizadas"
                value={stats.sucesso}
                icon={<CheckCircle className="h-5 w-5" />}
                variant="success"
                trend={{ value: stats.sucessoTrend, isPositive: true }}
              />
              <StatCard
                title="Retiradas Realizadas Fibra"
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
                title="Pendentes"
                value={stats.pendentes}
                icon={<AlertTriangle className="h-5 w-5" />}
                variant="warning"
                trend={{ value: 15, isPositive: false }}
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
