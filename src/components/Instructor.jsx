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

  // Perfil
  const [perfil, setPerfil] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    bio: "",
    especialidad: "",
    foto: "",
  });
  const [perfilEdit, setPerfilEdit] = useState(false);

  // Notificación a estudiantes
  const [notifMsg, setNotifMsg] = useState("");

  // Nuevo horario
  const [sports, setSports] = useState([]);
  const [locations, setLocations] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    sport_id: "", day: "", time: "", capacity: "", location_id: ""
  });

  const showMsg = (text, type = "success") => {
    setMessage(text); setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  // ── Carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/schedules/instructor/${user.id}`)
      .then(r => r.json()).then(setSchedules);
    fetch(`${API_URL}/sports`).then(r => r.json()).then(setSports);
    fetch(`${API_URL}/locations/`).then(r => r.json()).then(setLocations);
    fetch(`${API_URL}/ratings/instructor/${user.id}`)
      .then(r => r.json()).then(data => setRatings(Array.isArray(data) ? data : []))
      .catch(() => setRatings([]));
    // Cargar perfil guardado si existe
    const perfilGuardado = localStorage.getItem(`perfil_instructor_${user.id}`);
    if (perfilGuardado) setPerfil(JSON.parse(perfilGuardado));
  }, [user.id]);

  // ── Seleccionar clase ──────────────────────────────────────────────────
  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setMessage("");
    fetch(`${API_URL}/schedules/${schedule.id}/students`)
      .then(r => r.json())
      .then(data => {
        setStudents(data);
        const initial = {};
        data.forEach(s => initial[s.reservation_id] = "present");
        setAttendance(initial);
      });
  };

  // ── Guardar asistencia ─────────────────────────────────────────────────
  const handleSaveAll = async () => {
    for (const student of students) {
      await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: student.reservation_id,
          status: attendance[student.reservation_id]
        }),
      });
    }
    showMsg("✅ Asistencia guardada para todos los estudiantes");
  };

  // ── Crear horario ──────────────────────────────────────────────────────
  const handleCreateSchedule = async () => {
    if (!newSchedule.sport_id || !newSchedule.day || !newSchedule.time || !newSchedule.capacity || !newSchedule.location_id) {
      showMsg("⚠️ Completa todos los campos", "error"); return;
    }
    const r = await fetch(`${API_URL}/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newSchedule,
        sport_id:      parseInt(newSchedule.sport_id),
        capacity:      parseInt(newSchedule.capacity),
        location_id:   parseInt(newSchedule.location_id),
        instructor_id: user.id,
      }),
    });
    const data = await r.json();
    showMsg(data.message || "✅ Horario creado");
    fetch(`${API_URL}/schedules/instructor/${user.id}`).then(r => r.json()).then(setSchedules);
    setNewSchedule({ sport_id: "", day: "", time: "", capacity: "", location_id: "" });
  };

  // ── Guardar perfil ─────────────────────────────────────────────────────
  const handleSavePerfil = () => {
    localStorage.setItem(`perfil_instructor_${user.id}`, JSON.stringify(perfil));
    setPerfilEdit(false);
    showMsg("✅ Perfil actualizado");
  };

  // ── Enviar notificación ────────────────────────────────────────────────
  const handleSendNotif = async () => {
    if (!selectedSchedule) { showMsg("⚠️ Selecciona una clase primero", "error"); return; }
    if (!notifMsg.trim()) { showMsg("⚠️ Escribe un mensaje", "error"); return; }
    for (const student of students) {
      await fetch(`${API_URL}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: student.id, message: notifMsg }),
      });
    }
    setNotifMsg("");
    showMsg(`✅ Notificación enviada a ${students.length} estudiantes`);
  };

  // ── Estadísticas ───────────────────────────────────────────────────────
  const totalEstudiantes = schedules.reduce((a, s) => a + (s.capacity || 0), 0);
  const promedioRating   = ratings.length
    ? (ratings.reduce((a, r) => a + (r.rating || 0), 0) / ratings.length).toFixed(1)
    : "—";

  // ── Estilos ────────────────────────────────────────────────────────────
  const selectStyle = {
    padding: "10px", background: "#1a3a4a",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px", color: "white", fontSize: "14px",
    width: "100%", marginBottom: "10px", boxSizing: "border-box", cursor: "pointer",
  };

  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return (
    <PageWrapper>
      <Navbar
        sections={[
          { id: "clases",      label: "🏋️ Mis Clases"     },
          { id: "asistencia",  label: "📊 Asistencia"      },
          { id: "horarios",    label: "📅 Mis Horarios"    },
          { id: "notificas",   label: "📣 Notificaciones"  },
          { id: "estadisticas",label: "📈 Estadísticas"    },
          { id: "perfil",      label: "👤 Mi Perfil"       },
        ]}
        activeSection={section}
        onSelect={setSection}
        userName={user?.nombre}
        role="Instructor"
      />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 24px" }}>
        <AlertMessage message={message} type={msgType} />

        {/* ── MIS CLASES ── */}
        {section === "clases" && (
          <>
            <SectionTitle>Mis Clases</SectionTitle>
            {schedules.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes clases asignadas.</p>
            ) : (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                {schedules.map(s => (
                  <button key={s.id} type="button" onClick={() => handleSelectSchedule(s)} style={{
                    padding: "12px 20px",
                    background: selectedSchedule?.id === s.id
                      ? "linear-gradient(135deg, #f7971e, #ffd200)"
                      : "rgba(255,255,255,0.08)",
                    color: selectedSchedule?.id === s.id ? "#000" : "white",
                    border: "none", borderRadius: "10px", cursor: "pointer",
                    fontWeight: "bold", fontSize: "13px"
                  }}>
                    🏅 {s.sport} — {s.day} {s.time}
                  </button>
                ))}
              </div>
            )}

            {selectedSchedule && (
              <>
                <SectionTitle>Estudiantes — {selectedSchedule.sport} {selectedSchedule.day}</SectionTitle>
                {students.length === 0 ? (
                  <p style={{ color: "#aaa" }}>No hay estudiantes inscritos.</p>
                ) : (
                  <>
                    {students.map(student => (
                      <Card key={student.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: "bold" }}>{student.nombre} {student.apellido}</p>
                          <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>{student.email}</p>
                        </div>
                        <select
                          value={attendance[student.reservation_id] || "present"}
                          onChange={(e) => setAttendance({ ...attendance, [student.reservation_id]: e.target.value })}
                          style={{
                            padding: "8px 12px", borderRadius: "8px", border: "none",
                            background: attendance[student.reservation_id] === "present" ? "#51cf66" : "#ff6b6b",
                            color: "white", fontWeight: "bold", cursor: "pointer"
                          }}
                        >
                          <option value="present">✅ Presente</option>
                          <option value="absent">❌ Ausente</option>
                        </select>
                      </Card>
                    ))}
                    <Button onClick={handleSaveAll} color="primary" width="100%">
                      GUARDAR ASISTENCIA →
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── ASISTENCIA ── */}
        {section === "asistencia" && (
          <>
            <SectionTitle>Resumen de Asistencia</SectionTitle>
            {schedules.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes clases asignadas.</p>
            ) : schedules.map(s => (
              <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>🏅 {s.sport}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>📅 {s.day} — {s.time}</p>
                </div>
                <span style={{ background: "rgba(81,207,102,0.15)", color: "#51cf66", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                  Cap: {s.capacity}
                </span>
              </Card>
            ))}
          </>
        )}

        {/* ── MIS HORARIOS ── */}
        {section === "horarios" && (
          <>
            <SectionTitle>Crear Nuevo Horario</SectionTitle>
            <Card>
              <select value={newSchedule.sport_id} onChange={e => setNewSchedule({ ...newSchedule, sport_id: e.target.value })} style={selectStyle}>
                <option value="" disabled>— Selecciona deporte —</option>
                {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={newSchedule.location_id} onChange={e => setNewSchedule({ ...newSchedule, location_id: e.target.value })} style={selectStyle}>
                <option value="" disabled>— Selecciona ubicación —</option>
                {locations.map(l => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
              </select>
              <select value={newSchedule.day} onChange={e => setNewSchedule({ ...newSchedule, day: e.target.value })} style={selectStyle}>
                <option value="" disabled>— Selecciona día —</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={newSchedule.time} onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })} style={selectStyle} />
              <Input placeholder="Capacidad máxima" type="number" value={newSchedule.capacity} onChange={e => setNewSchedule({ ...newSchedule, capacity: e.target.value })} />
              <Button onClick={handleCreateSchedule} color="primary" width="100%">+ CREAR HORARIO</Button>
            </Card>

            <SectionTitle>Mis Horarios Actuales</SectionTitle>
            {schedules.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes horarios asignados.</p>
            ) : schedules.map(s => (
              <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>📅 {s.sport} — {s.day} {s.time}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>Capacidad: {s.capacity}</p>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* ── NOTIFICACIONES ── */}
        {section === "notificas" && (
          <>
            <SectionTitle>📣 Enviar Notificación a Estudiantes</SectionTitle>
            <Card>
              <p style={{ color: "#aaa", fontSize: "13px", marginTop: 0 }}>
                Selecciona primero una clase en <strong style={{ color: "#ffd200" }}>Mis Clases</strong> y luego escribe el mensaje.
              </p>
              {selectedSchedule ? (
                <div style={{ background: "rgba(247,151,30,0.1)", border: "1px solid rgba(247,151,30,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#ffd200", fontWeight: "bold" }}>
                    📌 Clase seleccionada: {selectedSchedule.sport} — {selectedSchedule.day} {selectedSchedule.time}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa" }}>
                    {students.length} estudiante(s) recibirán la notificación
                  </p>
                </div>
              ) : (
                <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#ff6b6b" }}>
                    ⚠️ Ve a "Mis Clases" y selecciona una clase primero.
                  </p>
                </div>
              )}
              <textarea
                value={notifMsg}
                onChange={e => setNotifMsg(e.target.value)}
                placeholder="Escribe tu mensaje aquí... (ej: La clase de mañana se cancela)"
                rows={4}
                style={{
                  width: "100%", padding: "10px", background: "#1a3a4a",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
                  color: "white", fontSize: "14px", resize: "vertical",
                  boxSizing: "border-box", marginBottom: "10px", fontFamily: "inherit"
                }}
              />
              <Button onClick={handleSendNotif} color="primary" width="100%">
                📣 ENVIAR NOTIFICACIÓN
              </Button>
            </Card>
          </>
        )}

        {/* ── ESTADÍSTICAS ── */}
        {section === "estadisticas" && (
          <>
            <SectionTitle>📈 Mis Estadísticas</SectionTitle>

            {/* Tarjetas resumen */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: "Clases asignadas",   value: schedules.length,   color: "#ffd200", icon: "🏅" },
                { label: "Capacidad total",     value: totalEstudiantes,   color: "#51cf66", icon: "👥" },
                { label: "Calificación prom.",  value: promedioRating,     color: "#74c0fc", icon: "⭐" },
                { label: "Valoraciones",        value: ratings.length,     color: "#f783ac", icon: "📝" },
              ].map(m => (
                <Card key={m.label} style={{ textAlign: "center", padding: "16px" }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{m.icon}</div>
                  <div style={{ fontSize: "26px", fontWeight: "bold", color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>{m.label}</div>
                </Card>
              ))}
            </div>

            {/* Detalle clases */}
            <SectionTitle>Detalle por Clase</SectionTitle>
            {schedules.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes clases asignadas.</p>
            ) : schedules.map(s => (
              <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>🏅 {s.sport}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>📅 {s.day} — {s.time}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: "rgba(116,192,252,0.15)", color: "#74c0fc", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                    👥 {s.capacity} cupos
                  </span>
                </div>
              </Card>
            ))}

            {/* Calificaciones */}
            {ratings.length > 0 && (
              <>
                <SectionTitle>Últimas Calificaciones</SectionTitle>
                {ratings.slice(0, 5).map((r, i) => (
                  <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>{r.comment || "Sin comentario"}</p>
                    <span style={{ color: "#ffd200", fontWeight: "bold", fontSize: "16px" }}>
                      {"⭐".repeat(r.rating || 0)} {r.rating}/5
                    </span>
                  </Card>
                ))}
              </>
            )}
          </>
        )}

        {/* ── PERFIL ── */}
        {section === "perfil" && (
          <>
            <SectionTitle>👤 Mi Perfil</SectionTitle>
            <Card>
              {/* Avatar */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: perfil.foto
                    ? `url(${perfil.foto}) center/cover`
                    : "linear-gradient(135deg, #f7971e, #ffd200)",
                  margin: "0 auto 10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px", fontWeight: "bold", color: "#000"
                }}>
                  {!perfil.foto && (user?.nombre?.[0] || "I")}
                </div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>{perfil.nombre} {perfil.apellido}</p>
                <span style={{ fontSize: "12px", color: "#ffd200", background: "rgba(247,151,30,0.15)", padding: "2px 10px", borderRadius: "20px" }}>
                  Instructor
                </span>
              </div>

              {perfilEdit ? (
                <>
                  <Input placeholder="Nombre" value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} />
                  <Input placeholder="Apellido" value={perfil.apellido} onChange={e => setPerfil({ ...perfil, apellido: e.target.value })} />
                  <Input placeholder="Especialidad (ej: Natación, Fútbol...)" value={perfil.especialidad} onChange={e => setPerfil({ ...perfil, especialidad: e.target.value })} />
                  <Input placeholder="URL de foto de perfil (opcional)" value={perfil.foto} onChange={e => setPerfil({ ...perfil, foto: e.target.value })} />
                  <textarea
                    value={perfil.bio}
                    onChange={e => setPerfil({ ...perfil, bio: e.target.value })}
                    placeholder="Cuéntanos sobre ti..."
                    rows={3}
                    style={{
                      width: "100%", padding: "10px", background: "#1a3a4a",
                      border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
                      color: "white", fontSize: "14px", resize: "vertical",
                      boxSizing: "border-box", marginBottom: "10px", fontFamily: "inherit"
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button onClick={handleSavePerfil} color="primary" width="100%">💾 Guardar</Button>
                    <Button onClick={() => setPerfilEdit(false)} color="secondary" width="100%">Cancelar</Button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ margin: "0 0 6px", color: "#aaa", fontSize: "12px" }}>ESPECIALIDAD</p>
                    <p style={{ margin: 0, fontWeight: "bold" }}>{perfil.especialidad || "No especificada"}</p>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ margin: "0 0 6px", color: "#aaa", fontSize: "12px" }}>BIO</p>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{perfil.bio || "Sin descripción aún."}</p>
                  </div>
                  <Button onClick={() => setPerfilEdit(true)} color="primary" width="100%">✏️ Editar Perfil</Button>
                </>
              )}
            </Card>
          </>
        )}

        <LogoutButton />
      </div>
    </PageWrapper>
  );
}

export default Instructor;
