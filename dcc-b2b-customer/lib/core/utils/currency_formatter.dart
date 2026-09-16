import 'package:intl/intl.dart';
import '../constants/app_constants.dart';

/**
 * Utility functions for currency formatting across customer screens.
 */
abstract final class CurrencyFormatter {
  static final NumberFormat _formatter = NumberFormat('#,##0', 'en_US');

  /**
   * Formats a numeric value to localized TZS string (e.g. 1500 -> TZS 1,500).
   * 
   * @param amount The numerical amount to format.
   * @return Formatted currency string.
   */
  static String format(num amount) {
    return '${AppConstants.currencySymbol}${_formatter.format(amount)}';
  }

  /**
   * Formats a numeric value without the currency code.
   * 
   * @param amount The numerical amount.
   * @return Comma-separated number string.
   */
  static String formatCompact(num amount) {
    return _formatter.format(amount);
  }
}
