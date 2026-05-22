function AlertMessage({ message, type = "success" }) {
  if (!message) return null;
  const colors = {
    success: { bg: "#f0fff4", color: "#276749", border: "#9ae6b4" },
    error: { bg: "#fff5f5", color: "#c53030", border: "#feb2b2" },
    info: { bg: "#ebf8ff", color: "#2b6cb0", border: "#90cdf4" }
  };
  const c = colors[type];
  return (
    <div style={{
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: "8px",
      padding: "12px 16px",
      marginBottom: "16px",
      fontSize: "14px",
      fontWeight: "500"
    }}>
      {message}
    </div>
  );
}

export default AlertMessage;