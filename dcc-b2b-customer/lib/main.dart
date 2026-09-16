import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_constants.dart';
import 'core/constants/app_theme.dart';
import 'core/routes/app_routes.dart';
import 'features/auth/presentation/login_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/invoices_provider.dart';
import 'providers/issues_provider.dart';
import 'providers/orders_provider.dart';
import 'shared/layout/customer_shell_scaffold.dart';

/**
 * Application Entry Point.
 * Registers global state providers, applies DCC enterprise theme, and mounts root navigator.
 */
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DccCustomerApp());
}

class DccCustomerApp extends StatelessWidget {
  const DccCustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => OrdersProvider()),
        ChangeNotifierProvider(create: (_) => InvoicesProvider()),
        ChangeNotifierProvider(create: (_) => IssuesProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            home: auth.isAuthenticated
                ? const CustomerShellScaffold()
                : const LoginScreen(),
            routes: AppRoutes.routes,
          );
        },
      ),
    );
  }
}
