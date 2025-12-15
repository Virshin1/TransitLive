import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind classes with proper priority
// This prevents class conflicts and ensures the correct styles are applied
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
