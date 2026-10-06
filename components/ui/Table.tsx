import { ReactNode } from "react";
import {
  ScrollView,
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";

/* -------------------------------------------------------------------------- */
/*                                    Table                                   */
/* -------------------------------------------------------------------------- */

export interface TableProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
  horizontalScroll?: boolean;
  minWidth?: number | string;
}

export function Table({
  children,
  className = "",
  containerClassName = "",
  horizontalScroll = true,
  minWidth,
  ...props
}: TableProps) {
  const content = (
    <View
      style={{
        width: "100%",
        minWidth: minWidth as any,
        flexGrow: 1,
      }}
      className={`w-full flex-1 flex-col ${className}`}
      {...props}
    >
      {children}
    </View>
  );

  return (
    <View
      className={`w-full rounded-xl bg-surface-container-low border border-surface-container-high/60 overflow-hidden shadow-sm ${containerClassName}`}
    >
      {horizontalScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={{ width: "100%" }}
          contentContainerStyle={{ minWidth: "100%", flexGrow: 1 }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 TableHeader                                */
/* -------------------------------------------------------------------------- */

export interface TableHeaderProps extends ViewProps {
  children?: ReactNode;
  className?: string;
}

export function TableHeader({
  children,
  className = "",
  style,
  ...props
}: TableHeaderProps) {
  return (
    <View
      className={`w-full bg-surface-container border-b border-surface-container-high/60 ${className}`}
      style={[{ width: "100%" }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableBody                                 */
/* -------------------------------------------------------------------------- */

export interface TableBodyProps extends ViewProps {
  children?: ReactNode;
  className?: string;
}

export function TableBody({
  children,
  className = "",
  style,
  ...props
}: TableBodyProps) {
  return (
    <View
      className={`w-full flex-col ${className}`}
      style={[{ width: "100%" }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 TableFooter                                */
/* -------------------------------------------------------------------------- */

export interface TableFooterProps extends ViewProps {
  children?: ReactNode;
  className?: string;
}

export function TableFooter({
  children,
  className = "",
  ...props
}: TableFooterProps) {
  return (
    <View
      className={`w-full bg-surface-container border-t border-surface-container-high/40 p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableRow                                  */
/* -------------------------------------------------------------------------- */

export interface TableRowProps extends TouchableOpacityProps {
  children?: ReactNode;
  className?: string;
  isHeader?: boolean;
  isSelected?: boolean;
  isAlternate?: boolean;
  interactive?: boolean;
}

export function TableRow({
  children,
  className = "",
  isHeader = false,
  isSelected = false,
  isAlternate = false,
  interactive = false,
  style,
  ...props
}: TableRowProps) {
  const baseClasses = `w-full flex-row items-center py-3 px-4 border-b border-surface-container-high/30 ${
    isHeader
      ? "bg-surface-container border-b border-surface-container-high/60"
      : isSelected
      ? "bg-primary/10 border-primary/40"
      : isAlternate
      ? "bg-surface-container-lowest/30"
      : "bg-transparent"
  } ${interactive ? "active:bg-surface-container hover:bg-surface-container" : ""} ${className}`;

  if (interactive) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className={baseClasses}
        style={[{ width: "100%" }, style]}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={baseClasses}
      style={[{ width: "100%" }, style]}
      {...(props as ViewProps)}
    >
      {children}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableHead                                 */
/* -------------------------------------------------------------------------- */

export interface TableHeadProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  textClassName?: string;
  align?: "left" | "center" | "right";
}

export function TableHead({
  children,
  className = "",
  textClassName = "",
  align = "left",
  ...props
}: TableHeadProps) {
  const alignmentClass =
    align === "center"
      ? "items-center text-center"
      : align === "right"
      ? "items-end text-right"
      : "items-start text-left";

  return (
    <View className={`px-2 ${alignmentClass} ${className}`} {...props}>
      {typeof children === "string" ? (
        <Text
          className={`text-xs font-semibold text-on-surface-variant uppercase tracking-wider ${textClassName}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableData                                 */
/* -------------------------------------------------------------------------- */

export interface TableDataProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  textClassName?: string;
  align?: "left" | "center" | "right";
}

export function TableData({
  children,
  className = "",
  textClassName = "",
  align = "left",
  ...props
}: TableDataProps) {
  const alignmentClass =
    align === "center"
      ? "items-center"
      : align === "right"
      ? "items-end"
      : "items-start";

  return (
    <View className={`px-2 ${alignmentClass} ${className}`} {...props}>
      {typeof children === "string" || typeof children === "number" ? (
        <Text className={`text-sm text-on-surface ${textClassName}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TableCaption                                */
/* -------------------------------------------------------------------------- */

export interface TableCaptionProps extends TextProps {
  children?: ReactNode;
  className?: string;
}

export function TableCaption({
  children,
  className = "",
  ...props
}: TableCaptionProps) {
  return (
    <Text
      className={`text-xs text-on-surface-variant/70 text-center py-2 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export default Table;
