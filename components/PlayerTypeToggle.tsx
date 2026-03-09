"use client";

import { SegmentedToggle } from "@/components/SegmentedToggle";

export type PlayerTypeValue = "EXTERNAL" | "INTERNAL";

type Size = "sm" | "md";

type Props = {
  value: PlayerTypeValue;
  onChange: (value: PlayerTypeValue) => void;
  size?: Size;
  className?: string;
};

export function PlayerTypeToggle({
  value,
  onChange,
  size = "md",
  className,
}: Props) {
  return (
    <SegmentedToggle
      value={value}
      onChange={onChange}
      size={size}
      className={className}
      options={[
        { value: "EXTERNAL", label: "Extern" },
        { value: "INTERNAL", label: "Intern" },
      ]}
    />
  );
}
