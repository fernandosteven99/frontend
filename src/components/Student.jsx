import { useEffect, useState } from "react";
import PageWrapper from "./ui/PageWrapper";
import SectionTitle from "./ui/SectionTitle";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import AlertMessage from "./ui/AlertMessage";
import LogoutButton from "./ui/LogoutButton";
import Navbar from "./ui/Navbar";

const API_URL = "https://backend-6jy7.onrender.com";

function Student() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [section, setSection] = useState("inscripciones");
  const [inscriptions, setInscriptions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [passwords, setPasswords] = useState({ actual: "", nueva: "", confirmar: "" });

  const showMsg = (text, type = "success") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  useEffect(() => {
    fetch(`${API_URL}/student/${user.id}/inscriptions`).then(r => r.json()).then(setInscriptions);
    fetch(`${API_URL}/student/${user.id}/attendance`).then(r => r.json()).then(setAttendance);
    fetch(`${API_URL}/student/${user.id}/notifications`).then(r => r.json()).then(setNotifications);
    fetch(`${API_URL}/student/${user.id}/profile`).then(r => r.json()).then(setProfile);
  }, [user.id]);

  const cancelInscription = async (reservation_id) => {
    const r = await fetch(`${API_URL}/student/${user.id}/cancel/${reservation_id}`, { method: "DELETE" });
    const data = await r.json();
    if (r.ok) {
      setInscriptions(inscriptions.filter(i => i.reservation_id !== reservation_id));
      showMsg(data.message);
    } else {
      showMsg(data.detail, "error");
    }
  };

  const changePassword = async () => {
    if (passwords.nueva !== passwords.confirmar) {
      showMsg("Las contraseñas nuevas no coinciden", "error");
      return;
    }
    const r = await fetch(
      `${API_URL}/student/${user.id}/password?contrasena_actual=${passwords.actual}&contrasena_nueva=${passwords.nueva}`,
      { method: "PUT" }
    );
    const data = await r.json();
    if (r.ok) {
      showMsg(data.message);
      setPasswords({ actual: "", nueva: "", confirmar: "" });
    } else {
      showMsg(data.detail, "error");
    }
  };

  const statusColor = (status) => {
    if (status === "present") return "#51cf66";
    if (status === "absent") return "#ff6b6b";
    return "#aaa";
  };

  const statusLabel = (status) => {
    if (status === "present") return "✅ Presente";
    if (status === "absent") return "❌ Ausente";
    return "⏳ Pendiente";
  };

  return (
    <PageWrapper>
      <Navbar
        sections={[
          { id: "inscripciones", label: "📋 Inscripciones" },
          { id: "asistencia", label: "📊 Asistencia" },
          { id: "notificaciones", label: "🔔 Notificaciones" },
          { id: "perfil", label: "👤 Perfil" },
        ]}
        activeSection={section}
        onSelect={setSection}
        userName={user?.nombre}
        role="Estudiante"
      />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "30px 24px" }}>
        <AlertMessage message={message} type={msgType} />

        {section === "inscripciones" && (
          <>
            <SectionTitle>Mis Inscripciones</SectionTitle>
            {inscriptions.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes inscripciones activas.</p>
            ) : (
              inscriptions.map(i => (
                <Card key={i.reservation_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: "bold" }}>🏅 {i.sport}</p>
                    <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>📅 {i.day} — {i.time}</p>
                  </div>
                  <Button onClick={() => cancelInscription(i.reservation_id)} color="danger">Cancelar</Button>
                </Card>
              ))
            )}
            <div style={{ marginTop: "20px" }}>
              <Button onClick={() => window.location.href = "/sports"} color="primary" width="100%">
                + Inscribirse a un deporte
              </Button>
            </div>
          </>
        )}

        {section === "asistencia" && (
          <>
            <SectionTitle>Mi Asistencia</SectionTitle>
            {attendance.length === 0 ? (
              <p style={{ color: "#aaa" }}>No hay registros de asistencia.</p>
            ) : (
              <>
                <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                  <Card style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#51cf66" }}>
                      {attendance.filter(a => a.status === "present").length}
                    </p>
                    <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>Presencias</p>
                  </Card>
                  <Card style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#ff6b6b" }}>
                      {attendance.filter(a => a.status === "absent").length}
                    </p>
                    <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>Ausencias</p>
                  </Card>
                  <Card style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#aaa" }}>
                      {attendance.filter(a => a.status === "pending").length}
                    </p>
                    <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>Pendientes</p>
                  </Card>
                </div>
                {attendance.map((a, i) => (
                  <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold" }}>🏅 {a.sport}</p>
                      <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>📅 {a.day} — {a.time}</p>
                    </div>
                    <span style={{ color: statusColor(a.status), fontWeight: "bold", fontSize: "13px" }}>
                      {statusLabel(a.status)}
                    </span>
                  </Card>
                ))}
              </>
            )}
          </>
        )}

        {section === "notificaciones" && (
          <>
            <SectionTitle>Notificaciones</SectionTitle>
            {notifications.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes notificaciones.</p>
            ) : (
              notifications.map(n => (
                <Card key={n.id}>
                  <p style={{ margin: 0 }}>🔔 {n.message || "Sin mensaje"}</p>
                  <p style={{ margin: 0, color: n.seen ? "#51cf66" : "#ffd200", fontSize: "13px" }}>
                    {n.seen ? "✅ Leída" : "🔵 Nueva"}
                  </p>
                </Card>
              ))
            )}
          </>
        )}

        {section === "perfil" && profile && (
          <>
            <SectionTitle>Mi Perfil</SectionTitle>
            <Card>
              <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#aaa" }}>Nombre</p>
              <p style={{ margin: "0 0 16px", fontWeight: "bold" }}>{profile.nombre} {profile.apellido}</p>
              <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#aaa" }}>Email</p>
              <p style={{ margin: "0 0 16px", fontWeight: "bold" }}>{profile.email}</p>
              <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#aaa" }}>Usuario</p>
              <p style={{ margin: "0 0 0", fontWeight: "bold" }}>{profile.usuario}</p>
            </Card>

            <SectionTitle>Cambiar Contraseña</SectionTitle>
            <Input label="Contraseña actual" type="password" value={passwords.actual} onChange={e => setPasswords({ ...passwords, actual: e.target.value })} placeholder="••••••••" />
            <Input label="Nueva contraseña" type="password" value={passwords.nueva} onChange={e => setPasswords({ ...passwords, nueva: e.target.value })} placeholder="••••••••" />
            <Input label="Confirmar nueva contraseña" type="password" value={passwords.confirmar} onChange={e => setPasswords({ ...passwords, confirmar: e.target.value })} placeholder="••••••••" />
            <Button onClick={changePassword} color="primary" width="100%">CAMBIAR CONTRASEÑA →</Button>
          </>
        )}

        <LogoutButton />
      </div>
    </PageWrapper>
  );
}

export default Student;
