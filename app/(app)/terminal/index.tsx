import React from "react";
import { View } from "react-native";
import TerminalCart from "../../../components/terminal/TerminalCart";

export default function TerminalScreen() {
  return (
    <View className="flex-1 bg-surface p-3 sm:p-5 lg:p-6 items-center justify-center">
      <View className="w-full max-w-2xl flex-1 flex-col">
        <TerminalCart />
      </View>
    </View>
  );
}
