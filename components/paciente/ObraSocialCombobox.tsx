"use client";

import { useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface ObraSocial {
    id: number;
    nombre: string;
}

interface ObraSocialComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: ObraSocial[];
}

export function ObraSocialCombobox({ value, onChange, options }: ObraSocialComboboxProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className={cn("truncate", !value && "text-muted-foreground")}>
                        {value || "Seleccionar obra social..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Buscar obra social..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.currentTarget.value) {
                                e.preventDefault();
                            }
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <CommandItem
                                value="__create__"
                                onSelect={() => {
                                    const input = document.querySelector<HTMLInputElement>('[cmdk-input]');
                                    if (input?.value) {
                                        onChange(input.value);
                                        setOpen(false);
                                    }
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar obra social nueva
                            </CommandItem>
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((o) => (
                                <CommandItem
                                    key={o.id}
                                    value={o.nombre}
                                    onSelect={() => {
                                        onChange(o.nombre === value ? "" : o.nombre);
                                        setOpen(false);
                                    }}
                                    data-checked={value === o.nombre}
                                >
                                    {o.nombre}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
