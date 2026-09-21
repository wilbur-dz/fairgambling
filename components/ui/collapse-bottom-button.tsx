"use client";

type CollapseBottomButtonProps = {
  label?: string;
};

/**
 * Port of reference `CollapseBottomButton` (closes nearest `<details>`).
 */
export function CollapseBottomButton({
  label = "Hide",
}: CollapseBottomButtonProps) {
  const text = typeof label === "string" && label.trim() ? label.trim() : "Hide";

  return (
    <div className="mt-5 flex justify-center">
      <button
        type="button"
        onClick={(event) => {
          const details = event.currentTarget.closest("details");
          if (!details) return;
          details.open = false;
          details.scrollIntoView({ block: "nearest" });
        }}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-base-500 transition-colors hover:text-base-700 dark:text-base-400 dark:hover:text-base-200"
      >
        {text}
        <span aria-hidden>▴</span>
      </button>
    </div>
  );
}
