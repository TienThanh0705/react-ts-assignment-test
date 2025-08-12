// src/hooks/useLockBodyScroll.ts
import { useEffect } from "react";

/**
 * Khóa scroll của body khi `locked = true`.
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    const { body } = document;
    const original = body.style.overflow;
    if (locked) body.style.overflow = "hidden";
    return () => {
      body.style.overflow = original;
    };
  }, [locked]);
}
