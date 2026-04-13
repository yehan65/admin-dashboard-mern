import { useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({ ref, onClose, className, children }) {
  const dialog = useRef();

  useImperativeHandle(ref, () => {
    return {
      SHOW() {
        dialog.current.showModal();
      },

      CLOSE() {
        dialog.current.close();
      },
    };
  });

  return createPortal(
    <dialog ref={dialog} onClose={onClose} className={className}>
      {children}
    </dialog>,
    document.getElementById("modal"),
  );
}
