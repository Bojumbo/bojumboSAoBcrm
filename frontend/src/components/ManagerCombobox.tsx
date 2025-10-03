"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Manager } from "@/types/users"

interface ManagerComboboxProps {
  managers: Manager[];
  selectedManagerId: number | null | undefined;
  onSelect: (managerId: number | null) => void;
}

export function ManagerCombobox({ managers, selectedManagerId, onSelect }: ManagerComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedManager = managers.find(manager => manager.manager_id === selectedManagerId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedManager
            ? `${selectedManager.first_name} ${selectedManager.last_name}`
            : "Виберіть менеджера..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Пошук менеджера..." />
          <CommandEmpty>Менеджера не знайдено.</CommandEmpty>
          <CommandGroup>
            {managers.map((manager) => (
              <CommandItem
                key={manager.manager_id}
                value={`${manager.first_name} ${manager.last_name}`}
                onSelect={() => {
                  onSelect(manager.manager_id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedManagerId === manager.manager_id ? "opacity-100" : "opacity-0"
                  )}
                />
                {manager.first_name} {manager.last_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}