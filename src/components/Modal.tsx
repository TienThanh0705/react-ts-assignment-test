// src/components/Modal.tsx
import { createPortal } from "react-dom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

/** Accept any ref with shape { current: HTMLElement | null } */
type FocusRef = { current: HTMLElement | null };

export type ModalProps = {
  open: boolean;
  onClose: () => void;

  // A11y
  ariaLabel?: string;            // nếu không có title
  ariaLabelledBy?: string;       // id của heading trong panel

  // Behavior
  closeOnBackdrop?: boolean;     // default true
  closeOnEsc?: boolean;          // default true
  trapFocus?: boolean;           // default true

  // Focus control
  initialFocusRef?: FocusRef;

  // UI
  title?: ReactNode;             // heading hiển thị (tự sinh aria nếu không set ariaLabel/ariaLabelledBy)
  size?: "sm" | "md" | "lg";     // width preset
  hideCloseButton?: boolean;
  renderCloseButton?: (close: () => void) => ReactNode;
  renderFooter?: (close: () => void) => ReactNode;

  children: ReactNode;
};

export function Modal({
  open,
  onClose,
  ariaLabel,
  ariaLabelledBy,
  closeOnBackdrop = true,
  closeOnEsc = true,
  trapFocus = true,
  initialFocusRef,
  title,
  size = "md",
  hideCloseButton = false,
  renderCloseButton,
  renderFooter,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useLockBodyScroll(open);

  // Restore focus to the opener
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
    } else if (!open && lastActiveRef.current) {
      lastActiveRef.current.focus?.();
    }
  }, [open]);

  // Initial focus inside modal
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const target = initialFocusRef?.current ?? panelRef.current;
      target?.focus?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, initialFocusRef]);

  // ESC to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  // Focus trap
  const trap = useCallback(
    (e: React.KeyboardEvent) => {
      if (!trapFocus || e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusables) as HTMLElement[];
      if (list.length === 0) return;

      const first = list[0]!;
      const last = list[list.length - 1]!;

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    },
    [trapFocus]
  );

  const close = useCallback(() => onClose(), [onClose]);

  // Nếu có title mà chưa set ariaLabel/LabelledBy, tạo id tự động cho a11y
  const headingId = useMemo(() => {
    if (!title) return undefined;
    if (ariaLabelledBy) return ariaLabelledBy;
    return "modal-title-" + Math.random().toString(36).slice(2);
  }, [title, ariaLabelledBy]);

  const content = useMemo(
    () => (
      <div
        className="modal-backdrop pretty"
        aria-hidden={!open}
        onMouseDown={(e) => {
          if (!closeOnBackdrop) return;
          if (e.target === e.currentTarget) close();
        }}
        style={{ display: open ? "grid" : "none" }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={!headingId ? ariaLabel : undefined}
          aria-labelledby={headingId}
          tabIndex={-1}
          ref={panelRef}
          className={`modal-panel elevated size-${size} animate-in`}
          onKeyDown={trap}
        >
          {(title || !hideCloseButton) && (
            <div className="modal-header nice">
              {title ? (
                <h3 id={headingId} className="modal-title">
                  {title}
                </h3>
              ) : (
                <span />
              )}

              {!hideCloseButton &&
                (renderCloseButton ? (
                  renderCloseButton(close)
                ) : (
                  <button className="btn btn-primary-outline close-btn" onClick={close} aria-label="Close dialog">
                    ✕
                  </button>
                ))}
            </div>
          )}

          <div className="modal-body">{children}</div>

          {renderFooter && <div className="modal-footer">{renderFooter(close)}</div>}
        </div>
      </div>
    ),
    [
      open,
      closeOnBackdrop,
      ariaLabel,
      headingId,
      trap,
      close,
      children,
      renderCloseButton,
      renderFooter,
      size,
      hideCloseButton,
      title,
    ]
  );

  return createPortal(content, document.body);
}
