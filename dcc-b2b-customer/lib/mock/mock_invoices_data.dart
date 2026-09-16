import '../models/invoice_model.dart';

/**
 * Mock invoices and payments dataset.
 */
abstract final class MockInvoicesData {
  static List<InvoiceModel> getInvoices() {
    final now = DateTime.now();

    return [
      InvoiceModel(
        id: 1,
        invoiceNumber: 'INV-2026-0087',
        orderNumber: 'B2B-2026-0001',
        customerName: 'Al-Rashid Distributors Ltd',
        issueDate: now
            .subtract(const Duration(days: 7))
            .toIso8601String()
            .substring(0, 10),
        dueDate: now
            .add(const Duration(days: 23))
            .toIso8601String()
            .substring(0, 10),
        totalAmount: 4850000,
        amountPaid: 4850000,
        balanceDue: 0,
        status: 'paid',
        sapReference: 'SAP-INV-98741',
      ),
      InvoiceModel(
        id: 2,
        invoiceNumber: 'INV-2026-0094',
        orderNumber: 'B2B-2026-0002',
        customerName: 'Al-Rashid Distributors Ltd',
        issueDate: now
            .subtract(const Duration(days: 1))
            .toIso8601String()
            .substring(0, 10),
        dueDate: now
            .add(const Duration(days: 29))
            .toIso8601String()
            .substring(0, 10),
        totalAmount: 3120000,
        amountPaid: 1000000,
        balanceDue: 2120000,
        status: 'partial',
        sapReference: 'SAP-INV-98788',
      ),
      InvoiceModel(
        id: 3,
        invoiceNumber: 'INV-2026-0045',
        orderNumber: 'B2B-2026-0000',
        customerName: 'Al-Rashid Distributors Ltd',
        issueDate: now
            .subtract(const Duration(days: 45))
            .toIso8601String()
            .substring(0, 10),
        dueDate: now
            .subtract(const Duration(days: 15))
            .toIso8601String()
            .substring(0, 10),
        totalAmount: 1850000,
        amountPaid: 0,
        balanceDue: 1850000,
        status: 'overdue',
        sapReference: 'SAP-INV-98520',
      ),
    ];
  }

  static List<PaymentModel> getPayments() {
    final now = DateTime.now();
    return [
      PaymentModel(
        id: 1,
        paymentNumber: 'PAY-2026-0045',
        invoiceNumber: 'INV-2026-0087',
        amount: 4850000,
        method: 'bank_transfer',
        reference: 'CRDB-TXN-884920',
        paidAt: now.subtract(const Duration(days: 6)).toIso8601String(),
        confirmedBy: 'Finance Dept',
      ),
      PaymentModel(
        id: 2,
        paymentNumber: 'PAY-2026-0051',
        invoiceNumber: 'INV-2026-0094',
        amount: 1000000,
        method: 'mobile_money',
        reference: 'MPESA-TX-77402',
        paidAt: now.subtract(const Duration(hours: 12)).toIso8601String(),
        confirmedBy: 'Finance Dept',
      ),
    ];
  }
}
