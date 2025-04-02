
import React from "react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
  const { theme } = useTheme();
  
  // This component no longer provides toggle functionality
  // It's kept for backward compatibility
  return null;
};

export default ThemeToggle;
