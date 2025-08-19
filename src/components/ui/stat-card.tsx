import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value?: number;
    isPositive: boolean;
    description?: string;
    hideValue?: boolean;
  };
  variant?: "default" | "success" | "warning" | "accent";
  className?: string;
}

export function StatCard({ title, value, icon, trend, variant = "default", className }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-gradient-to-br from-success/5 to-success/10";
      case "warning":
        return "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10";
      case "accent":
        return "border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10";
      default:
        return "border-primary/20 bg-gradient-card";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "text-success bg-success/10";
      case "warning":
        return "text-warning bg-warning/10";
      case "accent":
        return "text-accent bg-accent/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-elegant hover:-translate-y-1",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          getIconStyles()
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && !trend.hideValue && trend.value !== undefined && (
            <div className="text-2xl font-bold text-success">
              ({trend.value}%)
            </div>
          )}
        </div>
        {trend && (
          <p className={cn(
            "text-xs flex items-center mt-1",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            <span className="mr-1">
              {trend.isPositive ? "↗" : "↘"}
            </span>
            {trend.description || "em relação às retiradas entrantes"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}