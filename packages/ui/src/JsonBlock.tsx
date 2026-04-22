export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        borderRadius: 18,
        padding: "1rem",
        background: "rgba(15,18,24,0.92)",
        border: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

