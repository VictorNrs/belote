import { classNames } from '../classNames';

interface SegmentedProps<T extends number> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange(value: T): void;
}

/** Sélecteur à options exclusives, en forme de pilule. */
export function Segmented<T extends number>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={classNames('segmented__option', option.value === value && 'segmented__option--active')}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
