"use client";
import React, { useState, useRef, useEffect } from "react";
import { Label } from "../ui/label";
import {
  Control,
  FieldError,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import countryList from "react-select-country-list";
import { Check, ChevronsUpDown } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

// shadcn compo

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CountrySelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder: string;
  control: Control<T>;
  error: FieldError | undefined;
  required?: boolean;
}

const CountrySelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const countries = countryList().getData();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [search]);

  //get the flags :
  const getFlag = (countryCode: string) => {
    return `fi fi-${countryCode.toLowerCase()}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="country-select-trigger"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span className={getFlag(value)}></span>
              <span>{countries.find((c) => c.value === value)?.label}</span>
            </span>
          ) : (
            "Select your country"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-gray-800 border-gray-600"
        align="start"
      >
        <Command
          value={search}
          onValueChange={setSearch}
          className="bg-gray-800 border-gray-600"
        >
          <CommandInput
            placeholder="Search Countries..."
            className="country-select-input"
          />
          <CommandList
            ref={listRef}
            className="max-h-60 bg-gray-800 scrollbar-hide-default"
          >
            <CommandEmpty className="country-select-empty">
              No Countries Found
            </CommandEmpty>
            <CommandGroup className="bg-gray-800">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onChange(country.value);
                    setOpen(false);
                  }}
                  className="country-select-item"
                >
                  <Check
                    className={cn(
                      `mr-2 h-4 w-4 text-yellow-500`,
                      value === country.value ? `opacity-100` : `opacity-0`,
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span className={getFlag(country.value)}></span>
                    <span>{country.label}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
const CountrySelectField = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  required = false,
}: CountrySelectProps<T>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <CountrySelect value={field.value} onChange={field.onChange} />
        )}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default CountrySelectField;
