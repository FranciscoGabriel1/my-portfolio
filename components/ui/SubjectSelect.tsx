"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SubjectSelectProps {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Lista de escolha única com ícones, sem biblioteca: padrão "select-only combobox" da APG (WAI-ARIA).
 * O foco fica sempre no botão; a opção ativa é anunciada por `aria-activedescendant`.
 *
 * Teclado — fechada: ↓, ↑, Enter, Espaço, Home, End ou uma letra abrem. Aberta: ↑ ↓ Home End PageUp PageDown
 * movem, uma letra salta para a opção que começa com ela, Enter/Espaço/Tab escolhem e Esc fecha sem mudar.
 */
export function SubjectSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  ref,
}: SubjectSelectProps) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const listId = `${uid}-list`;
  const errorId = `${uid}-error`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const selectedIndex = options.findIndex((o) => o.id === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const openAt = (index: number) => {
    setActive(Math.max(0, Math.min(options.length - 1, index)));
    setOpen(true);
  };
  const choose = (index: number) => {
    setOpen(false);
    if (options[index] && options[index].id !== value) onChange(options[index].id);
  };

  // Clique fora fecha sem mudar a escolha.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // A opção ativa sempre visível dentro da lista.
  useEffect(() => {
    if (open) document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, uid]);

  /** Busca pelo começo do texto; letras digitadas em sequência (até 500 ms) formam uma busca só. Uma busca
      nova começa na opção seguinte à atual, para a mesma letra percorrer as opções que começam com ela. */
  const matchTyped = (char: string, current: number) => {
    const now = Date.now();
    const fresh = now - typed.current.at > 500;
    typed.current = { text: fresh ? char : typed.current.text + char, at: now };
    const from = fresh ? current + 1 : current;
    const needle = typed.current.text.toLocaleLowerCase();
    const order = [...options.keys()].map((k) => (from + k) % options.length);
    return order.find((i) => options[i].label.toLocaleLowerCase().startsWith(needle)) ?? -1;
  };

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const current = selectedIndex >= 0 ? selectedIndex : 0;
    const printable = e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) openAt(current);
      else if (e.key === "Home") openAt(0);
      else if (e.key === "End") openAt(options.length - 1);
      else if (printable) {
        const found = matchTyped(e.key, current);
        openAt(found >= 0 ? found : current);
      } else return;
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        if (e.altKey) return;
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        if (e.altKey) choose(active);
        else setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
      case "PageUp":
        setActive(0);
        break;
      case "End":
      case "PageDown":
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        choose(active);
        break;
      case "Escape":
        setOpen(false);
        break;
      case "Tab":
        choose(active);
        return; // sem preventDefault: o foco segue para o próximo campo
      default:
        if (!printable) return;
        {
          const found = matchTyped(e.key, active);
          if (found >= 0) setActive(found);
        }
    }
    e.preventDefault();
  }

  const SelectedIcon = selected?.icon;

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1.5">
      <span id={labelId} className="text-[0.92rem] font-semibold text-text">
        {label}
      </span>

      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        onClick={() => (open ? setOpen(false) : openAt(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        className={cn(
          "flex min-h-12 w-full items-center gap-3 rounded-[10px] border border-line-strong bg-bg px-4 py-3 text-left text-base",
          "transition-colors duration-200",
          error && "border-danger",
          selected ? "text-text" : "text-text-3"
        )}
      >
        {SelectedIcon && <SelectedIcon className="h-4 w-4 shrink-0 text-text-2" aria-hidden />}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-text-2 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        tabIndex={-1}
        hidden={!open}
        // O foco não sai do botão quando se clica numa opção.
        onMouseDown={(e) => e.preventDefault()}
        className="absolute top-full right-0 left-0 z-20 mt-2 max-h-72 overflow-auto rounded-[10px] border border-line-strong bg-bg p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]"
      >
        {options.map((option, i) => {
          const Icon = option.icon;
          const isSelected = i === selectedIndex;
          return (
            <li
              key={option.id}
              id={optionId(i)}
              role="option"
              aria-selected={isSelected}
              onClick={() => choose(i)}
              onMouseMove={() => active !== i && setActive(i)}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-[0.98rem] text-text",
                i === active && "bg-surface-2"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-text-2" aria-hidden />
              <span className="flex-1">{option.label}</span>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-accent-text" aria-hidden />}
            </li>
          );
        })}
      </ul>

      {error && (
        <p id={errorId} className="text-[0.9rem] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
