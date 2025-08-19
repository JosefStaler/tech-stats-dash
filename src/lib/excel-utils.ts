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

    // Process the data to convert Excel serial dates to proper format
    const processedData = jsonData.map(row => ({
      ...row,
      "Data Criação": parseDate(row["Data Criação"]),
      "Data Agend.": parseDate(row["Data Agend."]),
      "Data Exec.": parseDate(row["Data Exec."]),
      "Último Atendimento": parseDate(row["Último Atendimento"])
    }));

    return { success: true, data: processedData };
  } catch (error) {
    console.error('Erro ao processar planilha:', error);
    return { success: false, data: [], error: 'Erro ao processar arquivo Excel' };
  }
}

// Helper function to convert Excel serial date to JS Date
function excelSerialToDate(serial: number): Date {
  // Excel's epoch starts at January 1, 1900, but there's a bug in Excel that treats 1900 as a leap year
  // We need to account for this. Excel serial 1 = January 1, 1900
  const epochStart = new Date(1900, 0, 1);
  const daysToAdd = serial - 1; // Subtract 1 because Excel counts from 1, not 0
  
  // Account for the leap year bug in Excel (February 29, 1900 doesn't exist)
  const adjustedDays = serial > 59 ? daysToAdd - 1 : daysToAdd;
  
  const resultDate = new Date(epochStart);
  resultDate.setDate(epochStart.getDate() + adjustedDays);
  
  return resultDate;
}

// Helper function to parse date (either string or Excel serial number)
function parseDate(dateValue: any): string {
  if (!dateValue) return '';
  
  // If it's already a string in Brazilian format, return as is
  if (typeof dateValue === 'string') {
    // Check if it's already in DD/MM/YYYY format
    if (dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateValue;
    }
    // Try to parse as date and format to Brazilian
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('pt-BR');
    }
    return dateValue;
  }
  
  // If it's a number (Excel serial date), convert it
  if (typeof dateValue === 'number' && dateValue > 0) {
    const date = excelSerialToDate(dateValue);
    return date.toLocaleDateString('pt-BR');
  }
  
  return '';
}
