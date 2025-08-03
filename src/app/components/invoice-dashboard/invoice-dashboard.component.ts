// Enhanced imports for Angular 20 features
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InvoiceService } from '../../services/invoice.service';
import { ChatbotService } from '../../services/chatbot.service';
import { InvoiceDto, InvoiceListViewDto, ChatMessage, PaginatedList, InvoiceStats } from '../../models/invoice.model';
import { Nl2brPipe } from '../../pipes/nl2br.pipe';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Nl2brPipe,TextFieldModule],
  templateUrl: './invoice-dashboard.component.html',
  styleUrls: ['./invoice-dashboard.component.css']
})
export class InvoiceDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  invoices: InvoiceListViewDto[] = [];
  filteredInvoices: InvoiceListViewDto[] = [];

  showCreateModal = false;
  showEditModal = false;
  selectedInvoice: InvoiceDto | null = null;

  showChatbot = false;
  chatMessages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;

  createInvoiceForm: FormGroup;
  editInvoiceForm: FormGroup;

  currentPage = 0;
  pageSize = 10;
  paginatedData: PaginatedList<InvoiceListViewDto> | null = null;
  isLoading = false;

  Math = Math;

  stats: InvoiceStats = {
    totalInvoices: 0,
    totalAmount: 0
  };

  constructor(
    private invoiceService: InvoiceService,
    private chatbotService: ChatbotService,
    private fb: FormBuilder
  ) {
    this.createInvoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      clientName: ['', Validators.required],
      issueDate: ['', Validators.required],
      invoiceDetails: this.fb.array([])
    });
    this.editInvoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      clientName: ['', Validators.required],
      issueDate: ['', Validators.required],
      invoiceDetails: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadInvoices();
    this.chatMessages = [{
      text: 'Welcome! I can help you with your invoices. Try:\n• Show me the total value of invoices this month\n•Give me a summary of invoice number ..'
    }];
  }
  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

ngAfterViewChecked() {
  this.scrollToBottom();
}

