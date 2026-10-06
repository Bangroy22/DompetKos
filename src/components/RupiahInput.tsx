"use client";

import { forwardRef } from "react";
import { formatThousands, parseDigits } from "@/lib/format";

interface RupiahInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** String digit saja, mis. "200000" */
  value: string;
  /** Dipanggil dengan string digit saja */
  onChange: (digits: string) => void;
}

/**
 * Input angka dengan pemisah ribuan otomatis (200000 → "200.000").
 * State tetap digit murni agar mudah disimpan/diolah.
 */
export const RupiahInput = forwardRef<HTMLInputElement, RupiahInputProps>(
  function RupiahInput({ value, onChange, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatThousands(value)}
        onChange={(e) => onChange(parseDigits(e.target.value))}
        {...props}
      />
    );
  }
);
