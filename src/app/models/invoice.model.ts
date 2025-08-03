export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  date: string;
  dueDate?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  pending: number;
  overdue: number;
}
