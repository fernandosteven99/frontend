import { useState } from "react";
import { FaFutbol, FaUsers, FaCalendarAlt, FaChartBar, FaTachometerAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

function Navbar({ sections, activeSection, onSelect, userName, role }) {
  const [showMenu, setShowMenu] = useState(false);

  const icons = {
    usuarios: <FaUsers />,
    deportes: <FaFutbol />,
    horarios: <FaCalendarAlt />,
    reportes: <FaChartBar />,
    dashboard: <FaTachometerAlt />,
  };

  return (
    <div style={{
      background: "#1e3a5f",
      padding: "0 40px",
      marginBottom: "0",
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      width: "100%",
      boxSizing: "border-box",
      position: "relative"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <span style={{ color: "white", fontWeight: "700", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FaFutbol color="#ffd200" /> Sistema Deportivo
        </span>

        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#4a6fa5",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <FaUserCircle size={24} color="white" />
          </div>

          {showMenu && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "50px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              padding: "8px",
              minWidth: "200px",
              zIndex: 1000,
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", marginBottom: "8px" }}>
                <p style={{ margin: 0, fontWeight: "700", color: "#1a202c" }}>{userName}</p>
                <span style={{ fontSize: "12px", color: "#1e3a5f", fontWeight: "600", background: "#ebf8ff", padding: "2px 8px", borderRadius: "20px" }}>{role}</span>
              </div>
              <button
                type="button"
                onClick={() => window.location.href = "/profile"}
                style={{
                  width: "100%", padding: "10px 16px", background: "none", border: "none",
                  textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px",
                  color: "#1a202c", display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                <FaUserCircle color="#1e3a5f" /> Mi Perfil
              </button>
              <button
                type="button"
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                style={{
                  width: "100%", padding: "10px 16px", background: "none", border: "none",
                  textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px",
                  color: "#e53e3e", display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                <FaSignOutAlt color="#e53e3e" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0", padding: "0" }}>
        {sections.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              background: "transparent",
              color: activeSection === s.id ? "white" : "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontWeight: activeSection === s.id ? "700" : "400",
              fontSize: "14px",
              transition: "all 0.2s",
              borderBottom: activeSection === s.id ? "3px solid #ffd200" : "3px solid transparent",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {icons[s.id]} {s.label.replace(/[^\w\s]/gi, '').trim()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Navbar;