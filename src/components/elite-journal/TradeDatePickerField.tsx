import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
};

export function TradeDatePickerField({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className,
}: Props) {
  const [text, setText] = React.useState(value ? format(value, "dd/MM/yyyy") : "");

  React.useEffect(() => {
    setText(value ? format(value, "dd/MM/yyyy") : "");
  }, [value]);

  const tryCommit = React.useCallback(
    (raw: string) => {
      const parsed = parse(raw, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) {
        onChange(parsed);
        return true;
      }
      return false;
    },
    [onChange]
  );

  return (
    <Popover>
      <div className={cn("relative", className)}>
        <Input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            // Commit as soon as the user completes a full date
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
              tryCommit(raw);
            }
          }}
          onBlur={() => {
            if (!text) return;
            // If they typed something but it's invalid, keep the text and let form validation show error.
            tryCommit(text);
          }}
          className="pr-10"
        />

        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            aria-label="Open calendar"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
