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
    status: "todos",
    tecnico: "todos",
    tipo: "todos"
  });
  const { toast } = useToast();

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Extract unique values for filters
  const tecnicos = [...new Set(services.map(s => s["Técnico - Último Atendimento"]))].filter(Boolean);
  const tipos = [...new Set(services.map(s => s["Tipo-Subtipo de Serviço"]))].filter(Boolean);
  const statusOptions = ['Concluído', 'Pendente-Backlog ≤ 4 Dias', 'Pendente-Backlog > 4 Dias', 'Em Andamento'];

  // Load sample data on mount
  useEffect(() => {
    const sampleData = generateSampleData();
    setServices(sampleData);
    toast({
      title: "Dados de exemplo carregados",
      description: "Carregue sua planilha para visualizar seus dados reais.",
    });
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let filtered = [...services];

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(service => {
        const serviceDate = new Date(service["Data Criação"].split('/').reverse().join('-'));
        if (filters.dateRange.from && serviceDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && serviceDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Status filter
    if (filters.status && filters.status !== "todos") {
      filtered = filtered.filter(service => service["Satus iCare"] === filters.status);
    }

    // Técnico filter
    if (filters.tecnico && filters.tecnico !== "todos") {
      filtered = filtered.filter(service => service["Técnico - Último Atendimento"] === filters.tecnico);
    }

    // Tipo filter
    if (filters.tipo && filters.tipo !== "todos") {
      filtered = filtered.filter(service => service["Tipo-Subtipo de Serviço"] === filters.tipo);
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

  // Statistics calculations
  const stats = {
    total: filteredServices.length,
    concluidos: filteredServices.filter(s => s["Satus iCare"] === 'Concluído').length,
    pendentes: filteredServices.filter(s => s["Satus iCare"].includes('Pendente')).length,
    emAndamento: filteredServices.filter(s => s["Satus iCare"] === 'Em Andamento').length,
    cycleTimeTotal: filteredServices.reduce((sum, s) => sum + (parseInt(s["Cycle Time"]) || 0), 0),
    cycleTimeMedia: filteredServices.length > 0 ? 
      filteredServices.reduce((sum, s) => sum + (parseInt(s["Cycle Time"]) || 0), 0) / filteredServices.length : 0
  };

  // Chart data preparation
  const statusData = [
    { name: 'Concluído', value: stats.concluidos, fill: 'hsl(142 76% 36%)' },
    { name: 'Pendente', value: stats.pendentes, fill: 'hsl(45 93% 47%)' },
    { name: 'Em Andamento', value: stats.emAndamento, fill: 'hsl(36 77% 55%)' },
    { name: 'Outros', value: filteredServices.filter(s => 
      !s["Satus iCare"].includes('Concluído') && 
      !s["Satus iCare"].includes('Pendente') && 
      !s["Satus iCare"].includes('Andamento')
    ).length, fill: 'hsl(0 84% 60%)' }
  ];

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'short' });
    const monthServices = filteredServices.filter(s => {
      const serviceMonth = new Date(s["Data Criação"].split('/').reverse().join('-')).getMonth();
      return serviceMonth === i;
    });
    
    return {
      month,
      concluidos: monthServices.filter(s => s["Satus iCare"] === 'Concluído').length,
      pendentes: monthServices.filter(s => s["Satus iCare"].includes('Pendente')).length,
      emAndamento: monthServices.filter(s => s["Satus iCare"] === 'Em Andamento').length,
      cycleTime: monthServices.reduce((sum, s) => sum + (parseInt(s["Cycle Time"]) || 0), 0)
    };
  });

  const technicianData = tecnicos.map(tecnico => ({
    name: tecnico,
    value: filteredServices.filter(s => s["Técnico - Último Atendimento"] === tecnico).length
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const serviceTypeData = tipos.map(tipo => ({
    name: tipo,
    value: filteredServices.filter(s => s["Tipo-Subtipo de Serviço"] === tipo).length
  }));

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
              tecnicos={tecnicos}
              tipos={tipos}
              statusOptions={statusOptions}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total de Serviços"
                value={stats.total}
                icon={<FileSpreadsheet className="h-5 w-5" />}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Serviços Concluídos"
                value={stats.concluidos}
                icon={<CheckCircle className="h-5 w-5" />}
                variant="success"
                trend={{ value: 8, isPositive: true }}
              />
              <StatCard
                title="Em Andamento"
                value={stats.emAndamento}
                icon={<Clock className="h-5 w-5" />}
                variant="accent"
                trend={{ value: 5, isPositive: false }}
              />
              <StatCard
                title="Cycle Time Total"
                value={`${stats.cycleTimeTotal} dias`}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="warning"
                trend={{ value: 15, isPositive: true }}
              />
            </div>

            {/* Charts */}
            <Charts
              statusData={statusData}
              monthlyData={monthlyData}
              technicianData={technicianData}
              serviceTypeData={serviceTypeData}
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
                  Visualização detalhada de todos os serviços técnicos
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