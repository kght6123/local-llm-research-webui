export default function Progress({
  text,
  percentage,
}: {
  text: string;
  percentage?: number;
}): JSX.Element {
  percentage = percentage ?? 0;
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${percentage}%` }}>
        {text} ({`${percentage.toFixed(2)}%`})
      </div>
    </div>
  );
}
