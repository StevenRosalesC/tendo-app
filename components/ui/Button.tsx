import { ReactNode } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
  children?: ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string; spinnerColor: string }
> = {
  primary: {
    container: "bg-primary-container border-transparent",
    text: "text-on-primary-container font-bold",
    spinnerColor: "#0d0096",
  },
  secondary: {
    container: "bg-surface-container-high border-surface-container-highest/60",
    text: "text-on-surface font-semibold",
    spinnerColor: "#c0c1ff",
  },
  outline: {
    container: "bg-transparent border-surface-container-high",
    text: "text-on-surface font-semibold",
    spinnerColor: "#c0c1ff",
  },
  ghost: {
    container: "bg-transparent border-transparent",
    text: "text-on-surface-variant font-medium",
    spinnerColor: "#c0c1ff",
  },
  danger: {
    container: "bg-status-danger/15 border-status-danger/30",
    text: "text-status-danger font-bold",
    spinnerColor: "#EF4444",
  },
};

const sizeStyles: Record<
  ButtonSize,
  { container: string; text: string }
> = {
  sm: {
    container: "h-9 px-3 gap-1.5 rounded-lg",
    text: "text-xs",
  },
  md: {
    container: "h-11 px-4 gap-2 rounded-xl",
    text: "text-sm",
  },
  lg: {
    container: "h-12 px-5 gap-2.5 rounded-xl",
    text: "text-sm",
  },
};

export default function Button({
  children,
  label,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  className = "",
  activeOpacity = 0.85,
  style,
  ...rest
}: ButtonProps) {
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={isDisabled}
      style={[{ opacity: isDisabled ? 0.6 : 1 }, style]}
      className={`flex-row items-center justify-center border ${
        fullWidth ? "w-full" : ""
      } ${sStyle.container} ${vStyle.container} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vStyle.spinnerColor} />
      ) : (
        <>
          {leftIcon && <View className="shrink-0">{leftIcon}</View>}
          {label ? (
            <Text className={`${sStyle.text} ${vStyle.text}`}>{label}</Text>
          ) : (
            children
          )}
          {rightIcon && <View className="shrink-0">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
