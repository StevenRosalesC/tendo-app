import React from "react";
import { useWindowDimensions, View } from "react-native";
import TerminalCart from "../../../components/terminal/TerminalCart";
import TerminalProductGrid from "../../../components/terminal/TerminalProductGrid";
import TerminalShortcutsBar from "../../../components/terminal/TerminalShortcutsBar";

export default function TerminalScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 1024;

  // Desktop / Web View: Dual-panel cockpit workstation
  if (isDesktop) {
    return (
      <View className="flex-1 bg-surface p-4 lg:p-5 flex-col gap-3 max-w-[1920px] mx-auto w-full min-h-0">
        {/* Main Workstation View Area */}
        <View className="flex-1 flex-row gap-4 min-h-0">
          {/* Left Column: Product Catalog Grid & Quick Search */}
          <View className="flex-1 min-w-0 h-full">
            <TerminalProductGrid />
          </View>

          {/* Right Column: Active Ticket & Checkout Terminal */}
          <View className="w-full lg:w-[420px] xl:w-[460px] 2xl:w-[500px] shrink-0 h-full">
            <TerminalCart isDesktop={true} />
          </View>
        </View>

        {/* Bottom Keyboard Shortcuts Helper Bar */}
        <TerminalShortcutsBar />
      </View>
    );
  }

  // Mobile View: Original compact single-cart view
  return (
    <View className="flex-1 bg-surface p-3 sm:p-5 items-center justify-center">
      <View className="w-full max-w-2xl flex-1 flex-col">
        <TerminalCart isDesktop={false} />
      </View>
    </View>
  );
}
