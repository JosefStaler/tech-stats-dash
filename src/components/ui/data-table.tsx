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
  "OS": string;
  "OS_Item": string;
  "Tipo-Subtipo de Serviço": string;
  "Data Criação": string;
  "Data Agend.": string;
  "Data Exec.": string;
  "Cycle Time": string;
  "Município": string;
  "Bairro": string;
  "Conta": string;
  "Cliente": string;
  "NDS": string;
  "Modelo": string;
  "Satus iCare": string;
  "Status Atividade": string;
  "Último Atendimento": string;
  "Técnico - Último Atendimento": string;
  "Tipo - Último Atendimento": string;
}

interface DataTableProps {
  data: ServiceData[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTable({ data, currentPage, totalPages, onPageChange }: DataTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">OS</TableHead>
              <TableHead className="font-semibold">Tipo-Subtipo</TableHead>
              <TableHead className="font-semibold">Data Criação</TableHead>
              <TableHead className="font-semibold">Data Agend.</TableHead>
              <TableHead className="font-semibold">Cliente</TableHead>
              <TableHead className="font-semibold">Município</TableHead>
              <TableHead className="font-semibold">Bairro</TableHead>
              <TableHead className="font-semibold">Status iCare</TableHead>
              <TableHead className="font-semibold">Técnico</TableHead>
              <TableHead className="font-semibold">Modelo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((service) => (
              <TableRow 
                key={service.OS}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-mono text-sm">{service.OS}</TableCell>
                <TableCell>{service["Tipo-Subtipo de Serviço"]}</TableCell>
                <TableCell className="text-muted-foreground">{service["Data Criação"]}</TableCell>
                <TableCell className="text-muted-foreground">{service["Data Agend."]}</TableCell>
                <TableCell className="font-medium">{service.Cliente}</TableCell>
                <TableCell>{service.Município}</TableCell>
                <TableCell>{service.Bairro}</TableCell>
                <TableCell>
                  <Badge variant={
                    (service["Satus iCare"] || '').includes("Concluído") ? "success" :
                    (service["Satus iCare"] || '').includes("Pendente") ? "destructive" :
                    (service["Satus iCare"] || '').includes("Andamento") ? "accent" : "secondary"
                  }>
                    {service["Satus iCare"] || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>{service["Técnico - Último Atendimento"]}</TableCell>
                <TableCell>{service.Modelo}</TableCell>
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