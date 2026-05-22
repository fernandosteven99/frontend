function SportButton({ sport, isSelected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "10px 20px",
      background: isSelected ? "#1a56db" : "white",
      color: isSelected ? "white" : "#1a202c",
      border: "1px solid",
      borderColor: isSelected ? "#1a56db" : "#e2e8f0",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      transition: "all 0.2s"
    }}>
      {sport.name}
    </button>
  );
}

export default SportButton;