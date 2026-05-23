import { useState } from "react";
import { FaFutbol, FaUsers, FaCalendarAlt, FaChartBar, FaTachometerAlt, FaSignOutAlt, FaUserCircle, FaEnvelope } from "react-icons/fa";

function Navbar({ sections, activeSection, onSelect, userName, role }) {
  const [showMenu, setShowMenu] = useState(false);

  const icons = {
    usuarios: <FaUsers />,
    deportes: <FaFutbol />,
    horarios: <FaCalendarAlt />,
    reportes: <FaChartBar />,
    dashboard: <FaTachometerAlt />,
    clases: <FaCalendarAlt />,
    asistencia: <FaChartBar />,
    inscripciones: <FaUsers />,
    notificaciones: <FaEnvelope />,
    perfil: <FaUserCircle />,
  };

  return (
    <div style={{
      background: "#1e3a5f",
      padding: "0 40px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      width: "100%",
      boxSizing: "border-box",
      position: "relative"
    }}>
      <style>{`
        @media (max-width: 600px) {
          .navbar-outer { padding: 0 12px !important; }
          .navbar-logo { font-size: 15px !important; }
          .navbar-tabs { flex-wrap: wrap !important; }
          .navbar-tab {
            flex: 0 0 calc(50% - 4px) !important;
            font-size: 11px !important;
            padding: 10px 2px !important;
            gap: 4px !important;
          }
        }
      `}</style>

      <div className="navbar-outer" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <span className="navbar-logo" style={{ color: "white", fontWeight: "700", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FaFutbol color="#ffd200" /> Sistema Deportivo
        </span>

        <div style={{ position: "relative" }}>
          <div onClick={() => setShowMenu(!showMenu)} style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: "#4a6fa5", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            border: "2px solid rgba(255,255,255,0.3)",
          }}>
            <FaUserCircle size={24} color="white" />
          </div>

          {showMenu && (
            <div style={{
              position: "absolute", right: 0, top: "50px",
              background: "white", borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              padding: "8px", minWidth: "200px", zIndex: 1000,
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", marginBottom: "8px" }}>
                <p style={{ margin: 0, fontWeight: "700", color: "#1a202c" }}>{userName}</p>
                <span style={{ fontSize: "12px", color: "#1e3a5f", fontWeight: "600", background: "#ebf8ff", padding: "2px 8px", borderRadius: "20px" }}>{role}</span>
              </div>
              <button type="button" onClick={() => window.location.href = "/messages"}
                style={{ width: "100%", padding: "10px 16px", background: "none", border: "none", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px", color: "#1a202c", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaEnvelope color="#1e3a5f" /> Mensajes
              </button>
              <button type="button" onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                style={{ width: "100%", padding: "10px 16px", background: "none", border: "none", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px", color: "#e53e3e", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaSignOutAlt color="#e53e3e" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-tabs" style={{ display: "flex", gap: "0", padding: "0" }}>
        {sections.map(s => (
          <button
            key={s.id}
            type="button"
            className="navbar-tab"
            onClick={() => onSelect(s.id)}
            style={{
              flex: 1, padding: "12px 0", border: "none",
              background: "transparent",
              color: activeSection === s.id ? "white" : "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontWeight: activeSection === s.id ? "700" : "400",
              fontSize: "14px", transition: "all 0.2s",
              borderBottom: activeSection === s.id ? "3px solid #ffd200" : "3px solid transparent",
              textAlign: "center", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "6px",
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
