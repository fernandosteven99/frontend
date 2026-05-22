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

function Instructor() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [section, setSection] = useState("clases");
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [ratings, setRatings] = useState([]);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [perfil, setPerfil] = useState({ nombre: "", apellido: "", bio: "", especialidad: "", foto: "" });
  const [perfilEdit, setPerfilEdit] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const [sports, setSports] = useState([]);
  const [locations, setLocations] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ sport_id: "", day: "", time: "", capacity: "", location_id: "" });

  const showMsg = (text, type = "success") => {
    setMessage(text); setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  useEffect(() => {
    fetch(`${API_URL}/schedules/instructor/${user.id}`).then(r => r.json()).then(setSchedules);
    fetch(`${API_URL}/sports`).then(r => r.json()).then(setSports);
    fetch(`${API_URL}/locations/`).then(r => r.json()).then(setLocations);
    fetch(`${API_URL}/ratings/instructor/${user.id}`).then(r => r.json()).then(data => setRatings(Array.isArray(data) ? data : [])).catch(() => setRatings([]));
    const p = localStorage.getItem(`perfil_instructor_${user.id}`);
    if (p) setPerfil(JSON.parse(p));
    else setPerfil({ nombre: user?.nombre || "", apellido: user?.apellido || "", bio: "", especialidad: "", foto: "" });
  }, [user.id]);

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    fetch(`${API_URL}/schedules/${schedule.id}/students`).then(r => r.json()).then(data => {
      setStudents(data);
      const init = {};
      data.forEach(s => init[s.reservation_id] = "present");
      setAttendance(init);
    });
  };

  const handleSaveAll = async () => {
    for (const s of students) {
      await fetch(`${API_URL}/attendance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: s.reservation_id, status: attendance[s.reservation_id] }),
      });
    }
    showMsg("✅ Asistencia guardada");
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.sport_id || !newSchedule.day || !newSchedule.time || !newSchedule.capacity || !newSchedule.location_id) {
      showMsg("⚠️ Completa todos los campos", "error"); return;
    }
    const r = await fetch(`${API_URL}/schedules`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newSchedule, sport_id: parseInt(newSchedule.sport_id), capacity: parseInt(newSchedule.capacity), location_id: parseInt(newSchedule.location_id), instructor_id: user.id }),
    });
    const data = await r.json();
    showMsg(data.message || "✅ Horario creado");
    fetch(`${API_URL}/schedules/instructor/${user.id}`).then(r => r.json()).then(setSchedules);
    setNewSchedule({ sport_id: "", day: "", time: "", capacity: "", location_id: "" });
  };

  const handleSavePerfil = () => {
    localStorage.setItem(`perfil_instructor_${user.id}`, JSON.stringify(perfil));
    setPerfilEdit(false);
    showMsg("✅ Perfil actualizado");
  };

  const handleSendNotif = async () => {
    if (!selectedSchedule) { showMsg("⚠️ Selecciona una clase primero", "error"); return; }
    if (!notifMsg.trim()) { showMsg("⚠ Escribe un mensaje", "error"); return; }
    for (const s of students) {
      await fetch(`${API_URL}/notifications`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: s.id, message: notifMsg }),
      });
    }
    setNotifMsg("");
    showMsg(`✅ Notificación enviada a ${students.length} estudiantes`);
  };

  const totalEstudiantes = schedules.reduce((a, s) => a + (s.capacity || 0), 0);
  const promedioRating = ratings.length ? (ratings.reduce((a, r) => a + (r.rating || 0), 0) / ratings.length).toFixed(1) : "—";
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const selectStyle = { padding: "10px", background: "#1a3a4a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "white", fontSize: "14px", width: "100%", marginBottom: "10px", boxSizing: "border-box", cursor: "pointer" };

  return (
    <PageWrapper>
      <Navbar
        sections={[
          { id: "clases", label: "🏋️ Mis Clases" },
          { id: "asistencia", label: "📊 Asistencia" },
          { id: "horarios", label: "📅 Mis Horarios" },
          { id: "notificas", label: "📣 Notificaciones" },
          { id: "estadisticas", label: "📈 Estadísticas" },
          { id: "perfil", label: "👤 Mi Perfil" },
        ]}
        activeSection={section} onSelect={setSection} userName={user?.nombre} role="Instructor"
      />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 24px" }}>
        <AlertMessage message={message} type={msgType} />

        {section === "clases" && (
          <>
            <SectionTitle>Mis Clases</SectionTitle>
            {schedules.length === 0 ? <p style={{ color: "#aaa" }}>No tienes clases asignadas.</p> : (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                {schedules.map(s => (
                  <button key={s.id} type="button" onClick={() => handleSelectSchedule(s)} style={{ padding: "12px 20px", background: selectedSchedule?.id === s.id ? "linear-gradient(135deg, #f7971e, #ffd200)" : "rgba(255,255,255,0.08)", color: selectedSchedule?.id === s.id ? "#000" : "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                    🏅 {s.sport} — {s.day} {s.time}
                  </button>
                ))}
              </div>
            )}
            {selectedSchedule && (
              <>
                <SectionTitle>Estudiantes — {selectedSchedule.sport} {selectedSchedule.day}</SectionTitle>
                {students.length === 0 ? <p style={{ color: "#aaa" }}>No hay estudiantes inscritos.</p> : (
                  <>
                    {students.map(s => (
                      <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: "bold" }}>{s.nombre} {s.apellido}</p>
                          <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>{s.email}</p>
                        </div>
                        <select value={attendance[s.reservation_id] || "present"} onChange={e => setAttendance({ ...attendance, [s.reservation_id]: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: attendance[s.reservation_id] === "present" ? "#51cf66" : "#ff6b6b", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                          <option value="present">✅ Presente</option>
                          <option value="absent">❌ Ausente</option>
                        </select>
                      </Card>
                    ))}
                    <Button onClick={handleSaveAll} color="primary" width="100%">GUARDAR ASISTENCIA →</Button>
                  </>
                )}
              </>
            )}
          </>
        )}

        {section === "asistencia" && (
          <>
            <SectionTitle>Resumen de Asistencia</SectionTitle>
            {schedules.map(s => (
              <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>🏅 {s.sport}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>📅 {s.day} — {s.time}</p>
                </div>
                <span style={{ background: "rgba(81,207,102,0.15)", color: "#51cf66", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>Cap: {s.capacity}</span>
              </Card>
            ))}
          </>
        )}

        {section === "horarios" && (
          <>
            <SectionTitle>Crear Nuevo Horario</SectionTitle>
            <Card>
              <select value={newSchedule.sport_id} onChange={e => setNewSchedule({ ...newSchedule, sport_id: e.target.value })} style={selectStyle}><option value="" disabled>— Deporte —</option>{sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              <select value={newSchedule.location_id} onChange={e => setNewSchedule({ ...newSchedule, location_id: e.target.value })} style={selectStyle}><option value="" disabled>— Ubicación —</option>{locations.map(l => <option key={l[0]} value={l[0]}>{l[1]}</option>)}</select>
              <select value={newSchedule.day} onChange={e => setNewSchedule({ ...newSchedule, day: e.target.value })} style={selectStyle}><option value="" disabled>— Día —</option>{DIAS.map(d => <option key={d} value={d}>{d}</option>)}</select>
              <input type="time" value={newSchedule.time} onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })} style={selectStyle} />
              <Input placeholder="Capacidad" type="number" value={newSchedule.capacity} onChange={e => setNewSchedule({ ...newSchedule, capacity: e.target.value })} />
              <Button onClick={handleCreateSchedule} color="primary" width="100%">+ CREAR HORARIO</Button>
            </Card>
            <SectionTitle>Mis Horarios Actuales</SectionTitle>
            {schedules.map(s => (
              <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>📅 {s.sport} — {s.day} {s.time}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>Capacidad: {s.capacity}</p>
                </div>
              </Card>
            ))}
          </>
        )}

        {section === "notificas" && (
          <>
            <SectionTitle>📣 Enviar Notificación</SectionTitle>
            <Card>
              {selectedSchedule ? (
                <div style={{ background: "rgba(247,151,30,0.1)", border: "1px solid rgba(247,151,30,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#ffd200", fontWeight: "bold" }}>📌 {selectedSchedule.sport} — {selectedSchedule.day} {selectedSchedule.time}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color
