import { ReactNode } from "react";
import { Text, View } from "react-native";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<
  BadgeVariant,
  { container: string; text: string; dotColor: string }
> = {
  primary: {
    container: "bg-primary-container/20 border-primary-container/40",
    text: "text-primary",
    dotColor: "bg-primary",
  },
  secondary: {
    container: "bg-surface-container-high border-surface-container-highest/60",
    text: "text-secondary",
    dotColor: "bg-secondary",
  },
  success: {
    container: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  warning: {
    container: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-400",
    dotColor: "bg-amber-400",
  },
  danger: {
    container: "bg-rose-500/15 border-rose-500/30",
    text: "text-rose-400",
    dotColor: "bg-rose-400",
  },
  info: {
    container: "bg-cyan-500/15 border-cyan-500/30",
    text: "text-cyan-400",
    dotColor: "bg-cyan-400",
  },
  neutral: {
    container: "bg-surface-container-high border-surface-container-highest",
    text: "text-on-surface-variant",
    dotColor: "bg-on-surface-variant",
  },
};

export default function Badge({
  label,
  variant = "neutral",
  icon,
  dot = false,
  className = "",
  size = "md",
}: BadgeProps) {
  const styles = variantStyles[variant];
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-xs";

  return (
    <View
      className={`flex-row items-center rounded-lg border ${styles.container} ${className} ${
        size === "sm" ? "px-2 py-0.5 gap-1" : "px-2.5 py-1 gap-1.5"
      }`}
    >
      {dot && (
        <View
          className={`rounded-full ${styles.dotColor} ${
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
          }`}
        />
      )}
      {icon}
      <Text
        className={`font-semibold tracking-tight ${styles.text} ${
          size === "sm" ? "text-[10px]" : "text-xs"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
