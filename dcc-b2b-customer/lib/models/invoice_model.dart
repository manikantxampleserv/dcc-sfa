/**
 * Model representing a customer billing invoice.
 */
class InvoiceModel {
  final int id;
  final String invoiceNumber;
  final String orderNumber;
  final String customerName;
  final String issueDate;
  final String dueDate;
  final double totalAmount;
  final double amountPaid;
  final double balanceDue;
  final String status;
  final String? sapReference;

  const InvoiceModel({
    required this.id,
    required this.invoiceNumber,
    required this.orderNumber,
    required this.customerName,
    required this.issueDate,
    required this.dueDate,
    required this.totalAmount,
    required this.amountPaid,
    required this.balanceDue,
    required this.status,
    this.sapReference,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['id'] as int,
      invoiceNumber: json['invoice_number'] as String,
      orderNumber: json['order_number'] as String,
      customerName: json['customer_name'] as String,
      issueDate: json['issue_date'] as String,
      dueDate: json['due_date'] as String,
      totalAmount: (json['total_amount'] as num).toDouble(),
      amountPaid: (json['amount_paid'] as num).toDouble(),
      balanceDue: (json['balance_due'] as num).toDouble(),
      status: json['status'] as String,
      sapReference: json['sap_reference'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'invoice_number': invoiceNumber,
      'order_number': orderNumber,
      'customer_name': customerName,
      'issue_date': issueDate,
      'due_date': dueDate,
      'total_amount': totalAmount,
      'amount_paid': amountPaid,
      'balance_due': balanceDue,
      'status': status,
      'sap_reference': sapReference,
    };
  }
}

/**
 * Model representing a customer payment transaction.
 */
class PaymentModel {
  final int id;
  final String paymentNumber;
  final String invoiceNumber;
  final double amount;
  final String method;
  final String reference;
  final String paidAt;
  final String? confirmedBy;

  const PaymentModel({
    required this.id,
    required this.paymentNumber,
    required this.invoiceNumber,
    required this.amount,
    required this.method,
    required this.reference,
    required this.paidAt,
    this.confirmedBy,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] as int,
      paymentNumber: json['payment_number'] as String,
      invoiceNumber: json['invoice_number'] as String,
      amount: (json['amount'] as num).toDouble(),
      method: json['method'] as String,
      reference: json['reference'] as String,
      paidAt: json['paid_at'] as String,
      confirmedBy: json['confirmed_by'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'payment_number': paymentNumber,
      'invoice_number': invoiceNumber,
      'amount': amount,
      'method': method,
      'reference': reference,
      'paid_at': paidAt,
      'confirmed_by': confirmedBy,
    };
  }
}
