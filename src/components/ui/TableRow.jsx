function TableRow({ left, right }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export default TableRow;