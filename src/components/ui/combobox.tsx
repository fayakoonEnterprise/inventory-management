
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxOptionGroup = {
  label: string;
  options: ComboboxOption[];
};

type ComboboxProps = {
  options: (ComboboxOption | ComboboxOptionGroup)[];
  value?: string;
  onValueChange?: (value: string) => void;
  onCreate?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  className?: string;
};

export function Combobox({
  options,
  value,
  onValueChange,
  onCreate,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  notFoundPlaceholder = "No results found",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = React.useMemo(() => {
    for (const option of options) {
      if ('options' in option) {
        const found = option.options.find((o) => o.value === value);
        if (found) return found;
      } else {
        if (option.value === value) return option;
      }
    }
    return null;
  }, [options, value]);

  const handleCreate = () => {
      if (onCreate && search) {
          onCreate(search);
          setOpen(false);
      }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
                {onCreate ? (
                     <Button variant="ghost" className="w-full" onClick={handleCreate}>
                        <PlusCircle className="mr-2" /> Create "{search}"
                    </Button>
                ) : (
                    notFoundPlaceholder
                )}
            </CommandEmpty>
            {options.map((option, index) => {
              if ('options' in option) {
                return (
                  <React.Fragment key={option.label}>
                    {index > 0 && <CommandSeparator />}
                    <CommandGroup heading={option.label}>
                      {option.options.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.label} // Search is based on label
                          onSelect={() => {
                            onValueChange?.(item.value);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === item.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </React.Fragment>
                );
              }
              // This is for non-grouped options, if you ever need them.
              return (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
