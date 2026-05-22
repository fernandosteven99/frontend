import { useState } from "react";
import RoleSelector from "../ui/RoleSelector";
import AlertMessage from "../ui/AlertMessage";

const API_URL = "https://backend-6jy7.onrender.com";

function Login() {
  const [credencial, setCredencial] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [roleId, setRoleId] = useState(1);
  const [error, setError] = useState("");

  const roles = [
    { id: 1, label: "🎓 Estudiante" },
    { id: 2, label: "⚙️ Admin" },
    { id: 3, label: "🏋️ Instructor" },
  ];

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${API_URL}/auth/login?credencial=${credencial}&contrasena=${contrasena}&role_id=${roleId}`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) { setError(data.detail); return; }
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role_id === 3) window.location.href = "/instructor";
      else if (data.user.role_id === 2) window.location.href = "/admin";
      else if (data.user.role_id === 1) window.location.href = "/student";
      else window.location.href = "/sports";
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4f8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🏆</div>
          <h2 style={{ margin: 0, color: "#1a202c", fontSize: "22px", fontWeight: "700" }}>Sistema Deportivo</h2>
          <p style={{ margin: "6px 0 0", color: "#718096", fontSize: "14px" }}>Inicia sesión en tu cuenta</p>
        </div>

        <RoleSelector roles={roles} selectedId={roleId} onSelect={setRoleId} />

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", color: "#4a5568", fontWeight: "600", display: "block", marginBottom: "6px" }}>Usuario o Email</label>
          <input
            type="text"
            value={credencial}
            onChange={(e) => setCredencial(e.target.value)}
            placeholder="tucorreo@email.com"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", color: "#4a5568", fontWeight: "600", display: "block", marginBottom: "6px" }}>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
          />
        </div>

        <AlertMessage message={error} type="error" />

        <button type="button" onClick={handleLogin} style={{
          width: "100%", padding: "12px", background: "#1a56db", color: "white",
          border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer"
        }}>
          Iniciar Sesión →
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#718096", fontSize: "13px" }}>
          ¿No tienes cuenta? <a href="/register" style={{ color: "#1a56db", textDecoration: "none", fontWeight: "600" }}>Regístrate</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
