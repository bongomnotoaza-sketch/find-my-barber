import { refundPolicyText } from "./refundpolicy"; 

type RefundsPolicyProps = {
  onBack: () => void;
};

export default function RefundsPolicy({ onBack }: RefundsPolicyProps) {
  return (
    <div className="flex flex-col h-dvh bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full
            text-white transition-transform duration-200 hover:translate-x-[-2px]
            cursor-pointer"
        >
          <span className="fa-solid fa-arrow-left" />
        </button>
        <span className="text-white font-semibold font-sans">
          Refund, Cancellation and Dispute Policy
        </span>
      </div>

      {/* Scrollable policy body */}
      <div className="flex-1 overflow-y-auto p-6">
        <pre className="whitespace-pre-wrap break-words text-white/80 font-sans text-sm leading-relaxed max-w-3xl mx-auto">
          {refundPolicyText}
        </pre>
      </div>
    </div>
  );
}