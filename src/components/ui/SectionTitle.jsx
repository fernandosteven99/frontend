function SectionTitle({ children }) {
  return (
    <h3 style={{
      color: "#1a56db",
      marginBottom: "16px",
      fontSize: "16px",
      fontWeight: "700",
      borderBottom: "2px solid #bee3f8",
      paddingBottom: "8px"
    }}>
      {children}
    </h3>
  );
}

export default SectionTitle;