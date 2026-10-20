// Category list + the icon and colour used for each one across the UI.
import {
  Utensils,
  Plane,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Film,
  GraduationCap,
  Tag,
} from "lucide-react";

// Must match backend/config/categories.js
export const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Other",
];

export const CATEGORY_META = {
  Food: { icon: Utensils, color: "#f97316" },
  Travel: { icon: Plane, color: "#0ea5e9" },
  Shopping: { icon: ShoppingBag, color: "#ec4899" },
  Bills: { icon: Receipt, color: "#8b5cf6" },
  Health: { icon: HeartPulse, color: "#ef4444" },
  Entertainment: { icon: Film, color: "#eab308" },
  Education: { icon: GraduationCap, color: "#10b981" },
  Other: { icon: Tag, color: "#64748b" },
};
