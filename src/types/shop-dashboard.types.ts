// ── Shop Dashboard Types ──

export interface CustomerOverviewParams {
  StartDate?: string;
  EndDate?: string;
  PageNumber?: number;
  PageSize?: number;
  ChurnDays?: number;
  Granularity?: string;
}

export interface CustomerOverviewData {
  fromUtc: string;
  toUtc: string;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface CustomerTrendItem {
  bucketStartUtc: string;
  newCustomers: number;
  returningCustomers: number;
  orders: number;
  revenue: number;
}

export interface TopSpenderItem {
  customerId: string;
  customerName: string;
  email: string;
  orders: number;
  totalSpent: number;
  lastOrderAtUtc: string;
}

export interface TopSpendersResponse {
  items: TopSpenderItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ChurnRiskItem {
  customerId: string;
  customerName: string;
  email: string;
  lifetimeOrders: number;
  lifetimeValue: number;
  lastOrderAtUtc: string;
  inactiveDays: number;
}

export interface ChurnRiskResponse {
  items: ChurnRiskItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PurchaseFrequencyData {
  fromUtc: string;
  toUtc: string;
  customersWithOrders: number;
  totalOrders: number;
  ordersPerCustomer: number;
  averageDaysBetweenOrders: number;
}

export interface ConversionSummaryData {
  fromUtc: string;
  toUtc: string;
  totalOrders: number;
  paidOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  paidRate: number;
  completionRate: number;
  cancelRate: number;
}
