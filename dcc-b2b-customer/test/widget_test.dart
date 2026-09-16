import 'package:flutter_test/flutter_test.dart';
import 'package:dcc_b2b_customer/main.dart';

/**
 * Basic smoke test verifying DccCustomerApp widget builds without exceptions.
 */
void main() {
  testWidgets('App smoke test loads successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const DccCustomerApp());
    expect(find.byType(DccCustomerApp), findsOneWidget);
  });
}
