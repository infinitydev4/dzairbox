"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { filterPickerOptions, type PickerOption } from "@/lib/option-picker";
import styles from "./option-picker.module.css";

type Panel = {
  mobile: boolean;
  root: HTMLElement;
  top?: number;
  bottom?: number;
  left?: number;
  width?: number;
};

function revealActive(sheet: HTMLElement | null) {
  const option = sheet?.querySelector<HTMLElement>("[data-active='true']");
  const list = sheet?.querySelector("ul");
  if (!option || !list) return;
  const optionRect = option.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();
  if (optionRect.top < listRect.top)
    list.scrollTop -= listRect.top - optionRect.top;
  else if (optionRect.bottom > listRect.bottom)
    list.scrollTop += optionRect.bottom - listRect.bottom;
}

function placePanel(trigger: HTMLElement): Panel {
  const mobile = window.matchMedia("(max-width: 750px)").matches;
  const dialog = trigger.closest("dialog");
  const root =
    dialog instanceof HTMLDialogElement && dialog.open ? dialog : document.body;
  if (mobile) return { mobile: true, root };
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(Math.max(rect.width, 280), window.innerWidth - 16);
  const rtl = Boolean(trigger.closest("[dir='rtl']"));
  let left = rtl ? rect.right - width : rect.left;
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  const below = window.innerHeight - rect.bottom;
  const above = below < 320 && rect.top > below;
  return {
    mobile: false,
    root,
    width,
    left,
    top: above ? undefined : rect.bottom + 6,
    bottom: above ? window.innerHeight - rect.top + 6 : undefined,
  };
}

type PickerBase = {
  options: PickerOption[];
  label: string;
  placeholder: string;
  disabled?: boolean;
  invalid?: boolean;
  tone?: "field" | "filter";
};
type SinglePicker = PickerBase & {
  multiple?: false;
  value: string;
  onValueChange: (value: string) => void;
  clearLabel?: string;
};
type MultiplePicker = PickerBase & {
  multiple: true;
  value: string[];
  onValueChange: (value: string[]) => void;
};

export function OptionPicker(props: SinglePicker | MultiplePicker) {
  const {
    options,
    label,
    placeholder,
    disabled = false,
    invalid = false,
    tone = "field",
  } = props;
  const multiple = props.multiple === true;
  const { t, language } = useLanguage();
  const s = (key: string) => t(`studio.${key}`);
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const selectedValues = multiple ? props.value : [props.value];
  const display = selectedValues
    .map(
      (item) => options.find((option) => option.value === item)?.label || item,
    )
    .filter(Boolean)
    .join(" · ");
  const filtered = filterPickerOptions(options, query);
  const clearLabel = "clearLabel" in props ? props.clearLabel : undefined;
  const rows =
    clearLabel && !query
      ? [{ value: "", label: clearLabel }, ...filtered]
      : filtered;

  useEffect(() => {
    if (!panel) return;
    const frame = requestAnimationFrame(() => {
      searchRef.current?.focus();
      revealActive(sheetRef.current);
    });
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = panel.root instanceof HTMLDialogElement ? panel.root : null;
    const keepParentOpen = (event: Event) => event.preventDefault();
    dialog?.addEventListener("cancel", keepParentOpen);
    const reposition = (event?: Event) => {
      if (
        event?.target instanceof Node &&
        sheetRef.current?.contains(event.target)
      )
        return;
      if (triggerRef.current) setPanel(placePanel(triggerRef.current));
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      dialog?.removeEventListener("cancel", keepParentOpen);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [Boolean(panel), panel?.mobile, panel?.root]);
  useEffect(() => {
    revealActive(sheetRef.current);
  }, [active, query]);

  function open() {
    if (!triggerRef.current) return;
    const current = multiple ? props.value : [props.value];
    const index = options.findIndex((option) => current.includes(option.value));
    setQuery("");
    setActive(clearLabel ? (index < 0 ? 0 : index + 1) : Math.max(0, index));
    setPanel(placePanel(triggerRef.current));
  }
  function close() {
    setPanel(null);
    setQuery("");
    triggerRef.current?.focus();
  }
  function choose(next: string) {
    if (props.multiple) {
      const current = props.value;
      props.onValueChange(
        current.includes(next)
          ? current.filter((item) => item !== next)
          : [...current, next],
      );
      return;
    }
    props.onValueChange(next);
    close();
  }
  function selected(optionValue: string) {
    return multiple
      ? props.value.includes(optionValue)
      : optionValue === props.value;
  }
  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) =>
        event.key === "ArrowDown"
          ? Math.min(rows.length - 1, index + 1)
          : Math.max(0, index - 1),
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(0, rows.length - 1));
    } else if (
      event.key === "Enter" &&
      event.target === searchRef.current &&
      rows[active]
    ) {
      event.preventDefault();
      choose(rows[active].value);
    } else if (event.key === "Tab" && sheetRef.current) {
      const focusable = [
        ...sheetRef.current.querySelectorAll<HTMLElement>("input, button"),
      ].filter((element) => element.tabIndex >= 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  const listId = `${baseId}-list`;
  const titleId = `${baseId}-title`;
  return (
    <div className={styles.picker}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        data-empty={display ? "false" : "true"}
        data-tone={tone}
        aria-haspopup="dialog"
        aria-expanded={Boolean(panel)}
        aria-controls={panel ? `${baseId}-dialog` : undefined}
        aria-label={`${label}, ${display || placeholder}`}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={open}
      >
        <span>{display || placeholder}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {panel &&
        createPortal(
          <div
            className={`${styles.layer} ${panel.mobile ? styles.layerSheet : ""}`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={sheetRef}
              id={`${baseId}-dialog`}
              className={`${styles.sheet} ${panel.mobile ? styles.sheetDrawer : styles.sheetPopover}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              dir={language === "ar" ? "rtl" : "ltr"}
              style={
                panel.mobile
                  ? undefined
                  : {
                      top: panel.top,
                      bottom: panel.bottom,
                      left: panel.left,
                      width: panel.width,
                    }
              }
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={onKeyDown}
            >
              {panel.mobile && <div className={styles.handle} />}
              <header className={styles.header}>
                <h2 className={styles.title} id={titleId}>
                  {label}
                </h2>
                <button
                  type="button"
                  className={styles.close}
                  aria-label={s("pickerClose")}
                  onClick={close}
                >
                  <X size={18} />
                </button>
              </header>
              <label className={styles.search}>
                <Search size={16} aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="text"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={
                    rows[active] ? `${baseId}-opt-${active}` : undefined
                  }
                  aria-label={s("pickerSearch")}
                  enterKeyHint="done"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={s("pickerSearch")}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                />
                {query && (
                  <button
                    type="button"
                    className={styles.clear}
                    aria-label={s("pickerClear")}
                    onClick={() => {
                      setQuery("");
                      setActive(0);
                      searchRef.current?.focus();
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
              {rows.length ? (
                <ul
                  className={styles.list}
                  id={listId}
                  role="listbox"
                  aria-multiselectable={multiple || undefined}
                >
                  {rows.map((option, index) => (
                    <li key={option.value || "clear"}>
                      <button
                        id={`${baseId}-opt-${index}`}
                        type="button"
                        className={styles.option}
                        role="option"
                        tabIndex={-1}
                        aria-selected={selected(option.value)}
                        data-active={index === active ? "true" : "false"}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => choose(option.value)}
                      >
                        <span>{option.label}</span>
                        {selected(option.value) && (
                          <Check size={16} aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty} role="status">
                  {s("pickerEmpty")}
                </p>
              )}
            </div>
          </div>,
          panel.root,
        )}
    </div>
  );
}
