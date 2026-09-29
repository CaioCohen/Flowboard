import { useEffect, useRef, type ReactNode } from "react";

interface IModalDialogProps {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  onClose: () => void;
}

/** Opens native dialogs with showModal so the browser places them in the top layer. */
export function ModalDialog({ ariaLabel, children, className, onClose }: IModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  return <dialog ref={dialogRef} className={className} aria-label={ariaLabel} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    {children}
  </dialog>;
}
