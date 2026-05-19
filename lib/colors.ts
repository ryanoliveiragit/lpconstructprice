export const DARK = {
  bg:       "#0a0a0a",
  s1:       "#111111",
  s2:       "#161616",
  s3:       "#1c1c1c",
  text:     "#fafafa",
  muted:    "#737373",
  faint:    "#404040",
  border:   "#1f1f1f",
  borderHi: "#2e2e2e",
  or:       "#f97316",
  orDim:    "#f9731612",
  orLt:     "#fb923c",
  grn:      "#22c55e",
  grnDim:   "#22c55e14",
} as const;

export const LIGHT = {
  bg:       "#fafafa",
  s1:       "#f4f4f5",
  s2:       "#e4e4e7",
  s3:       "#d4d4d8",
  text:     "#09090b",
  muted:    "#52525b",
  faint:    "#a1a1aa",
  border:   "#e4e4e7",
  borderHi: "#d4d4d8",
  or:       "#f97316",
  orDim:    "#f9731612",
  orLt:     "#c2410c",
  grn:      "#16a34a",
  grnDim:   "#16a34a14",
} as const;

export type Theme = {
  bg: string; s1: string; s2: string; s3: string;
  text: string; muted: string; faint: string;
  border: string; borderHi: string;
  or: string; orDim: string; orLt: string;
  grn: string; grnDim: string;
};

export const C = DARK;
