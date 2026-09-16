import 'package:flutter/material.dart';

/**
 * DCC SFA / B2B Color Palette.
 * Matches exact primary brand colors and status tones from the web portal.
 */
abstract final class AppColors {
  /** Primary brand blue palette */
  static const Color primary50 = Color(0xFFEFF6FF);
  static const Color primary100 = Color(0xFFDBEAFE);
  static const Color primary200 = Color(0xFFBFDBFE);
  static const Color primary300 = Color(0xFF93C5FD);
  static const Color primary400 = Color(0xFF60A5FA);
  static const Color primary500 = Color(0xFF3B82F6);
  static const Color primary600 = Color(0xFF2563EB);
  static const Color primary700 = Color(0xFF1D4ED8);
  static const Color primary800 = Color(0xFF1E40AF);
  static const Color primary900 = Color(0xFF1E3A8A);
  static const Color primary950 = Color(0xFF172554);

  /** Neutral surfaces and background tones */
  static const Color scaffoldBackground = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF1F5F9);
  static const Color cardBorder = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFE2E8F0);

  /** Text hierarchy */
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color textWhite = Color(0xFFFFFFFF);

  /** Semantic status tones */
  static const Color success = Color(0xFF16A34A);
  static const Color successLight = Color(0xFFDCFCE7);
  static const Color successBorder = Color(0xFF86EFAC);

  static const Color warning = Color(0xFFD97706);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color warningBorder = Color(0xFFFCD34D);

  static const Color danger = Color(0xFFDC2626);
  static const Color dangerLight = Color(0xFFFEE2E2);
  static const Color dangerBorder = Color(0xFFFCA5A5);

  static const Color info = Color(0xFF2563EB);
  static const Color infoLight = Color(0xFFDBEAFE);
  static const Color infoBorder = Color(0xFF93C5FD);

  /** Accent gradients */
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary700, primary500],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardHeaderGradient = LinearGradient(
    colors: [primary900, primary700],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
