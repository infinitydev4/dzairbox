import { normalizeSearchText } from "@/lib/search-normalization";

export type PickerOption = { value: string; label: string };

export function filterPickerOptions(options: PickerOption[], query: string) {
  const needle = normalizeSearchText(query);
  if (!needle) return options;
  return options.filter((option) =>
    normalizeSearchText(`${option.label} ${option.value}`).includes(needle),
  );
}
