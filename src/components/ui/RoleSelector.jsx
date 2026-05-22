function RoleSelector({ roles, selectedId, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
      {roles.map(role => (
        <button
          key={role.id}
          type="button"
          onClick={() => onSelect(role.id)}
          style={{
            flex: "1 1 auto",
            minWidth: "80px",
            padding: "10px 6px",
            background: selectedId === role.id ? "#1a56db" : "#e2e8f0",
            color: selectedId === role.id ? "white" : "#4a5568",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: selectedId === role.id ? "700" : "500",
            fontSize: "13px",
            transition: "all 0.2s"
          }}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}

export default RoleSelector;
