
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  dataExecRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  statusICare: string;
  statusAtividade: string;
  tipoSubtipo: string;
  modelo: string;
  tecnicoUltimoAtendimento: string[];
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  tipoSubtipos: string[];
  modelos: string[];
  statusICardOptions: string[];
  statusAtividadeOptions: string[];
  tecnicoUltimoAtendimentoOptions: string[];
}

export function Filters({ 
  filters, 
  onFiltersChange, 
  tipoSubtipos, 
  modelos, 
  statusICardOptions, 
  statusAtividadeOptions,
  tecnicoUltimoAtendimentoOptions
}: FiltersProps) {
  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      dataExecRange: { from: undefined, to: undefined },
      statusICare: "todos",
      statusAtividade: "todos",
      tipoSubtipo: "todos",
      modelo: "todos",
      tecnicoUltimoAtendimento: []
    });
  };

  const hasActiveFilters = !!(
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.dataExecRange.from || 
    filters.dataExecRange.to || 
    (filters.statusICare && filters.statusICare !== "todos") || 
    (filters.statusAtividade && filters.statusAtividade !== "todos") || 
    (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") || 
    (filters.modelo && filters.modelo !== "todos") ||
    (filters.tecnicoUltimoAtendimento && filters.tecnicoUltimoAtendimento.length > 0)
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.dataExecRange.from || filters.dataExecRange.to) count++;
    if (filters.statusICare && filters.statusICare !== "todos") count++;
    if (filters.statusAtividade && filters.statusAtividade !== "todos") count++;
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") count++;
    if (filters.modelo && filters.modelo !== "todos") count++;
    if (filters.tecnicoUltimoAtendimento && filters.tecnicoUltimoAtendimento.length > 0) count++;
    return count;
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Análise de Desempenho
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Data Criação Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Criação</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd/MM/yy")} -{" "}
                        {format(filters.dateRange.to, "dd/MM/yy")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd/MM/yy")
                    )
                  ) : (
                    "Período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={filters.dateRange}
                  onSelect={(range) => 
                    onFiltersChange({
                      ...filters,
                      dateRange: { from: range?.from, to: range?.to }
                    })
                  }
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Execução Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Execução</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dataExecRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataExecRange.from ? (
                    filters.dataExecRange.to ? (
                      <>
                        {format(filters.dataExecRange.from, "dd/MM/yy")} -{" "}
                        {format(filters.dataExecRange.to, "dd/MM/yy")}
                      </>
                    ) : (
                      format(filters.dataExecRange.from, "dd/MM/yy")
                    )
                  ) : (
                    "Período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dataExecRange.from}
                  selected={filters.dataExecRange}
                  onSelect={(range) => 
                    onFiltersChange({
                      ...filters,
                      dataExecRange: { from: range?.from, to: range?.to }
                    })
                  }
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo-Subtipo Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo-Subtipo de Serviço</label>
            <Select
              value={filters.tipoSubtipo}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, tipoSubtipo: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tipoSubtipos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modelo Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo</label>
            <Select
              value={filters.modelo}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, modelo: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os modelos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os modelos</SelectItem>
                {modelos.map((modelo) => (
                  <SelectItem key={modelo} value={modelo}>
                    {modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status iCare Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status iCare</label>
            <Select
              value={filters.statusICare}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, statusICare: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {statusICardOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Técnicos - Apenas Gráfico Filter */}
          <div className="space-y-2 col-span-2 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-indigo-950/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
            <label className="text-sm font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Técnicos - Apenas Gráfico
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Específico
              </Badge>
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="preenchido"
                  checked={filters.tecnicoUltimoAtendimento.includes("preenchido")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFiltersChange({ 
                        ...filters, 
                        tecnicoUltimoAtendimento: [...filters.tecnicoUltimoAtendimento, "preenchido"]
                      });
                    } else {
                      onFiltersChange({ 
                        ...filters, 
                        tecnicoUltimoAtendimento: filters.tecnicoUltimoAtendimento.filter(t => t !== "preenchido")
                      });
                    }
                  }}
                />
                <label htmlFor="preenchido" className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Apenas preenchidos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="vazio"
                  checked={filters.tecnicoUltimoAtendimento.includes("vazio")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFiltersChange({ 
                        ...filters, 
                        tecnicoUltimoAtendimento: [...filters.tecnicoUltimoAtendimento, "vazio"]
                      });
                    } else {
                      onFiltersChange({ 
                        ...filters, 
                        tecnicoUltimoAtendimento: filters.tecnicoUltimoAtendimento.filter(t => t !== "vazio")
                      });
                    }
                  }}
                />
                <label htmlFor="vazio" className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Apenas vazios
                </label>
              </div>
              {tecnicoUltimoAtendimentoOptions.map((tecnico) => (
                <div key={tecnico} className="flex items-center space-x-2">
                  <Checkbox 
                    id={tecnico}
                    checked={filters.tecnicoUltimoAtendimento.includes(tecnico)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFiltersChange({ 
                          ...filters, 
                          tecnicoUltimoAtendimento: [...filters.tecnicoUltimoAtendimento, tecnico]
                        });
                      } else {
                        onFiltersChange({ 
                          ...filters, 
                          tecnicoUltimoAtendimento: filters.tecnicoUltimoAtendimento.filter(t => t !== tecnico)
                        });
                      }
                    }}
                  />
                  <label htmlFor={tecnico} className="text-sm text-purple-700 dark:text-purple-300">
                    {tecnico}
                  </label>
                </div>
              ))}
            </div>
            {filters.tecnicoUltimoAtendimento.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.tecnicoUltimoAtendimento.map((tecnico) => (
                  <Badge 
                    key={tecnico} 
                    variant="secondary" 
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs"
                  >
                    {tecnico === "preenchido" ? "Preenchidos" : 
                     tecnico === "vazio" ? "Vazios" : 
                     tecnico}
                    <button
                      onClick={() => onFiltersChange({ 
                        ...filters, 
                        tecnicoUltimoAtendimento: filters.tecnicoUltimoAtendimento.filter(t => t !== tecnico)
                      })}
                      className="ml-1 hover:text-purple-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
