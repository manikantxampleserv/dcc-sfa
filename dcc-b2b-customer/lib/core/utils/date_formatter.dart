import 'package:intl/intl.dart';

/**
 * Utility functions for date and timestamp formatting.
 */
abstract final class DateFormatter {
  static final DateFormat _displayFormat = DateFormat('dd MMM yyyy');
  static final DateFormat _dateTimeFormat = DateFormat('dd MMM yyyy, hh:mm a');
  static final DateFormat _isoFormat = DateFormat('yyyy-MM-dd');

  /**
   * Formats a DateTime or ISO date string into readable date (e.g. 15 Aug 2026).
   * 
   * @param date Date object or string.
   * @return Formatted date text.
   */
  static String format(dynamic date) {
    if (date == null) return '-';
    if (date is DateTime) return _displayFormat.format(date);
    if (date is String) {
      final parsed = DateTime.tryParse(date);
      if (parsed != null) return _displayFormat.format(parsed);
      return date;
    }
    return '-';
  }

  /**
   * Formats a DateTime or string with time included.
   * 
   * @param date Date object or string.
   * @return Formatted date and time.
   */
  static String formatWithTime(dynamic date) {
    if (date == null) return '-';
    if (date is DateTime) return _dateTimeFormat.format(date);
    if (date is String) {
      final parsed = DateTime.tryParse(date);
      if (parsed != null) return _dateTimeFormat.format(parsed);
      return date;
    }
    return '-';
  }

  /**
   * Returns current date in standard ISO yyyy-MM-dd format.
   */
  static String nowIso() {
    return _isoFormat.format(DateTime.now());
  }
}
