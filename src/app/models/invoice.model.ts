export interface InvoiceDto {
  id: number;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  totalAmount: number;
  invoiceDetails: InvoiceDetailDto[];
}

export interface InvoiceListViewDto {
  id: number;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  totalAmount: number;
}

export interface InvoiceDetailDto {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ChatMessage {
  text: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
}

export interface QuestionDto{
  question:string
}

