import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/**
 * DCC SFA / B2B Typography System.
 * Standardizes Poppins font scales across all customer-facing mobile interfaces.
 */
abstract final class AppTypography {
  /** Main screen titles */
  static TextStyle headingLarge = GoogleFonts.poppins(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
  );

  /** Card headers and section titles */
  static TextStyle headingMedium = GoogleFonts.poppins(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  /** Subsection labels and modal headers */
  static TextStyle headingSmall = GoogleFonts.poppins(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  /** Primary body text */
  static TextStyle bodyMedium = GoogleFonts.poppins(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.4,
  );

  /** Secondary and muted body text */
  static TextStyle bodySmall = GoogleFonts.poppins(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.3,
  );

  /** Currency figures and high-impact metrics */
  static TextStyle metricValue = GoogleFonts.poppins(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  /** Status badges and chip tags */
  static TextStyle badgeText = GoogleFonts.poppins(
    fontSize: 11,
    fontWeight: FontWeight.w600,
  );

  /** Buttons and interactive triggers */
  static TextStyle buttonLabel = GoogleFonts.poppins(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.2,
  );
}
