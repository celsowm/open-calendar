import type { ToolbarProps } from "../types";

export function Toolbar({
  title,
  view,
  availableViews,
  messages,
  onToday,
  onPrev,
  onNext,
  onViewChange
}: ToolbarProps) {
  return (
    <header className="oc-toolbar">
      <div className="oc-toolbar__nav">
        <button type="button" className="oc-btn oc-btn--ghost" onClick={onToday}>
          {messages.today}
        </button>
        <button type="button" className="oc-btn oc-btn--icon" onClick={onPrev} aria-label={messages.prev}>
          <span aria-hidden="true">&lt;</span>
        </button>
        <button type="button" className="oc-btn oc-btn--icon" onClick={onNext} aria-label={messages.next}>
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      <h2 className="oc-toolbar__title">{title}</h2>

      <div className="oc-toolbar__views">
        {availableViews.map((item) => (
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
