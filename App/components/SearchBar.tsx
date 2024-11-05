"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="border-b p-4 flex items-center gap-2 bg-card">
      <div className="flex items-center gap-2 max-w-xl w-full">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <Input
          type="text"
          placeholder="Search by prompt or metadata..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}