// Shared 3-step progress bar for the function chain.
const STEPS = ["Campaign details", "Angle & copy", "Creative brief"];

export function StepBar({ current }: { current: number }) {
  return (
    <div className="step-bar">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "cur" : "pend";
        return (
          <div key={label} style={{ display: "contents" }}>
            <div className={`stp${state === "cur" ? " cur" : ""}`}>
              <div
                className={`stp-dot ${
                  state === "done" ? "dot-done" : state === "cur" ? "dot-cur" : "dot-pend"
                }`}
              >
                {state === "done" ? (
                  <i className="ti ti-check" style={{ fontSize: 10 }} />
                ) : (
                  n
                )}
              </div>
              <span>{label}</span>
            </div>
            {n < STEPS.length && <div className="stp-line" />}
          </div>
        );
      })}
    </div>
  );
}
