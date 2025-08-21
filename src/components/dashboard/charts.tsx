import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, LineChart, Line, Legend } from "recharts";

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

interface CombinedBacklogEvolutionData {
  day: string;
  backlog: number;
  retiradas: number;
  backlogWithPrevious: number;
  sucessoWithPrevious: number;
  date: string;
}

interface ChartsProps {
  statusICareData: ChartData[];
  statusICareOriginalData: ChartData[];
  statusAtividadeData: ChartData[];
  monthlyData: MonthlyData[];
  tipoServicoData: ChartData[];
  modeloData: ChartData[];
  combinedBacklogEvolutionData: CombinedBacklogEvolutionData[];
  referenceMonthName: string;
  referenceYear: number;
  statusICareWithTecnicoData: ChartData[];
  statusICareDetailedByTecnicoData: ChartData[];
  tecnicoFilter: string;
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
    <div className="space-y-6">
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
            <CardTitle>Status iCare Detalhado</CardTitle>
            <CardDescription>Status detalhado no iCare</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // Usar dados originais sem agrupamento
              const originalData = props.statusICareOriginalData && props.statusICareOriginalData.length > 0 
                ? props.statusICareOriginalData.filter(item => item.value > 0)
                : [
                    { name: 'Sucesso-Reuso', value: 25 },
                    { name: 'Sucesso-Reversa', value: 20 },
                    { name: 'Backlog ≤ 4 Dias', value: 15 },
                    { name: 'Backlog > 4 Dias', value: 10 },
                    { name: 'Backlog > 30 Dias', value: 8 },
                    { name: 'Backlog > 60 Dias', value: 5 },
                    { name: 'Insucesso', value: 8 },
                    { name: 'Cancelado', value: 5 }
                  ];

              const originalTotal = originalData.reduce((sum, item) => sum + item.value, 0);
              
              const originalDataWithPercentage = originalData.map(item => ({
                ...item,
                percentage: originalTotal > 0 ? ((item.value / originalTotal) * 100).toFixed(1) : '0',
                label: `${item.value} (${originalTotal > 0 ? ((item.value / originalTotal) * 100).toFixed(1) : '0'}%)`
              }));

              const OriginalCustomTooltip = ({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const percentage = originalTotal > 0 ? ((value / originalTotal) * 100).toFixed(1) : '0';
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
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={originalDataWithPercentage}
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
                    <Tooltip content={<OriginalCustomTooltip />} />
                    <Bar dataKey="value" fill="#10b981">
                      <LabelList dataKey="label" position="top" style={{ fontSize: '12px', fill: 'currentColor' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Combined Backlog Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Backlog e Retiradas Realizadas - {props.referenceMonthName} {props.referenceYear}</CardTitle>
          <CardDescription>Evolução diária completa incluindo backlog total, retiradas realizadas, backlog com atendimento anterior e sucessos com atendimento anterior</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart 
              data={props.combinedBacklogEvolutionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={Math.floor(props.combinedBacklogEvolutionData.length / 10)} // Show every nth label to avoid overcrowding
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const backlog = payload.find(p => p.dataKey === 'backlog')?.value || 0;
                    const retiradas = payload.find(p => p.dataKey === 'retiradas')?.value || 0;
                    const backlogWithPrevious = payload.find(p => p.dataKey === 'backlogWithPrevious')?.value || 0;
                    const sucessoWithPrevious = payload.find(p => p.dataKey === 'sucessoWithPrevious')?.value || 0;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{`Data: ${label}`}</p>
                        <p className="text-amber-600">{`Backlog Total: ${backlog} itens`}</p>
                        <p className="text-green-600">{`Retiradas Realizadas: ${retiradas} itens`}</p>
                        <p className="text-orange-600">{`Backlog c/ Atendimento Anterior: ${backlogWithPrevious} itens`}</p>
                        <p className="text-blue-600">{`Sucesso c/ Atendimento Anterior: ${sucessoWithPrevious} itens`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '14px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="backlog" 
                stroke="hsl(45 93% 47%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(45 93% 47%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(45 93% 47%)', strokeWidth: 2 }}
                name="Backlog Total"
              />
              <Line 
                type="monotone" 
                dataKey="retiradas" 
                stroke="hsl(142 76% 36%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(142 76% 36%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(142 76% 36%)', strokeWidth: 2 }}
                name="Retiradas Realizadas"
              />
              <Line 
                type="monotone" 
                dataKey="backlogWithPrevious" 
                stroke="hsl(25 95% 53%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(25 95% 53%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(25 95% 53%)', strokeWidth: 2 }}
                name="Backlog c/ Atendimento Anterior"
              />
              <Line 
                type="monotone" 
                dataKey="sucessoWithPrevious" 
                stroke="hsl(217 91% 60%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(217 91% 60%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(217 91% 60%)', strokeWidth: 2 }}
                name="Sucesso c/ Atendimento Anterior"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Show new charts only when technician filter is active */}
      {props.tecnicoFilter && props.tecnicoFilter !== "todos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status no iCare - Com Técnico</CardTitle>
              <CardDescription>Status filtrado por técnico - último atendimento preenchido</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const chartData = props.statusICareWithTecnicoData && props.statusICareWithTecnicoData.length > 0 
                  ? props.statusICareWithTecnicoData.filter(item => item.value > 0)
                  : [];

                if (chartData.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                      Nenhum dado encontrado para o filtro selecionado
                    </div>
                  );
                }

                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                const chartDataWithPercentage = chartData.map(item => ({
                  ...item,
                  percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
                  label: `${item.value} (${total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'}%)`
                }));

                const CustomTooltipTecnico = ({ active, payload, label }: any) => {
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
                      <Tooltip content={<CustomTooltipTecnico />} />
                      <Bar dataKey="value" fill="#9333ea">
                        <LabelList dataKey="label" position="top" style={{ fontSize: '12px', fill: 'currentColor' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Detalhado por Técnico</CardTitle>
              <CardDescription>Status detalhado separado por técnico - último atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const chartData = props.statusICareDetailedByTecnicoData && props.statusICareDetailedByTecnicoData.length > 0 
                  ? props.statusICareDetailedByTecnicoData.filter(item => item.value > 0).slice(0, 20) // Limit to top 20 entries
                  : [];

                if (chartData.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                      Nenhum dado encontrado para o filtro selecionado
                    </div>
                  );
                }

                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                const chartDataWithPercentage = chartData.map(item => ({
                  ...item,
                  percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
                  label: `${item.value} (${total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'}%)`
                }));

                const DetailedCustomTooltip = ({ active, payload, label }: any) => {
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
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart 
                      data={chartDataWithPercentage}
                      margin={{ top: 50, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={120}
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip content={<DetailedCustomTooltip />} />
                      <Bar dataKey="value" fill="#ec4899">
                        <LabelList dataKey="label" position="top" style={{ fontSize: '10px', fill: 'currentColor' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}