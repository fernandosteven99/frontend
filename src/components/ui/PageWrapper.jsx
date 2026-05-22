function PageWrapper({ children, maxWidth = "700px" }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#1a202c",
      padding: "0"
    }}>
      {children}
    </div>
  );
}

export default PageWrapper;