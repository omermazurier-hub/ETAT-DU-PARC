import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/validity";
import { cn } from "@/lib/utils";

// Accepts value as ISO string (YYYY-MM-DD) and returns the same via onChange
export default function DatePickerFR({ value, onChange, placeholder = "Choisir une date", testId, className }) {
  const dateValue = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-testid={testId}
          className={cn(
            "h-11 w-full justify-start border-slate-300 bg-white text-left text-base font-medium",
            !value && "text-slate-400",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
          {value ? fmtDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(d) => {
            if (!d) return onChange("");
            const iso = d.toISOString().slice(0, 10);
            onChange(iso);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
