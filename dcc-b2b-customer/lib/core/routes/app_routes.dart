import 'package:flutter/material.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/catalog/presentation/catalog_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/invoices/presentation/invoice_list_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/orders/presentation/my_orders_screen.dart';
import '../../features/orders/presentation/place_order_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../shared/layout/customer_shell_scaffold.dart';

/**
 * Route names and navigation mappings for the customer application.
 */
abstract final class AppRoutes {
  static const String initial = '/';
  static const String login = '/login';
  static const String home = '/home';
  static const String dashboard = '/dashboard';
  static const String catalog = '/catalog';
  static const String placeOrder = '/orders/place';
  static const String orders = '/orders';
  static const String invoices = '/invoices';
  static const String profile = '/profile';
  static const String notifications = '/notifications';

  static Map<String, WidgetBuilder> get routes => {
        login: (_) => const LoginScreen(),
        home: (_) => const CustomerShellScaffold(),
        dashboard: (_) => const DashboardScreen(),
        catalog: (_) => const CatalogScreen(),
        placeOrder: (_) => const PlaceOrderScreen(),
        orders: (_) => const MyOrdersScreen(),
        invoices: (_) => const InvoiceListScreen(),
        profile: (_) => const ProfileScreen(),
        notifications: (_) => const NotificationsScreen(),
      };
}
