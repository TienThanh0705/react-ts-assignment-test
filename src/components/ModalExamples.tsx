// src/components/ModalExamples.tsx
import React, { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";

export function ModalExamples() {
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  // Ref gốc cho button (HTMLButtonElement)
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  // Ref bọc có shape: { current: HTMLElement | null }
  // => Tương thích với kiểu initialFocusRef mà Modal yêu cầu
  const initialFocusRef = useRef<HTMLElement | null>(null);

  // Đồng bộ giá trị current
  useEffect(() => {
    initialFocusRef.current = firstBtnRef.current;
  }, [firstBtnRef.current]); // hoặc [] cũng được, vì ref current cập nhật theo DOM

  return (
    <div className="card">
      <h2>Modal – Examples</h2>
      <div className="row">
        <button onClick={() => setOpenA(true)}>Open basic modal</button>
        <button onClick={() => setOpenB(true)} ref={firstBtnRef}>
          Open custom close
        </button>
      </div>

      {/* Basic */}
      <Modal open={openA} onClose={() => setOpenA(false)} ariaLabel="Basic dialog">
        <h3 style={{ marginTop: 0 }}>Basic Dialog</h3>
        <p>Backdrop click & ESC sẽ đóng. Focus được trap trong panel.</p>
        <div className="footer">
          <button onClick={() => setOpenA(false)}>Close</button>
          <button onClick={() => alert("Action!")}>Primary action</button>
        </div>
      </Modal>

      {/* Custom close, restore focus về nút đã mở */}
      <Modal
        open={openB}
        onClose={() => setOpenB(false)}
        ariaLabel="Custom close dialog"
        initialFocusRef={initialFocusRef}
        renderCloseButton={(close) => (
          <button className="close-btn" onClick={close}>
            Close me
          </button>
        )}
      >
        <h3 style={{ marginTop: 0 }}>Custom Close Button</h3>
        <p>
          Ví dụ truyền nút đóng tuỳ biến thông qua <code>renderCloseButton</code>.
        </p>
        <input className="input" placeholder="Focusable input" />
        <div className="footer">
          <button onClick={() => setOpenB(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}
