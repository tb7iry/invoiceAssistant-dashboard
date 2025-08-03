import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { Invoice, InvoiceStats } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoicesSubject = new BehaviorSubject<Invoice[]>([
    {
      id: '1',
      number: 'INV-2024-008',
      client: 'Digital Agency',
      amount: 1200,
      status: 'Pending',
      date: '2024-02-05',
      dueDate: '2024-03-05'
    },
    {
      id: '2',
      number: 'INV-2024-007',
      client: 'Innovation Labs',
      amount: 4200,
      status: 'Overdue',
      date: '2023-11-15',
      dueDate: '2023-12-15'
    },
    {
      id: '3',
      number: 'INV-2024-006',
      client: 'Local Business Co',
      amount: 750,
      status: 'Paid',
      date: '2024-02-01',
      dueDate: '2024-03-01'
    },
    {
      id: '4',
      number: 'INV-2024-005',
      client: 'Enterprise Corp',
      amount: 5500,
      status: 'Pending',
      date: '2024-01-30',
      dueDate: '2024-02-28'
    },
    {
      id: '5',
      number: 'INV-2024-004',
      client: 'Tech Startup',
      amount: 3200,
      status: 'Paid',
      date: '2024-01-25',
      dueDate: '2024-02-25'
    },
    {
      id: '6',
      number: 'INV-2024-003',
      client: 'Marketing Firm',
      amount: 2800,
      status: 'Overdue',
      date: '2023-12-20',
      dueDate: '2024-01-20'
    },
    {
      id: '7',
      number: 'INV-2024-002',
      client: 'Consulting Group',
      amount: 1850,
      status: 'Paid',
      date: '2024-01-15',
      dueDate: '2024-02-15'
    },
    {
      id: '8',
      number: 'INV-2024-001',
      client: 'Design Studio',
      amount: 950,
      status: 'Pending',
      date: '2024-01-10',
      dueDate: '2024-02-10'
    }
  ]);

  invoices$ = this.invoicesSubject.asObservable();

  getInvoices(): Observable<Invoice[]> {
    return this.invoices$;
  }

  getInvoiceStats(): Observable<InvoiceStats> {
    const invoices = this.invoicesSubject.value;
    const stats: InvoiceStats = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      pending: invoices.filter(inv => inv.status === 'Pending').length,
      overdue: invoices.filter(inv => inv.status === 'Overdue').length
    };
    return of(stats);
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): Observable<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString()
    };
    const currentInvoices = this.invoicesSubject.value;
    this.invoicesSubject.next([newInvoice, ...currentInvoices]);
    return of(newInvoice).pipe(delay(500));
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Observable<Invoice> {
    const currentInvoices = this.invoicesSubject.value;
    const invoiceIndex = currentInvoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex !== -1) {
      const updatedInvoice = { ...currentInvoices[invoiceIndex], ...updates };
      currentInvoices[invoiceIndex] = updatedInvoice;
      this.invoicesSubject.next([...currentInvoices]);
      return of(updatedInvoice).pipe(delay(500));
    }
    
    throw new Error('Invoice not found');
  }

  deleteInvoice(id: string): Observable<boolean> {
    const currentInvoices = this.invoicesSubject.value;
    const filteredInvoices = currentInvoices.filter(inv => inv.id !== id);
    this.invoicesSubject.next(filteredInvoices);
    return of(true).pipe(delay(500));
  }

  searchInvoices(query: string): Observable<Invoice[]> {
    const invoices = this.invoicesSubject.value;
    const filtered = invoices.filter(inv => 
      inv.number.toLowerCase().includes(query.toLowerCase()) ||
      inv.client.toLowerCase().includes(query.toLowerCase()) ||
      inv.status.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }
}
