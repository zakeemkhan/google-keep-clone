export default function Toast({ message, actionLabel, onAction }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      {onAction && (
        <button type="button" className="text-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
