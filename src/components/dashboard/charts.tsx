
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = {
  primary: 'hsl(218 84% 45%)',
  accent: 'hsl(36 77% 55%)',
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(45 93% 47%)',
  destructive: 'hsl(0 84% 60%)',
  muted: 'hsl(210 12% 45%)'
};

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

export function Charts({ 
  statusICareData, 
  statusAtividadeData, 
  monthlyData, 
  tipoServicoData, 
  modeloData 
}: ChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Debug dos dados
  console.log('statusICareData:', statusICareData);
  console.log('statusICareData filtered:', statusICareData.filter(item => item.value > 0));

  // Dados de teste hardcoded para validar se o gráfico funciona
  const testData = [
    { name: 'Finalizado', value: 50 },
    { name: 'Pendente', value: 30 },
    { name: 'Em Andamento', value: 20 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status iCare Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status no iCare</CardTitle>
          <CardDescription>
            Status atual no iCare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={testData} 
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150}
                tickFormatter={(value) => {
                  const parts = value.split('-');
                  return parts[parts.length - 1] || value;
                }}
              />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Atividade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Atividade</CardTitle>
          <CardDescription>
            Status de atividade dos serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusAtividadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={COLORS.accent}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Mensal</CardTitle>
          <CardDescription>
            Evolução dos status ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="finalizados" 
                fill={COLORS.success} 
                name="Finalizados"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="pendentes" 
                fill={COLORS.warning} 
                name="Pendentes"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="emAndamento" 
                fill={COLORS.accent} 
                name="Em Andamento"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cycle Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Cycle Time</CardTitle>
          <CardDescription>
            Cycle Time médio mensal (em dias)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                fontSize={12}
                label={{ value: 'Dias', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: number) => [`${value} dias`, 'Cycle Time']}
              />
              <Line 
                type="monotone" 
                dataKey="cycleTime" 
                stroke={COLORS.accent}
                strokeWidth={3}
                dot={{ fill: COLORS.accent, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.accent, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Tipo de Serviço</CardTitle>
          <CardDescription>
            Quantidade de serviços por tipo-subtipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tipoServicoData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary}
                radius={[0, 2, 2, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Modelo</CardTitle>
          <CardDescription>
            Quantidade de serviços por modelo de equipamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modeloData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={COLORS.success}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
