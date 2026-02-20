import type { ToolbarProps } from "../types";

const VIEW_BUTTONS: Array<{ label: string; value: ToolbarProps["view"] }> = [
  { label: "Month", value: "month" },
  { label: "Week", value: "timeGridWeek" },
  { label: "Day", value: "timeGridDay" }
];

export function Toolbar({
  title,
  view,
  onToday,
  onPrev,
  onNext,
  onViewChange
}: ToolbarProps) {
  return (
    <header className="oc-toolbar">
      <div className="oc-toolbar__nav">
        <button type="button" className="oc-btn oc-btn--ghost" onClick={onToday}>
          Today
        </button>
        <button type="button" className="oc-btn oc-btn--icon" onClick={onPrev} aria-label="Previous">
          <span aria-hidden="true">&lt;</span>
        </button>
        <button type="button" className="oc-btn oc-btn--icon" onClick={onNext} aria-label="Next">
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      <h2 className="oc-toolbar__title">{title}</h2>

      <div className="oc-toolbar__views">
        {VIEW_BUTTONS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`oc-btn ${item.value === view ? "oc-btn--active" : "oc-btn--ghost"}`}
            onClick={() => onViewChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
