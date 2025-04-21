'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useForwardedRef } from '@/lib/use-forwarded-ref';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
  (
    { disabled, value, onChange, onBlur, className, ...props },
    forwardedRef
  ) => {
    const ref = useForwardedRef(forwardedRef);

    return (
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || '#FFFFFF'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "h-9 w-9 rounded-md border border-input bg-background",
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          style={{ backgroundColor: value }}
          {...props}
        />
        <Input
          type="text"
          value={value.toUpperCase() || '#FFFFFF'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="flex-1 sm:w-24"
          ref={ref}
        />
      </div>
    );
  }
);
ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };
