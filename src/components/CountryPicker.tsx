"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

interface CountryPickerProps {
  name?: string;
  defaultValue?: string;
  required?: boolean;
}

export function CountryPicker({ name = "country", defaultValue = "US", required = true }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(
    COUNTRIES.find((c) => c.code === defaultValue) ?? COUNTRIES[0],
  );
  const ref = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={selected.code} required={required} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field flex items-center justify-between text-left"
      >
        <span>{selected.name}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-card-border bg-background shadow-xl">
          <div className="flex items-center gap-2 border-b border-card-border px-3 py-2">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-transparent text-sm outline-none"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(c);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
