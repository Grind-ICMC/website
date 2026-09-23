"use client"

import { useId, useState } from "react"
import { CalendarDays, ChevronDown } from "lucide-react"
import { ptBR } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDocumentDate, getTodayInputDate } from "@/lib/meeting-cms"

export function DocumentDateField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const selected = value ? new Date(`${value}T12:00:00`) : undefined

  function selectDate(date: Date | undefined) {
    if (!date) return
    const year = date.getFullYear().toString().padStart(4, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    onChange(`${year}-${month}-${day}`)
    setOpen(false)
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        Data do documento
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className="mt-2 h-11 w-full justify-start gap-3 border-border bg-background/60 font-normal hover:bg-secondary hover:text-foreground"
          >
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            {value ? (
              formatDocumentDate(value)
            ) : (
              <>
                <span className="font-semibold text-primary">?</span>
                <span className="text-muted-foreground">
                  Data não informada
                </span>
              </>
            )}
            <ChevronDown
              className="ml-auto size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto overflow-hidden p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={selectDate}
            locale={ptBR}
            formatters={{
              formatMonthDropdown: (date) =>
                date.toLocaleString("pt-BR", { month: "long" }),
            }}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(2100, 11)}
            autoFocus
          />
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Selecione a data do documento
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(getTodayInputDate())
                setOpen(false)
              }}
            >
              Hoje
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
