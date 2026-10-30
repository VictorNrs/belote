import { ReactNode } from 'react';

interface DialogProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Dialog({ title, children, onClose }: DialogProps) {
  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <section className="dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <h2 className="dialog__title">{title}</h2>
        {children}
      </section>
    </div>
  );
}
