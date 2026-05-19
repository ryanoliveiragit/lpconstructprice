"use client";
import { createContext, useContext } from "react";
import { DARK, type Theme } from "./colors";

export const ThemeContext = createContext<Theme>(DARK);
export function useTheme() { return useContext(ThemeContext); }
