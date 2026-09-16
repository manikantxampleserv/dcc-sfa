import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../features/catalog/presentation/catalog_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/invoices/presentation/invoice_list_screen.dart';
import '../../features/orders/presentation/my_orders_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

/**
 * Main application scaffold providing persistent bottom navigation across customer modules.
 */
class CustomerShellScaffold extends StatefulWidget {
  const CustomerShellScaffold({super.key});

  @override
  State<CustomerShellScaffold> createState() => _CustomerShellScaffoldState();
}

class _CustomerShellScaffoldState extends State<CustomerShellScaffold> {
  int _currentIndex = 0;

  void _onTabSelected(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(
        onNavigateToCatalog: () => _onTabSelected(1),
        onNavigateToOrders: () => _onTabSelected(2),
        onNavigateToInvoices: () => _onTabSelected(3),
      ),
      const CatalogScreen(),
      const MyOrdersScreen(),
      const InvoiceListScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTabSelected,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.storefront_outlined),
              activeIcon: Icon(Icons.storefront),
              label: 'Catalog',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long),
              label: 'Orders',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'Invoices',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.business_outlined),
              activeIcon: Icon(Icons.business),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
