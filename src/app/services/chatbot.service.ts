import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { InvoiceService } from './invoice.service';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  constructor(private invoiceService: InvoiceService) {}

  processMessage(message: string): Observable<string> {
    const lowerMessage = message.toLowerCase();
    
    // Arabic language detection and responses
    const arabicPattern = /[\u0600-\u06FF]/;
    const isArabic = arabicPattern.test(message);
    
    return new Observable(observer => {
      setTimeout(() => {
        let response = '';
        
        if (isArabic) {
          response = this.getArabicResponse(lowerMessage);
        } else {
          response = this.getEnglishResponse(lowerMessage);
        }
        
        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }

  private getEnglishResponse(message: string): string {
    if (message.includes('pending') || message.includes('unpaid')) {
      return 'You have 3 pending invoices totaling $7,650. Would you like me to show you the details?';
    }
    
    if (message.includes('overdue')) {
      return 'You have 2 overdue invoices: INV-2024-007 ($4,200) and INV-2024-003 ($2,800). These need immediate attention.';
    }
    
    if (message.includes('total') || message.includes('amount') || message.includes('revenue')) {
      return 'Your total invoice amount is $19,850 across 8 invoices. This includes $7,650 pending, $7,000 overdue, and $5,200 paid.';
    }
    
    if (message.includes('create') || message.includes('new') || message.includes('add')) {
      return 'I can help you create a new invoice. Please provide the client name, amount, and due date, or use the "New Invoice" button above.';
    }
    
    if (message.includes('search') || message.includes('find')) {
      return 'You can search for invoices by client name, invoice number, or status using the search bar above. What are you looking for?';
    }
    
    if (message.includes('update') || message.includes('edit') || message.includes('change')) {
      return 'To update an invoice, click on the invoice in the list above and select "Edit". I can also help you change invoice status if needed.';
    }
    
    if (message.includes('$') || /\d+/.test(message)) {
      const amount = message.match(/\$?(\d+)/)?.[1];
      if (amount) {
        return `Looking for invoices with amount $${amount}... Let me search the database for you.`;
      }
    }
    
    if (message.includes('help') || message.includes('?')) {
      return `I can help you with:
• Show pending/overdue invoices
• Find invoices over a specific amount  
• Create new invoices
• Update invoice status
• Search by client or invoice number
• View invoice statistics

What would you like to do?`;
    }
    
    return 'I understand you\'re asking about invoices. I can help you manage invoices, check status, create new ones, or provide statistics. Could you be more specific about what you need?';
  }

  private getArabicResponse(message: string): string {
    if (message.includes('معلقة') || message.includes('قيد الانتظار')) {
      return 'لديك 3 فواتير معلقة بإجمالي $7,650. هل تريد مني إظهار التفاصيل؟';
    }
    
    if (message.includes('متأخرة') || message.includes('مستحقة')) {
      return 'لديك فاتورتان متأخرتان: INV-2024-007 ($4,200) و INV-2024-003 ($2,800). تحتاج هذه الفواتير إلى اهتمام فوري.';
    }
    
    if (message.includes('إجمالي') || message.includes('المبلغ') || message.includes('المجموع')) {
      return 'إجمالي مبلغ فواتيرك هو $19,850 عبر 8 فواتير. يشمل هذا $7,650 معلقة، و $7,000 متأخرة، و $5,200 مدفوعة.';
    }
    
    if (message.includes('إنشاء') || message.includes('جديدة') || message.includes('إضافة')) {
      return 'يمكنني مساعدتك في إنشاء فاتورة جديدة. يرجى تقديم اسم العميل والمبلغ وتاريخ الاستحقاق، أو استخدم زر "فاتورة جديدة" أعلاه.';
    }
    
    if (message.includes('بحث') || message.includes('العثور')) {
      return 'يمكنك البحث عن الفواتير حسب اسم العميل أو رقم الفاتورة أو الحالة باستخدام شريط البحث أعلاه. ماذا تبحث عنه؟';
    }
    
    if (message.includes('مساعدة') || message.includes('؟')) {
      return `يمكنني مساعدتك في:
• إظهار الفواتير المعلقة/المتأخرة
• العثور على فواتير تزيد عن مبلغ معين
• إنشاء فواتير جديدة  
• تحديث حالة الفاتورة
• البحث بالعميل أو رقم الفاتورة
• عرض إحصائيات الفواتير

ماذا تريد أن تفعل؟`;
    }
    
    return 'أفهم أنك تسأل عن الفواتير. يمكنني مساعدتك في إدارة الفواتير، والتحقق من الحالة، وإنشاء فواتير جديدة، أو تقديم الإحصائيات. هل يمكنك أن تكون أكثر تحديداً حول ما تحتاجه؟';
  }
}
