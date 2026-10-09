import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useKeyboard } from "../../hooks/useKeyboard";

export interface DrawerProps {
  /**
   * Whether the drawer is open
   */
  visible: boolean;
  /**
   * Callback fired when closing the drawer
   */
  onClose: () => void;
  /**
   * Main title in header
   */
  title?: string;
  /**
   * Subtitle in header
   */
  subtitle?: string;
  /**
   * Header icon name
   */
  icon?: keyof typeof MaterialIcons.glyphMap;
  /**
   * Optional elements to place on the right side of header (before close button)
   */
  headerRight?: React.ReactNode;
  /**
   * Main content inside the drawer
   */
  children: React.ReactNode;
  /**
   * Fixed footer content at bottom of drawer
   */
  footer?: React.ReactNode;
  /**
   * Drawer side: 'left' opens from left to right, 'right' opens from right to left
   * @default 'left'
   */
  side?: "left" | "right";
  /**
   * Custom width in px. If omitted, computes responsive width (up to 440px)
   */
  width?: number;
}

export default function Drawer({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  headerRight,
  children,
  footer,
  side = "left",
  width,
}: DrawerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const drawerWidth = width || Math.min(Math.round(windowWidth * 0.9), 440);
  const bottomOffset = Platform.OS === "android" && isKeyboardVisible ? keyboardHeight : 0;

  const [shouldRender, setShouldRender] = useState(visible);

  const initialSlide = side === "left" ? -drawerWidth : drawerWidth;
  const slideAnim = useRef(new Animated.Value(initialSlide)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle escape key on web
  useEffect(() => {
    if (Platform.OS === "web" && visible) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [visible, onClose]);

  useEffect(() => {
    const useNativeDriver = Platform.OS !== "web";

    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }),
      ]).start();
    } else if (shouldRender) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: side === "left" ? -drawerWidth : drawerWidth,
          duration: 220,
          easing: Easing.bezier(0.4, 0, 1, 1),
          useNativeDriver,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    }
  }, [visible, drawerWidth, side]);

  if (!shouldRender) return null;

  return (
    <RNModal
      visible={shouldRender}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 relative">
          {/* Dimmed Backdrop */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: fadeAnim,
                backgroundColor: "rgba(0, 0, 0, 0.72)",
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={onClose}
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Cerrar drawer"
            />
          </Animated.View>

          {/* Sliding Drawer Container */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                bottom: bottomOffset,
                width: drawerWidth,
                transform: [{ translateX: slideAnim }],
                zIndex: 100,
              },
              side === "left" ? { left: 0 } : { right: 0 },
            ]}
            className={`bg-surface-container-low shadow-2xl flex-col ${
              side === "left"
                ? "border-r border-surface-container-high/70"
                : "border-l border-surface-container-high/70"
            }`}
          >
            {/* Drawer Header */}
            <View className="flex-row items-center justify-between p-4 sm:p-5 border-b border-surface-container-high/60 bg-surface-container/80">
              <View className="flex-row items-center gap-2.5 flex-1 min-w-0 mr-2">
                {icon && (
                  <View className="w-9 h-9 rounded-xl bg-primary-container items-center justify-center shrink-0">
                    <MaterialIcons name={icon} size={18} color="#0d0096" />
                  </View>
                )}
                <View className="flex-1 min-w-0">
                  {title && (
                    <Text
                      numberOfLines={1}
                      className="text-base font-bold text-on-surface leading-tight truncate"
                    >
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text
                      numberOfLines={1}
                      className="text-xs text-on-surface-variant font-medium mt-0.5 leading-tight truncate"
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row items-center gap-1.5 shrink-0">
                {headerRight}

                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Cerrar drawer"
                  className="w-8 h-8 rounded-lg bg-surface-container-highest items-center justify-center"
                >
                  <MaterialIcons name="close" size={18} color="#c7c4d7" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable Drawer Body */}
            <ScrollView
              className="flex-1"
              contentContainerClassName="p-4 sm:p-5"
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {children}
            </ScrollView>

            {/* Sticky Drawer Footer */}
            {footer && (
              <View className="p-4 sm:p-5 border-t border-surface-container-high/60 bg-surface-container">
                {footer}
              </View>
            )}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
