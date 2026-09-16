import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';

enum DccButtonVariant { primary, secondary, outlined, text, danger }

/**
 * Standardized Button component matching DCC B2B design system.
 * Supports primary, secondary, outlined, text, and danger variants with loading states.
 */
class DccButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final DccButtonVariant variant;
  final bool isLoading;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final bool isFullWidth;
  final EdgeInsetsGeometry padding;

  const DccButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.variant = DccButtonVariant.primary,
    this.isLoading = false,
    this.leadingIcon,
    this.trailingIcon,
    this.isFullWidth = true,
    this.padding = const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
  });

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color foregroundColor;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case DccButtonVariant.primary:
        backgroundColor = AppColors.primary600;
        foregroundColor = AppColors.textWhite;
        break;
      case DccButtonVariant.secondary:
        backgroundColor = AppColors.primary50;
        foregroundColor = AppColors.primary700;
        borderSide = const BorderSide(color: AppColors.primary100, width: 1);
        break;
      case DccButtonVariant.outlined:
        backgroundColor = Colors.transparent;
        foregroundColor = AppColors.primary600;
        borderSide = const BorderSide(color: AppColors.primary600, width: 1.5);
        break;
      case DccButtonVariant.text:
        backgroundColor = Colors.transparent;
        foregroundColor = AppColors.primary600;
        break;
      case DccButtonVariant.danger:
        backgroundColor = AppColors.danger;
        foregroundColor = AppColors.textWhite;
        break;
    }

    final content = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
            ),
          ),
          const SizedBox(width: 10),
        ] else if (leadingIcon != null) ...[
          leadingIcon!,
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: AppTypography.buttonLabel.copyWith(color: foregroundColor),
        ),
        if (!isLoading && trailingIcon != null) ...[
          const SizedBox(width: 8),
          trailingIcon!,
        ],
      ],
    );

    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      child: Material(
        color: onPressed == null ? AppColors.surfaceMuted : backgroundColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: borderSide,
        ),
        child: InkWell(
          onTap: (isLoading || onPressed == null) ? null : onPressed,
          borderRadius: BorderRadius.circular(10),
          child: Padding(
            padding: padding,
            child: content,
          ),
        ),
      ),
    );
  }
}
