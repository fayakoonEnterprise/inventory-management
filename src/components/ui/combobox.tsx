
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle, Box } from "lucide-react"

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
  hasBox?: boolean | null;
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
    for (const group of options) {
       if ('options' in group) {
        const found = group.options.find((o) => o.value === value);
        if (found) return found;
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
            {options.map((group, index) => {
              if ('options' in group) {
                return (
                  <React.Fragment key={group.label}>
                    {index > 0 && <CommandSeparator />}
                    <CommandGroup heading={group.label}>
                      {group.options.map((item) => (
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
                          <span className="flex-1">{item.label}</span>
                          {item.hasBox && <Box className="ml-2 h-4 w-4 text-muted-foreground" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </React.Fragment>
                );
              }
              return null; // Handle non-grouped options if necessary
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

    