
import { 
  Users, 
  FileText, 
  AlertCircle, 
  DollarSign, 
  ArrowUp, 
  MessageCircle 
} from "lucide-react";
import { OverviewStatsData } from "@/hooks/useOverviewStats";
import { StatsCardProps } from "./StatsCard";

export function getStatItems(stats: OverviewStatsData): StatsCardProps[] {
  return [
    {
      title: "Total de Clientes",
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: `${stats.customerChange}% em 30 dias`,
      positive: stats.customerChange >= 0,
      color: "blue-500"
    },
    {
      title: "Faturas Abertas",
      value: stats.openInvoices.toString(),
      icon: FileText,
      change: `${stats.invoiceChange}% em 30 dias`,
      positive: stats.invoiceChange < 0, // Fewer open invoices is positive
      color: "indigo-500"
    },
    {
      title: "Faturas Atrasadas",
      value: stats.overdueInvoices.toString(),
      icon: AlertCircle,
      change: `${stats.overdueChange}% em 30 dias`,
      positive: stats.overdueChange >= 0, // Fewer overdue invoices is positive
      color: "amber-500"
    },
    {
      title: "Valor Recebido",
      value: `R$ ${stats.totalReceived.toFixed(2)}`,
      icon: DollarSign,
      change: `${stats.receivedChange}% em 30 dias`,
      positive: stats.receivedChange >= 0,
      color: "green-500"
    },
    {
      title: "Taxa de Conversão",
      value: `${Math.round(stats.conversionRate)}%`,
      icon: ArrowUp,
      change: `${stats.conversionChange}% em 30 dias`,
      positive: stats.conversionChange >= 0,
      color: "purple-500"
    },
    {
      title: "Mensagens Enviadas",
      value: stats.messagesSent.toString(),
      icon: MessageCircle,
      change: `${stats.messagesChange}% em 30 dias`,
      positive: stats.messagesChange >= 0,
      color: "cyan-500"
    }
  ];
}
