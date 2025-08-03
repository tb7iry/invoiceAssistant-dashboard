import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { InvoiceService } from '../../services/invoice.service';
import { ChatbotService } from '../../services/chatbot.service';
import { Invoice, InvoiceStats, ChatMessage } from '../../models/invoice.model';
import { Nl2brPipe } from '../../pipes/nl2br.pipe';

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Nl2brPipe],
  templateUrl: './invoice-dashboard.component.html',
  styleUrls: ['./invoice-dashboard.component.css']
})
export class InvoiceDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  stats: InvoiceStats = { totalInvoices: 0, totalAmount: 0, pending: 0, overdue: 0 };
  
  searchQuery = '';
  selectedFilter = 'all';
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  selectedInvoice: Invoice | null = null;
  
  // Chat states
  showChatbot = false;
  chatMessages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;
  
  // Forms
  createInvoiceForm: FormGroup;
  editInvoiceForm: FormGroup;
  
  constructor(
    private invoiceService: InvoiceService,
    private chatbotService: ChatbotService,
    private fb: FormBuilder
  ) {
    this.createInvoiceForm = this.fb.group({
      number: ['', Validators.required],
      client: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      dueDate: ['', Validators.required],
      status: ['Pending', Validators.required]
    });

    this.editInvoiceForm = this.fb.group({
      number: ['', Validators.required],
      client: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      dueDate: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadInvoices();
    this.loadStats();
    
    // Initialize welcome message
    this.chatMessages = [{
      id: '1',
      text: 'Welcome! I can help you with your invoices. Try these examples:\n• Show me all pending invoices\n• What invoices are overdue?\n• Find invoices over $2000',
      isUser: false,
      timestamp: new Date()
    }];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices() {
    this.invoiceService.getInvoices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(invoices => {
        this.invoices = invoices;
        this.applyFilters();
      });
  }

  loadStats() {
    this.invoiceService.getInvoiceStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => this.stats = stats);
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.invoices];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.number.toLowerCase().includes(query) ||
        inv.client.toLowerCase().includes(query) ||
        inv.status.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status.toLowerCase() === this.selectedFilter);
    }
    
    this.filteredInvoices = filtered;
  }

  // Modal methods
  openCreateModal() {
    this.showCreateModal = true;
    this.createInvoiceForm.reset({
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    });
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.createInvoiceForm.reset();
  }

  openEditModal(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showEditModal = true;
    this.editInvoiceForm.patchValue(invoice);
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedInvoice = null;
    this.editInvoiceForm.reset();
  }

  // CRUD operations
  createInvoice() {
    if (this.createInvoiceForm.valid) {
      const formValue = this.createInvoiceForm.value;
      this.invoiceService.createInvoice({
        ...formValue,
        amount: Number(formValue.amount)
      }).subscribe(() => {
        this.closeCreateModal();
        this.loadStats();
      });
    }
  }

  updateInvoice() {
    if (this.editInvoiceForm.valid && this.selectedInvoice) {
      const formValue = this.editInvoiceForm.value;
      this.invoiceService.updateInvoice(this.selectedInvoice.id, {
        ...formValue,
        amount: Number(formValue.amount)
      }).subscribe(() => {
        this.closeEditModal();
        this.loadStats();
      });
    }
  }

  deleteInvoice(invoice: Invoice) {
    if (confirm(`Are you sure you want to delete invoice ${invoice.number}?`)) {
      this.invoiceService.deleteInvoice(invoice.id).subscribe(() => {
        this.loadStats();
      });
    }
  }

  // Chat methods
  toggleChatbot() {
    this.showChatbot = !this.showChatbot;
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: this.currentMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    this.chatMessages.push(userMessage);
    const messageToBeProcces = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;
    
    // Process with chatbot
    this.chatbotService.processMessage(messageToBeProcces)
      .subscribe(response => {
        this.isTyping = false;
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date()
        };
        this.chatMessages.push(botMessage);
      });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Paid': return 'status-paid';
      case 'Pending': return 'status-pending';
      case 'Overdue': return 'status-overdue';
      default: return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
