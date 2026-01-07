import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeJsonParse(data: any, fallback: any = []) {
  if (!data) return fallback;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    try {
      // Basic replacement for single-quote lists: ['a', 'b'] -> ["a", "b"]
      const fixed = data.replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch (e2) {
      console.error('Failed to parse JSON even with fixes:', data);
      return fallback;
    }
  }
}
