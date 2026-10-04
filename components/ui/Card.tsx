import { ReactNode } from "react";
import { View, ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: "low" | "default" | "high";
  className?: string;
}

const variantStyles: Record<"low" | "default" | "high", string> = {
  low: "bg-surface-container-low border-surface-container-high",
  default: "bg-surface-container border-surface-container-high/60",
  high: "bg-surface-container-high border-surface-container-highest",
};

export default function Card({
  children,
  variant = "low",
  className = "",
  ...viewProps
}: CardProps) {
  return (
    <View
      className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${variantStyles[variant]} ${className}`}
      {...viewProps}
    >
      {children}
    </View>
  );
}
