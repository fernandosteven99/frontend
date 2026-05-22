function LogoutButton() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <button type="button" onClick={handleLogout} style={{
      width: "100%",
      padding: "12px",
      background: "white",
      color: "#e53e3e",
      border: "1px solid #fed7d7",
      borderRadius: "8px",
      cursor: "pointer",
      marginTop: "30px",
      fontWeight: "600",
      fontSize: "14px"
    }}>
      Cerrar sesión
    </button>
  );
}

export default LogoutButton;