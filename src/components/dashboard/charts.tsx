import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface MonthlyData {
  month: string;
  finalizados: number;
  pendentes: number;
  emAndamento: number;
  cycleTime: number;
}

interface ChartsProps {
  statusICareData: ChartData[];
  statusAtividadeData: ChartData[];
  monthlyData: MonthlyData[];
  tipoServicoData: ChartData[];
  modeloData: ChartData[];
}

export function Charts(props: ChartsProps) {
  
  console.log('=== PROPS DEBUG ===');
  console.log('statusICareData:', props.statusICareData);
  console.log('length:', props.statusICareData?.length);
  console.log('=== END DEBUG ===');
  
  // Use dados reais se existirem, senão dados de teste
  const chartData = props.statusICareData && props.statusICareData.length > 0 
    ? props.statusICareData.filter(item => item.value > 0)
    : [
        { name: 'Finalizado', value: 45 },
        { name: 'Pendente', value: 25 },
        { name: 'Em Andamento', value: 30 }
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status no iCare</CardTitle>
          <CardDescription>Status atual no iCare</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Teste</CardTitle>
          <CardDescription>Gráfico de teste</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4">
            <p>Dados recebidos: {JSON.stringify(props.statusICareData?.length || 0)} items</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}