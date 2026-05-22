function Input({ label, type = "text", name, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ fontSize: "13px", color: "#4a5568", fontWeight: "600", display: "block", marginBottom: "6px" }}>{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "white",
          border: "1px solid #cbd5e0",
          borderRadius: "8px",
          color: "#1a202c",
          fontSize: "14px",
          boxSizing: "border-box",
          outline: "none"
        }}
      />
    </div>
  );
}

export default Input;