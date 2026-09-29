
import { motion } from "motion/react";

type ExpenseCategory =
  | "merchandise"
  | "equipment"
  | "supplies"
  | "rent"
  | "utilities"
  | "marketing"
  | "transport"
  | "other";

type Expense = {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
};

type ExpensesProps = {
  expenses?: Expense[];
  onAddExpense?: () => void;
  onRemoveExpense?: (expense: Expense) => void;
};

const defaultExpenses: Expense[] = [
  {
    id: "1",
    description: "Hair products",
    category: "merchandise",
    amount: 450,
    date: new Date("2026-09-28"),
  },
  {
    id: "2",
    description: "New clipper",
    category: "equipment",
    amount: 1200,
    date: new Date("2026-09-25"),
  },
  {
    id: "3",
    description: "Shop rent",
    category: "rent",
    amount: 4000,
    date: new Date("2026-09-01"),
  },
];

const categoryLabels: Record<ExpenseCategory, string> = {
  merchandise: "Merchandise",
  equipment: "Equipment",
  supplies: "Supplies",
  rent: "Rent",
  utilities: "Utilities",
  marketing: "Marketing",
  transport: "Transport",
  other: "Other",
};

export default function Expenses({
  expenses = defaultExpenses,
  onAddExpense,
  onRemoveExpense,
}: ExpensesProps) {
  const monthlyTotal = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Expenses</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {/* Monthly total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-white/5 px-4 py-4"
        >
          <div className="text-xs uppercase tracking-wide text-white/50">
            This Month
          </div>

          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(monthlyTotal)}
          </div>
        </motion.div>

        {/* Expense list */}
        {expenses.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No expenses recorded
          </p>
        )}

        {expenses.map((expense, index) => {
          const formattedDate = new Intl.DateTimeFormat("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(expense.date);

          return (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: (index + 1) * 0.04,
                ease: "easeOut",
              }}
              className="rounded-xl bg-white/5 px-4 py-3"
            >
              {/* Description + Amount */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white">
                  {expense.description}
                </span>

                <span className="text-sm font-semibold text-white">
                  {formatCurrency(expense.amount)}
                </span>
              </div>

              {/* Category + Date */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/70">
                  {categoryLabels[expense.category]}
                </span>

                <span className="text-xs text-white/50">
                  {formattedDate}
                </span>
              </div>

              {/* Remove */}
              {onRemoveExpense && (
                <button
                  type="button"
                  onClick={() => onRemoveExpense(expense)}
                  className="mt-3 text-xs text-red-400 hover:text-red-300
                    transition-colors cursor-pointer"
                >
                  Remove expense
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add Expense */}
      <div className="px-4 py-3 shrink-0 border-t border-white/10">
        <button
          type="button"
          onClick={onAddExpense}
          className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10
            text-white text-sm font-semibold transition-colors cursor-pointer
            flex items-center justify-center gap-2"
        >
          <span className="fa-solid fa-plus" />
          Add Expense
        </button>
      </div>
    </div>
  );
}
