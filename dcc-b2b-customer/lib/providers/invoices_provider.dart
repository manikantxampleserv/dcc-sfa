import 'package:flutter/foundation.dart';
import '../mock/mock_invoices_data.dart';
import '../models/invoice_model.dart';

/**
 * Provider handling customer invoices and payment transactions.
 */
class InvoicesProvider with ChangeNotifier {
  List<InvoiceModel> _invoices = [];
  List<PaymentModel> _payments = [];
  String _selectedFilter = 'All';

  List<InvoiceModel> get invoices => _invoices;
  List<PaymentModel> get payments => _payments;
  String get selectedFilter => _selectedFilter;

  static const List<String> filters = ['All', 'Paid', 'Partial', 'Overdue'];

  InvoicesProvider() {
    _invoices = MockInvoicesData.getInvoices();
    _payments = MockInvoicesData.getPayments();
  }

  List<InvoiceModel> get filteredInvoices {
    if (_selectedFilter == 'All') return _invoices;
    return _invoices.where((inv) => inv.status.toLowerCase() == _selectedFilter.toLowerCase()).toList();
  }

  double get totalOutstandingBalance {
    return _invoices.fold(0.0, (sum, inv) => sum + inv.balanceDue);
  }

  int get overdueInvoicesCount {
    return _invoices.where((inv) => inv.status == 'overdue').length;
  }

  void setFilter(String filter) {
    _selectedFilter = filter;
    notifyListeners();
  }

  /**
   * Submits a payment reference for an invoice.
   */
  Future<bool> makePayment({
    required String invoiceNumber,
    required double amount,
    required String method,
    required String reference,
  }) async {
    await Future.delayed(const Duration(milliseconds: 600));

    final invIndex = _invoices.indexWhere((inv) => inv.invoiceNumber == invoiceNumber);
    if (invIndex != -1) {
      final inv = _invoices[invIndex];
      final newAmountPaid = inv.amountPaid + amount;
      final newBalance = (inv.totalAmount - newAmountPaid).clamp(0.0, double.infinity);
      final newStatus = newBalance == 0 ? 'paid' : 'partial';

      _invoices[invIndex] = InvoiceModel(
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        orderNumber: inv.orderNumber,
        customerName: inv.customerName,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        totalAmount: inv.totalAmount,
        amountPaid: newAmountPaid,
        balanceDue: newBalance,
        status: newStatus,
        sapReference: inv.sapReference,
      );

      _payments.insert(
        0,
        PaymentModel(
          id: _payments.length + 1,
          paymentNumber: 'PAY-2026-${(_payments.length + 1).toString().padLeft(4, '0')}',
          invoiceNumber: invoiceNumber,
          amount: amount,
          method: method,
          reference: reference,
          paidAt: DateTime.now().toIso8601String(),
          confirmedBy: 'Pending Confirmation',
        ),
      );

      notifyListeners();
      return true;
    }
    return false;
  }
}
