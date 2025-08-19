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
  concluidos: number;
  pendentes: number;
  emAndamento: number;
  receita: number;
}

interface ChartsProps {
  statusData: ChartData[];
  monthlyData: MonthlyData[];
  technicianData: ChartData[];
  serviceTypeData: ChartData[];
}

export function Charts({ statusData, monthlyData, technicianData, serviceTypeData }: ChartsProps) {
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

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>
            Porcentagem de serviços por status atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS.primary} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Mensal</CardTitle>
          <CardDescription>
            Serviços concluídos vs. pendentes por mês
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
                dataKey="concluidos" 
                fill={COLORS.success} 
                name="Concluídos"
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

      {/* Technician Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Técnico</CardTitle>
          <CardDescription>
            Número de serviços realizados por técnico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={technicianData} layout="horizontal">
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
                width={100}
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

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Receita</CardTitle>
          <CardDescription>
            Receita mensal ao longo do tempo
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
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
              />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke={COLORS.accent}
                strokeWidth={3}
                dot={{ fill: COLORS.accent, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.accent, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}