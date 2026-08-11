export const EXPENSE_CATEGORIES = [
  "Rent",
  "Groceries",
  "Transport",
  "Utilities",
  "Dining Out",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Insurance",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Bonus",
  "Freelance",
  "Investment",
  "Rental Income",
  "Gift",
  "Other",
] as const;

// Emoji icons per category for quick visual scanning.
export const CATEGORY_ICON: Record<string, string> = {
  // expense
  Rent: "🏠",
  Groceries: "🛒",
  Transport: "🚗",
  Utilities: "💡",
  "Dining Out": "🍽️",
  Entertainment: "🎬",
  Health: "🩺",
  Shopping: "🛍️",
  Education: "📚",
  Insurance: "🛡️",
  // income
  Salary: "💼",
  Bonus: "🎁",
  Freelance: "🧑‍💻",
  Investment: "📈",
  "Rental Income": "🔑",
  Gift: "🎀",
  Other: "✨",
};

export type TxType = "income" | "expense";
