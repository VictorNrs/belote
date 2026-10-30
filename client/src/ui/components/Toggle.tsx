interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange(checked: boolean): void;
}

/** Interrupteur on/off accessible (case à cocher stylisée). */
export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <label className="toggle">
      <span className="toggle__text">
        <span>{label}</span>
        {hint && <span className="toggle__hint">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" className="toggle__input" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle__track" aria-hidden="true" />
    </label>
  );
}
