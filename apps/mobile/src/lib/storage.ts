import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const serverStorage = {
  getItem: async (_key: string): Promise<string | null> => null,
  setItem: async (_key: string, _value: string): Promise<void> => undefined,
  removeItem: async (_key: string): Promise<void> => undefined,
};

/** Avoids touching browser globals while Expo statically renders web routes in Node. */
export const appStorage =
  Platform.OS === "web" && typeof globalThis.window === "undefined" ? serverStorage : AsyncStorage;
