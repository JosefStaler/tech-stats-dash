import * as XLSX from 'xlsx';

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

export async function parseExcelFile(file: File): Promise<{ success: boolean; data: ServiceData[]; error?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ServiceData[];
    
    if (jsonData.length === 0) {
      return { success: false, data: [], error: 'Planilha vazia' };
    }

    return { success: true, data: jsonData };
  } catch (error) {
    console.error('Erro ao processar planilha:', error);
    return { success: false, data: [], error: 'Erro ao processar arquivo Excel' };
  }
}

export function generateSampleData(): ServiceData[] {
  const clientes = [
    'JONAS GOMES DE OLIVEIRA',
    'MARIA SILVA SANTOS',
    'JOSÉ FERREIRA LIMA',
    'ANA COSTA PEREIRA',
    'CARLOS RODRIGUES FILHO'
  ];
  
  const tecnicos = [
    'RAFAEL FRANCISCO PEREIRA',
    'PEDRO SANTOS SILVA',
    'LUCAS OLIVEIRA COSTA',
    'MARCOS FERREIRA LIMA'
  ];
  
  const tipos = ['Ret-Voluntario', 'Instalação', 'Reparo', 'Manutenção'];
  const municipios = ['RECIFE', 'OLINDA', 'JABOATÃO', 'PAULISTA'];
  const bairros = ['BOA VISTA', 'CASA AMARELA', 'GRAÇAS', 'DERBY'];
  const modelos = ['MODEM FIBRA', 'ROTEADOR WIFI', 'ONT FIBRA', 'MODEM ADSL'];
  const statusOptions = [
    'Pendente-Backlog ≤ 4 Dias',
    'Finalizado-Sucesso-Reuso',
    'Executado-Sucesso-Reversa', 
    'Finalizado-Insucesso',
    'Em Andamento',
    'Pendente-Backlog > 4 Dias'
  ];

  return Array.from({ length: 50 }, (_, index) => ({
    "OS": `21813${String(index + 1).padStart(4, '0')}`,
    "OS_Item": `21813${String(index + 1).padStart(4, '0')}`,
    "Tipo-Subtipo de Serviço": tipos[Math.floor(Math.random() * tipos.length)],
    "Data Criação": new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
    "Data Agend.": Math.random() > 0.3 ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR') : '',
    "Data Exec.": Math.random() > 0.5 ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR') : '',
    "Cycle Time": String(Math.floor(Math.random() * 10)),
    "Município": municipios[Math.floor(Math.random() * municipios.length)],
    "Bairro": bairros[Math.floor(Math.random() * bairros.length)],
    "Conta": `15370${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    "Cliente": clientes[Math.floor(Math.random() * clientes.length)],
    "NDS": `ALCLFCC${Math.floor(Math.random() * 99999)}`,
    "Modelo": modelos[Math.floor(Math.random() * modelos.length)],
    "Satus iCare": statusOptions[Math.floor(Math.random() * statusOptions.length)],
    "Status Atividade": Math.random() > 0.7 ? 'Ativo' : '',
    "Último Atendimento": new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
    "Técnico - Último Atendimento": tecnicos[Math.floor(Math.random() * tecnicos.length)],
    "Tipo - Último Atendimento": ['PP', 'PF', 'PM'][Math.floor(Math.random() * 3)]
  }));
}