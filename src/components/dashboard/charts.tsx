import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

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

  // Calcular total para percentuais
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Adicionar dados processados com percentual
  const chartDataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
    label: `${item.value} (${total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'}%)`
  }));

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`Quantidade: ${value}`}</p>
          <p className="text-muted-foreground">{`Percentual: ${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status no iCare</CardTitle>
          <CardDescription>Status atual no iCare</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={chartDataWithPercentage}
              margin={{ top: 50, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3b82f6">
                <LabelList dataKey="label" position="top" style={{ fontSize: '12px', fill: 'currentColor' }} />
              </Bar>
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