scrollToBottom(): void {
  try {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  } catch (err) {
    console.error('Scroll error:', err);
  }
}


  loadInvoices() {
    this.isLoading = true;
    this.invoiceService.getInvoicesPaginated(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoices = res.data.items;
          this.paginatedData = res.data;
          this.stats.totalInvoices = res.data.totalCount;
          this.stats.totalAmount = res.data.items.reduce((acc, inv) => acc + inv.totalAmount, 0);
          this.filteredInvoices = this.invoices; // No search bar, all invoices displayed
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load invoices', err);
          this.isLoading = false;
        }
      });
  }
  
  openCreateModal() {
    this.showCreateModal = true;
    this.createInvoiceForm.reset();
    this.clearFormArray(this.invoiceDetails);
    this.addInvoiceItem(); // Always show one item by default
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.createInvoiceForm.reset();
    this.clearFormArray(this.invoiceDetails);
  }

  openEditModal(invoice: InvoiceListViewDto) {
    this.invoiceService.getInvoiceById(invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.selectedInvoice = res.data;
          const rawDate = res.data.issueDate;
          const formattedDate = rawDate ? rawDate.substring(0, 10) : '';
          this.editInvoiceForm.patchValue({
            invoiceNumber: res.data.invoiceNumber,
            clientName: res.data.clientName,
            totalAmount: res.data.totalAmount,
            issueDate: formattedDate 
          });
          // Fill item details array
          const detailsArray = this.editInvoiceForm.get('invoiceDetails') as FormArray;
          this.clearFormArray(detailsArray);
          if (res.data.invoiceDetails && res.data.invoiceDetails.length) {
            res.data.invoiceDetails.forEach(item => {
              detailsArray.push(this.fb.group({
                itemName: [item.itemName, Validators.required],
                quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                unitPrice: [item.unitPrice, [Validators.required, Validators.min(0.01)]]
              }));
            });
          } else {
            // At least 1 row
            detailsArray.push(this.fb.group({
              itemName: ['', Validators.required],
              quantity: [1, [Validators.required, Validators.min(1)]],
              unitPrice: [0.01, [Validators.required, Validators.min(0.01)]]
            }));
          }
          this.showEditModal = true;
        },
        error: (err) => {
          console.error('Error loading invoice', err);
        }
      });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedInvoice = null;
    this.editInvoiceForm.reset();
    this.clearFormArray(this.editInvoiceDetails);
  }

  createInvoice() {
    if (this.createInvoiceForm.valid && this.invoiceDetails.length > 0) {
      const formValue = this.createInvoiceForm.value;
      const newInvoice: InvoiceDto = {
        id: 0,
        invoiceNumber: formValue.invoiceNumber,
        clientName: formValue.clientName,
        issueDate: formValue.issueDate,
        totalAmount: this.calculatedTotalAmount,
        invoiceDetails: formValue.invoiceDetails
      };
      this.invoiceService.createInvoice(newInvoice).subscribe(() => {
        this.closeCreateModal();
        this.loadInvoices();
      });
    } else {
      this.createInvoiceForm.markAllAsTouched();
      this.invoiceDetails.controls.forEach(ctrl => ctrl.markAllAsTouched());
    }
  }

  updateInvoice() {
    if (this.editInvoiceForm.valid && this.selectedInvoice && this.editInvoiceDetails.length > 0) {
      const formValue = this.editInvoiceForm.value;
      const updated: InvoiceDto = {
        ...this.selectedInvoice,
        invoiceNumber: formValue.invoiceNumber,
        clientName: formValue.clientName,
        issueDate: formValue.issueDate,
        totalAmount: this.calculatedEditTotalAmount,
        invoiceDetails: formValue.invoiceDetails
      };
      this.invoiceService.updateInvoice(updated.id, updated).subscribe(() => {
        this.closeEditModal();
        this.loadInvoices();
      });
    } else {
      this.editInvoiceForm.markAllAsTouched();
      this.editInvoiceDetails.controls.forEach(ctrl => ctrl.markAllAsTouched());
    }
  }

  toggleChatbot() {
    this.showChatbot = !this.showChatbot;
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;
    const userMessage: ChatMessage = { text: this.currentMessage };
    this.chatMessages.push(userMessage);
    const toSend = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;
    this.chatbotService.processMessage(toSend).subscribe({
      next: (response) => {
        this.isTyping = false;
        this.chatMessages.push({ text: response });
      },
      error: () => {
        this.isTyping = false;
        this.chatMessages.push({ text: 'Sorry, something went wrong.' });
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  onPageChange(index: number) {
    this.currentPage = index;
    this.loadInvoices();
  }

  get invoiceDetails(): FormArray {
    return this.createInvoiceForm.get('invoiceDetails') as FormArray;
  }

  get editInvoiceDetails(): FormArray {
    return this.editInvoiceForm.get('invoiceDetails') as FormArray;
  }

  addInvoiceItem() {
    const item = this.fb.group({
      itemName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0.01, [Validators.required, Validators.min(0.01)]]
    });
    this.invoiceDetails.push(item);
  }

  removeInvoiceItem(index: number) {
    if (this.invoiceDetails.length > 1) {
      this.invoiceDetails.removeAt(index);
    }
  }

  addEditInvoiceItem() {
    const item = this.fb.group({
      itemName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0.01, [Validators.required, Validators.min(0.01)]]
    });
    this.editInvoiceDetails.push(item);
  }

  removeEditInvoiceItem(index: number) {
    if (this.editInvoiceDetails.length > 1) {
      this.editInvoiceDetails.removeAt(index);
    }
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  get calculatedTotalAmount(): number {
  const controls = this.createInvoiceForm.get('invoiceDetails') as FormArray;
  if (!controls || controls.length === 0) return 0;
  return controls.controls.reduce((sum, ctrl) => {
    const quantity = Number(ctrl.get('quantity')?.value) || 0;
    const unitPrice = Number(ctrl.get('unitPrice')?.value) || 0;
    return sum + (quantity * unitPrice);
  }, 0);
}

// For edit form:
get calculatedEditTotalAmount(): number {
  const controls = this.editInvoiceForm.get('invoiceDetails') as FormArray;
  if (!controls || controls.length === 0) return 0;
  return controls.controls.reduce((sum, ctrl) => {
    const quantity = Number(ctrl.get('quantity')?.value) || 0;
    const unitPrice = Number(ctrl.get('unitPrice')?.value) || 0;
    return sum + (quantity * unitPrice);
  }, 0);
}

}
