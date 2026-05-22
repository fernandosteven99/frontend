function Header({ title, subtitle }) {
  return (
    <div style={{
      background: "#1a56db",
      borderRadius: "12px",
      padding: "16px 24px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      boxShadow: "0 2px 8px rgba(26,86,219,0.3)"
    }}>
      <img 
        src="/banner.png" 
        alt="Logo CUL" 
        style={{ height: "40px", objectFit: "contain" }} 
      />
      <div>
        <h2 style={{ margin: 0, color: "white", fontSize: "18px", fontWeight: "700" }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default Header;