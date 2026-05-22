import { useState } from "react";
import RoleSelector from "../ui/RoleSelector";
import AlertMessage from "../ui/AlertMessage";

const API_URL = "https://backend-6jy7.onrender.com";

function Register() {
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", usuario: "", contrasena: "", role_id: 1,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roles = [
    { id: 1, label: "🎓 Estudiante" },
    { id: 2, label: "⚙️ Admin" },
    { id: 3, label: "🏋 Instructor" },
  ];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role_id: parseInt(form.role_id) }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.detail); return; }
      setSuccess("Usuario registrado exitosamente, ya puedes iniciar sesión");
      setError("");
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
      fontFamily: "'Segoe UI', sans-serif",
      padding: "20px"
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
          <h2 style={{ margin: 0, color: "#1a202c", fontSize: "22px", fontWeight: "700" }}>Crear cuenta</h2>
          <p style={{ margin: "6px 0 0", color: "#718096", fontSize: "14px" }}>Completa el formulario para registrarte</p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", color: "#4a5568", fontWeight: "600", display: "block", marginBottom: "6px" }}>Rol:</label>
          <RoleSelector roles={roles} selectedId={form.role_id} onSelect={(id) => setForm({ ...form, role_id: id })} />
        </div>

        {["nombre", "apellido", "email", "usuario", "contrasena"].map((field) => (
          <div key={field} style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", color: "#4a5568", fontWeight: "600", display: "block", marginBottom: "6px" }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === "contrasena" ? "password" : field === "email" ? "email" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={field === "email" ? "tucorreo@email.com" : field === "contrasena" ? "••••••••" : ""}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
            />
          </div>
        ))}

        <AlertMessage message={error} type="error" />
        <AlertMessage message={success} type="success" />

        <button type="button" onClick={handleRegister} style={{
          width: "100%", padding: "12px", background: "#1a56db", color: "white",
          border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer", marginTop: "8px"
        }}>
          Registrarse →
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#718096", fontSize: "13px" }}>
          ¿Ya tienes cuenta? <a href="/" style={{ color: "#1a56db", textDecoration: "none", fontWeight: "600" }}>Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
