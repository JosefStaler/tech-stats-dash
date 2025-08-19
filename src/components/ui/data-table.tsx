import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ServiceData {
  id: string;
  cliente: string;
  tecnico: string;
  tipo: string;
  status: 'Concluído' | 'Pendente' | 'Em Andamento' | 'Cancelado';
  data: string;
  valor: number;
}

interface DataTableProps {
  data: ServiceData[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const statusConfig = {
  'Concluído': { variant: 'success' as const, className: 'bg-success/10 text-success border-success/20' },
  'Pendente': { variant: 'warning' as const, className: 'bg-warning/10 text-warning border-warning/20' },
  'Em Andamento': { variant: 'accent' as const, className: 'bg-accent/10 text-accent border-accent/20' },
  'Cancelado': { variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive border-destructive/20' }
};

export function DataTable({ data, currentPage, totalPages, onPageChange }: DataTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Cliente</TableHead>
              <TableHead className="font-semibold">Técnico</TableHead>
              <TableHead className="font-semibold">Tipo de Serviço</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Data</TableHead>
              <TableHead className="text-right font-semibold">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((service) => (
              <TableRow 
                key={service.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-mono text-sm">{service.id}</TableCell>
                <TableCell className="font-medium">{service.cliente}</TableCell>
                <TableCell>{service.tecnico}</TableCell>
                <TableCell>{service.tipo}</TableCell>
                <TableCell>
                  <Badge 
                    variant={statusConfig[service.status].variant}
                    className={statusConfig[service.status].className}
                  >
                    {service.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{service.data}</TableCell>
                <TableCell className="text-right font-medium">
                  R$ {service.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}