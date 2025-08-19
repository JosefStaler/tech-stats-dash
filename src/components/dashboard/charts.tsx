import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

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
  
  console.log('=== CHARTS DEBUG ===');
  console.log('statusICareData:', statusICareData);
  console.log('=== END DEBUG ===');

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
              data={statusICareData} 
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={COLORS.accent}
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="finalizados" 
                fill={COLORS.success} 
                name="Finalizados"
              />
              <Bar 
                dataKey="pendentes" 
                fill={COLORS.warning} 
                name="Pendentes"
              />
              <Bar 
                dataKey="emAndamento" 
                fill={COLORS.accent} 
                name="Em Andamento"
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cycleTime" 
                stroke={COLORS.accent}
                strokeWidth={3}
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={COLORS.success}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}