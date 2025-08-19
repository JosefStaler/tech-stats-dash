
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

export interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  dataAgendRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  statusICare: string;
  statusAtividade: string;
  tipoSubtipo: string;
  modelo: string;
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  tipoSubtipos: string[];
  modelos: string[];
  statusICardOptions: string[];
  statusAtividadeOptions: string[];
}

export function Filters({ 
  filters, 
  onFiltersChange, 
  tipoSubtipos, 
  modelos, 
  statusICardOptions, 
  statusAtividadeOptions 
}: FiltersProps) {
  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      dataAgendRange: { from: undefined, to: undefined },
      statusICare: "todos",
      statusAtividade: "todos",
      tipoSubtipo: "todos",
      modelo: "todos"
    });
  };

  const hasActiveFilters = !!(
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.dataAgendRange.from || 
    filters.dataAgendRange.to || 
    (filters.statusICare && filters.statusICare !== "todos") || 
    (filters.statusAtividade && filters.statusAtividade !== "todos") || 
    (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") || 
    (filters.modelo && filters.modelo !== "todos")
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.dataAgendRange.from || filters.dataAgendRange.to) count++;
    if (filters.statusICare && filters.statusICare !== "todos") count++;
    if (filters.statusAtividade && filters.statusAtividade !== "todos") count++;
    if (filters.tipoSubtipo && filters.tipoSubtipo !== "todos") count++;
    if (filters.modelo && filters.modelo !== "todos") count++;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

          {/* Data Agend. Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Agend.</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dataAgendRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataAgendRange.from ? (
                    filters.dataAgendRange.to ? (
                      <>
                        {format(filters.dataAgendRange.from, "dd/MM/yy")} -{" "}
                        {format(filters.dataAgendRange.to, "dd/MM/yy")}
                      </>
                    ) : (
                      format(filters.dataAgendRange.from, "dd/MM/yy")
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
                  defaultMonth={filters.dataAgendRange.from}
                  selected={filters.dataAgendRange}
                  onSelect={(range) => 
                    onFiltersChange({
                      ...filters,
                      dataAgendRange: { from: range?.from, to: range?.to }
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

          {/* Status Atividade Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Atividade</label>
            <Select
              value={filters.statusAtividade}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, statusAtividade: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {statusAtividadeOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
