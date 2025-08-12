import { useCallback, useState } from "react";

export function useToggle(initial = false): [boolean, () => void, () => void] {
  const [value, setValue] = useState<boolean>(initial);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const reset = useCallback(() => setValue(initial), [initial]);

  return [value, toggle, reset];
}