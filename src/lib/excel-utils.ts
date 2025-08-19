import * as XLSX from 'xlsx';
import { ServiceData } from '@/components/ui/data-table';

export interface ExcelParseResult {
  data: ServiceData[];
  success: boolean;
  error?: string;
}

export function parseExcelFile(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          resolve({
            data: [],
            success: false,
            error: 'Planilha vazia'
          });
          return;
        }

        // Extract headers and data
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        // Map expected columns (flexible mapping)
        const columnMap = mapColumns(headers);
        
        if (!columnMap.isValid) {
          resolve({
            data: [],
            success: false,
            error: 'Colunas obrigatórias não encontradas. Verifique se a planilha contém: ID, Cliente, Técnico, Tipo, Status, Data, Valor'
          });
          return;
        }

        // Parse rows into ServiceData
        const services: ServiceData[] = rows
          .filter(row => row && row.length > 0 && row[columnMap.id]) // Filter empty rows
          .map((row, index) => {
            try {
              return {
                id: String(row[columnMap.id] || `auto-${index + 1}`),
                cliente: String(row[columnMap.cliente] || ''),
                tecnico: String(row[columnMap.tecnico] || ''),
                tipo: String(row[columnMap.tipo] || ''),
                status: normalizeStatus(String(row[columnMap.status] || '')),
                data: formatDate(row[columnMap.data]),
                valor: parseFloat(String(row[columnMap.valor] || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
              };
            } catch (error) {
              console.error('Error parsing row:', error);
              return null;
            }
          })
          .filter(Boolean) as ServiceData[];

        resolve({
          data: services,
          success: true
        });

      } catch (error) {
        console.error('Error parsing Excel file:', error);
        resolve({
          data: [],
          success: false,
          error: 'Erro ao processar o arquivo Excel. Verifique se o formato está correto.'
        });
      }
    };

    reader.onerror = () => {
      resolve({
        data: [],
        success: false,
        error: 'Erro ao ler o arquivo'
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

function mapColumns(headers: string[]) {
  const normalizedHeaders = headers.map(h => String(h).toLowerCase().trim());
  
  const findColumn = (patterns: string[]) => {
    return normalizedHeaders.findIndex(header => 
      patterns.some(pattern => header.includes(pattern))
    );
  };

  const id = findColumn(['id', 'código', 'numero', 'número']);
  const cliente = findColumn(['cliente', 'client', 'customer']);
  const tecnico = findColumn(['técnico', 'tecnico', 'technician', 'responsável', 'responsavel']);
  const tipo = findColumn(['tipo', 'type', 'serviço', 'servico', 'categoria']);
  const status = findColumn(['status', 'estado', 'situação', 'situacao']);
  const data = findColumn(['data', 'date', 'quando', 'realizado']);
  const valor = findColumn(['valor', 'value', 'preço', 'preco', 'custo', 'receita']);

  return {
    id,
    cliente,
    tecnico,
    tipo,
    status,
    data,
    valor,
    isValid: id >= 0 && cliente >= 0 && tecnico >= 0 && tipo >= 0 && status >= 0 && data >= 0 && valor >= 0
  };
}

function normalizeStatus(status: string): ServiceData['status'] {
  const normalized = status.toLowerCase().trim();
  
  if (normalized.includes('conclu') || normalized.includes('finaliz') || normalized.includes('completo')) {
    return 'Concluído';
  }
  if (normalized.includes('pendent') || normalized.includes('aguard')) {
    return 'Pendente';
  }
  if (normalized.includes('andamento') || normalized.includes('progress') || normalized.includes('execu')) {
    return 'Em Andamento';
  }
  if (normalized.includes('cancel') || normalized.includes('abort')) {
    return 'Cancelado';
  }
  
  // Default fallback
  return 'Pendente';
}

function formatDate(dateValue: any): string {
  if (!dateValue) return new Date().toLocaleDateString('pt-BR');
  
  try {
    // Handle Excel date serial number
    if (typeof dateValue === 'number') {
      const date = XLSX.SSF.parse_date_code(dateValue);
      return new Date(date.y, date.m - 1, date.d).toLocaleDateString('pt-BR');
    }
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
    }
    
    return new Date().toLocaleDateString('pt-BR');
  } catch (error) {
    return new Date().toLocaleDateString('pt-BR');
  }
}

// Generate sample data for testing
export function generateSampleData(): ServiceData[] {
  const tecnicos = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Lima'];
  const tipos = ['Manutenção', 'Instalação', 'Reparo', 'Consultoria', 'Upgrade'];
  const statuses: ServiceData['status'][] = ['Concluído', 'Pendente', 'Em Andamento', 'Cancelado'];
  const clientes = ['Empresa A', 'Empresa B', 'Empresa C', 'Cliente X', 'Cliente Y', 'Corporação Z'];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `SRV-${String(i + 1).padStart(3, '0')}`,
    cliente: clientes[Math.floor(Math.random() * clientes.length)],
    tecnico: tecnicos[Math.floor(Math.random() * tecnicos.length)],
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    data: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
    valor: Math.floor(Math.random() * 5000) + 100
  }));
}