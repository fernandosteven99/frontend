function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "10px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      ...style
    }}>
      {children}
    </div>
  );
}

export default Card;