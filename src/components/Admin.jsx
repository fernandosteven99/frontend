import { useEffect, useState } from "react";
import PageWrapper from "./ui/PageWrapper";
import SectionTitle from "./ui/SectionTitle";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import AlertMessage from "./ui/AlertMessage";
import LogoutButton from "./ui/LogoutButton";
import Header from "./ui/Header";
import Navbar from "./ui/Navbar";

// ── Helper: enviar notificación por correo al backend ──────────────────────
const notifyEmail = async (type, payload) => {
  try {
    await fetch("http://127.0.0.1:8000/email/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
    });
  } catch (e) {
    console.warn("[EMAIL] No se pudo enviar notificación:", e);
  }
};

// ── Estilos reutilizables ──────────────────────────────────────────────────
const selectStyle = {
  padding: "10px",
  background: "#1a3a4a",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "8px",
  color: "white",
  fontSize: "14px",
  width: "100%",
  marginBottom: "10px",
  boxSizing: "border-box",
  cursor: "pointer",
};

const selectActivo = (valor) => ({
  ...selectStyle,
  borderColor: valor ? "rgba(247,151,30,0.6)" : "rgba(255,255,255,0.15)",
});

// ══════════════════════════════════════════════════════════════════════════
function Admin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [section, setSection] = useState("usuarios");

  // Datos globales
  const [users, setUsers]           = useState([]);
  const [sports, setSports]         = useState([]);
  const [schedules, setSchedules]   = useState([]);
  const [locations, setLocations]   = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [roles, setRoles]           = useState([]);
  const [message, setMessage]       = useState("");
  const [msgType, setMsgType]       = useState("success");

  // Nuevos deportes / horarios
  const [newSport, setNewSport]     = useState("");
  const [newSchedule, setNewSchedule] = useState({
    sport_id: "", day: "", time: "", capacity: "", location_id: "", instructor_id: ""
  });

  // Reportes
  const [filtroDeporte, setFiltroDeporte]       = useState("");
  const [filtroInstructor, setFiltroInstructor] = useState("");
  const [filtroUbicacion, setFiltroUbicacion]   = useState("");
  const [filtroDia, setFiltroDia]               = useState("");
  const [reporteData, setReporteData]           = useState(null);
  const [errorFiltro, setErrorFiltro]           = useState("");

  // Power BI
  const [embedUrl, setEmbedUrl]           = useState("");
  const [activeEmbedUrl, setActiveEmbedUrl] = useState("");

  // ── Modal de correos ─────────────────────────────────────────────────────
  const [emailModal, setEmailModal] = useState(null);
  // emailModal = { type, payload, label, onConfirm }

  const openEmailModal = (label, type, payload, onConfirm) => {
    setEmailModal({ label, type, payload, onConfirm, emails: { admin: user?.email || "", profesor: "", estudiante: "" } });
  };
  const closeEmailModal = () => setEmailModal(null);

  const handleEmailModalConfirm = async () => {
    if (!emailModal) return;
    const destinos = [
      emailModal.emails.admin,
      emailModal.emails.profesor,
      emailModal.emails.estudiante,
    ].filter(e => e && e.trim() !== "");

    // Ejecutar la acción original
    await emailModal.onConfirm();

    // Enviar notificación a cada correo ingresado
    for (const correo of destinos) {
      await notifyEmail(emailModal.type, { ...emailModal.payload, admin_email: correo });
    }
    closeEmailModal();
  };

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("http://127.0.0.1:8000/users/").then(r => r.json()).then(setUsers);
    fetch("http://127.0.0.1:8000/sports").then(r => r.json()).then(setSports);
    fetch("http://127.0.0.1:8000/schedules").then(r => r.json()).then(setSchedules);
    fetch("http://127.0.0.1:8000/locations/").then(r => r.json()).then(setLocations);
    fetch("http://127.0.0.1:8000/roles/").then(r => r.json()).then(setRoles);
  }, []);

  useEffect(() => {
    setInstructors(users.filter(u => u.role_id === 3));
  }, [users]);

  const showMsg = (text, type = "success") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  // ── Usuarios ─────────────────────────────────────────────────────────────
  const updateRole = async (id, role_id) => {
    await fetch(`http://127.0.0.1:8000/users/${id}/role?role_id=${role_id}`, { method: "PUT" });
    const u = users.find(u => u.id === id);
    const rolAnterior = roles.find(r => r[0] === u?.role_id)?.[1] || "—";
    const rolNuevo    = roles.find(r => r[0] === parseInt(role_id))?.[1] || "—";
    setUsers(users.map(u => u.id === id ? { ...u, role_id: parseInt(role_id) } : u));
    showMsg("Rol actualizado");
    // Notificación correo
    await notifyEmail("role_updated", {
      admin_email:   user?.email,
      user_nombre:   `${u?.nombre} ${u?.apellido}`,
      user_email:    u?.email,
      rol_anterior:  rolAnterior,
      rol_nuevo:     rolNuevo,
    });
  };

  const deleteUser = (id) => {
    const u = users.find(usr => usr.id === id);
    openEmailModal(
      `Eliminar usuario: ${u?.nombre} ${u?.apellido}`,
      "user_deleted",
      { user_nombre: `${u?.nombre} ${u?.apellido}`, user_email: u?.email },
      async () => {
        await fetch(`http://127.0.0.1:8000/users/${id}`, { method: "DELETE" });
        setUsers(prev => prev.filter(usr => usr.id !== id));
        showMsg("Usuario eliminado");
      }
    );
  };

  // ── Deportes ─────────────────────────────────────────────────────────────
  const createSport = async () => {
    const r = await fetch("http://127.0.0.1:8000/sports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSport }),
    });
    const data = await r.json();
    showMsg(data.message);
    setNewSport("");
    fetch("http://127.0.0.1:8000/sports").then(r => r.json()).then(setSports);
  };

  const deleteSport = (id) => {
    const sport = sports.find(s => s.id === id);
    openEmailModal(
      `Eliminar deporte: ${sport?.name}`,
      "sport_deleted",
      { sport_name: sport?.name || "—" },
      async () => {
        await fetch(`http://127.0.0.1:8000/sports/${id}`, { method: "DELETE" });
        setSports(prev => prev.filter(s => s.id !== id));
        showMsg("Deporte eliminado");
      }
    );
  };

  // ── Horarios ─────────────────────────────────────────────────────────────
  const createSchedule = async () => {
    const r = await fetch("http://127.0.0.1:8000/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newSchedule,
        sport_id:      parseInt(newSchedule.sport_id),
        capacity:      parseInt(newSchedule.capacity),
        location_id:   parseInt(newSchedule.location_id),
        instructor_id: parseInt(newSchedule.instructor_id),
      }),
    });
    const data = await r.json();
    showMsg(data.message);
    fetch("http://127.0.0.1:8000/schedules").then(r => r.json()).then(setSchedules);
  };

  const deleteSchedule = (id) => {
    const s   = schedules.find(sc => sc.id === id);
    const loc = locations.find(l => l[0] === s?.location_id);
    openEmailModal(
      `Eliminar horario: ${s?.sport} — ${s?.day} ${s?.time}`,
      "schedule_deleted",
      { sport: s?.sport || "—", day: s?.day || "—", time: s?.time || "—", location: loc ? loc[1] : "—" },
      async () => {
        await fetch(`http://127.0.0.1:8000/schedules/${id}`, { method: "DELETE" });
        setSchedules(prev => prev.filter(sc => sc.id !== id));
        showMsg("Horario eliminado");
      }
    );
  };

  // ── Reportes ─────────────────────────────────────────────────────────────
  const buscarReporte = () => {
    if (!filtroDeporte && !filtroInstructor && !filtroUbicacion && !filtroDia) {
      setErrorFiltro("⚠️ Selecciona al menos un filtro para buscar.");
      return;
    }
    setErrorFiltro("");
    let resultado = schedules.map(s => {
      const sport = sports.find(sp => sp.id === s.sport_id || sp.name === s.sport);
      const inst  = instructors.find(i => i.id === s.instructor_id);
      const loc   = locations.find(l => l[0] === s.location_id);
      return {
        ...s,
        sportName:      sport?.name || s.sport || "—",
        instructorName: inst  ? `${inst.nombre} ${inst.apellido}` : `ID ${s.instructor_id}`,
        locationName:   loc   ? loc[1] : "—",
      };
    });
    if (filtroDeporte)    resultado = resultado.filter(r => r.sportName === filtroDeporte);
    if (filtroInstructor) resultado = resultado.filter(r => r.instructor_id === parseInt(filtroInstructor));
    if (filtroUbicacion)  resultado = resultado.filter(r => r.locationName === filtroUbicacion);
    if (filtroDia)        resultado = resultado.filter(r => r.day?.toLowerCase() === filtroDia.toLowerCase());
    setReporteData(resultado);

    const filtrosObj = {
      Deporte:    filtroDeporte    || null,
      Instructor: filtroInstructor ? instructors.find(i => i.id === parseInt(filtroInstructor))?.nombre : null,
      Ubicación:  filtroUbicacion  || null,
      Día:        filtroDia        || null,
    };

    // Abrir modal para confirmar destinatarios antes de enviar correo
    openEmailModal(
      "Reporte generado",
      "report_generated",
      { admin_nombre: user?.nombre, total_registros: resultado.length, filtros: filtrosObj },
      async () => {} // acción vacía, el correo lo envía handleEmailModalConfirm
    );
  };

  const limpiarReporte = () => {
    setFiltroDeporte(""); setFiltroInstructor("");
    setFiltroUbicacion(""); setFiltroDia("");
    setReporteData(null); setErrorFiltro("");
  };

  const exportarPDF = () => {
    if (!reporteData?.length) return;
    if (window.jspdf?.jsPDF) { generarPDF(); return; }
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      s2.onload = () => generarPDF();
      document.body.appendChild(s2);
    };
    document.body.appendChild(s1);
  };

  const generarPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc   = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const now   = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });

    const drawHeader = () => {
      doc.setFillColor(15, 32, 39);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setFillColor(247, 151, 30);
      doc.rect(0, 27, pageW, 3, "F");
      doc.setTextColor(255, 210, 0);
      doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text("SISTEMA DE GESTIÓN DEPORTIVA", pageW / 2, 11, { align: "center" });
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text("Reporte de Horarios y Actividades", pageW / 2, 18, { align: "center" });
      doc.setFontSize(8);
      doc.text(`Generado: ${now}  |  Admin: ${user?.nombre || "—"}`, pageW / 2, 24, { align: "center" });
    };

    const drawFooter = (pageNum, totalPages) => {
      doc.setFillColor(15, 32, 39);
      doc.rect(0, pageH - 15, pageW, 15, "F");
      doc.setFillColor(247, 151, 30);
      doc.rect(0, pageH - 15, pageW, 2, "F");
      doc.setTextColor(180, 180, 180); doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.text("Sistema Deportivo — Documento confidencial. Solo para uso administrativo.", 14, pageH - 5);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageW - 14, pageH - 5, { align: "right" });
    };

    const filtrosTexto = [
      filtroDeporte    ? `Deporte: ${filtroDeporte}` : null,
      filtroInstructor ? `Instructor: ${instructors.find(i => i.id === parseInt(filtroInstructor))?.nombre || filtroInstructor}` : null,
      filtroUbicacion  ? `Ubicación: ${filtroUbicacion}` : null,
      filtroDia        ? `Día: ${filtroDia}` : null,
    ].filter(Boolean);

    drawHeader();
    let y = 36;

    // Bloque filtros
    doc.setFillColor(32, 58, 67);
    doc.roundedRect(10, y, pageW - 20, 16, 2, 2, "F");
    doc.setTextColor(247, 151, 30); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("FILTROS APLICADOS:", 16, y + 6);
    doc.setFont("helvetica", "normal"); doc.setTextColor(220, 220, 220);
    doc.text(filtrosTexto.length > 0 ? filtrosTexto.join("   |   ") : "Sin filtros", 16, y + 12);

    // Tarjetas estadísticas
    y += 22;
    const totalCap   = reporteData.reduce((a, r) => a + (parseInt(r.capacity) || 0), 0);
    const depUnicos  = [...new Set(reporteData.map(r => r.sportName))].length;
    const instUnicos = [...new Set(reporteData.map(r => r.instructor_id))].length;
    const statsCards = [
      { label: "Total Horarios",  value: reporteData.length, color: [44, 83, 100] },
      { label: "Capacidad Total", value: totalCap,            color: [44, 83, 60]  },
      { label: "Deportes únicos", value: depUnicos,           color: [83, 74, 183] },
      { label: "Instructores",    value: instUnicos,          color: [80, 40, 40]  },
    ];
    const cw = (pageW - 28) / 4;
    statsCards.forEach((c, i) => {
      const cx = 10 + i * (cw + 2.5);
      doc.setFillColor(...c.color);
      doc.roundedRect(cx, y, cw, 18, 2, 2, "F");
      doc.setTextColor(255, 210, 0); doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text(String(c.value), cx + cw / 2, y + 10, { align: "center" });
      doc.setTextColor(200, 200, 200); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
      doc.text(c.label, cx + cw / 2, y + 16, { align: "center" });
    });

    // Tabla
    doc.autoTable({
      startY: y + 24,
      head: [["#", "Deporte", "Instructor", "Ubicación", "Día", "Hora", "Capacidad"]],
      body: reporteData.map((r, i) => [i + 1, r.sportName, r.instructorName, r.locationName, r.day || "—", r.time || "—", r.capacity || "—"]),
      theme: "grid",
      headStyles: { fillColor: [15, 32, 39], textColor: [247, 210, 0], fontStyle: "bold", fontSize: 9, halign: "center" },
      alternateRowStyles: { fillColor: [240, 245, 248] },
      rowStyles: { fontSize: 8.5, valign: "middle" },
      columnStyles: { 0: { halign: "center", cellWidth: 10 }, 5: { halign: "center" }, 6: { halign: "center" } },
      margin: { left: 10, right: 10, bottom: 18 },
      didDrawPage: (data) => { drawHeader(); drawFooter(data.pageNumber, doc.internal.getNumberOfPages()); },
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) { doc.setPage(p); drawFooter(p, totalPages); }
    doc.save(`reporte_horarios_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const sections = ["usuarios", "deportes", "horarios", "reportes", "dashboard"];

  return (
<PageWrapper>
      <Navbar
        sections={[
          { id: "usuarios", label: "👥 Usuarios" },
          { id: "deportes", label: "🏅 Deportes" },
          { id: "horarios", label: "📅 Horarios" },
          { id: "reportes", label: "📊 Reportes" },
          { id: "dashboard", label: "📈 Dashboard" },
        ]}
        activeSection={section}
        onSelect={setSection}
        userName={user?.nombre}
        role="Admin"
      />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 24px" }}>

      <AlertMessage message={message} type={msgType} />

      {/* ── USUARIOS ── */}
      {section === "usuarios" && (
        <>
          <SectionTitle>Gestión de Usuarios</SectionTitle>
          {users.map(u => (
            <Card key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>{u.nombre} {u.apellido}</p>
                <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>{u.email}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select value={u.role_id} onChange={(e) => updateRole(u.id, e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: "8px", border: "none", background: "#1a3a4a", color: "white", cursor: "pointer" }}>
                  {roles.map(r => <option key={r[0]} value={r[0]}>{r[1]}</option>)}
                </select>
                <Button onClick={() => deleteUser(u.id)} color="danger">🗑</Button>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* ── DEPORTES ── */}
      {section === "deportes" && (
        <>
          <SectionTitle>Gestión de Deportes</SectionTitle>
          <div style={{ marginBottom: "20px" }}>
            <Input placeholder="Nombre del deporte" value={newSport} onChange={(e) => setNewSport(e.target.value)} />
            <Button onClick={createSport} color="primary" width="100%">+ AGREGAR DEPORTE</Button>
          </div>
          {sports.map(s => (
            <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>🏅 {s.name}</p>
              <Button onClick={() => deleteSport(s.id)} color="danger">🗑</Button>
            </Card>
          ))}
        </>
      )}

      {/* ── HORARIOS ── */}
      {section === "horarios" && (
        <>
          <SectionTitle>Gestión de Horarios</SectionTitle>
          <div style={{ marginBottom: "20px" }}>
            <select value={newSchedule.sport_id} onChange={e => setNewSchedule({ ...newSchedule, sport_id: e.target.value })} style={selectStyle}>
              <option value="">Selecciona deporte</option>
              {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {/* FIX UBICACIONES: usa l[0] como key/value y l[1] como label */}
            <select value={newSchedule.location_id} onChange={e => setNewSchedule({ ...newSchedule, location_id: e.target.value })} style={selectStyle}>
              <option value="">Selecciona ubicación</option>
              {locations.map(l => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
            </select>

            <select value={newSchedule.instructor_id} onChange={e => setNewSchedule({ ...newSchedule, instructor_id: e.target.value })} style={selectStyle}>
              <option value="">Selecciona instructor</option>
              {instructors.map(i => <option key={i.id} value={i.id}>{i.nombre} {i.apellido}</option>)}
            </select>

            <Input placeholder="Día (ej: Lunes)" value={newSchedule.day} onChange={e => setNewSchedule({ ...newSchedule, day: e.target.value })} />
            <input type="time" value={newSchedule.time} onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })} style={selectStyle} />
            <Input placeholder="Capacidad" type="number" value={newSchedule.capacity} onChange={e => setNewSchedule({ ...newSchedule, capacity: e.target.value })} />
            <Button onClick={createSchedule} color="primary" width="100%">+ AGREGAR HORARIO</Button>
          </div>

          {schedules.map(s => {
            // Resolver nombre de ubicación para mostrar en la lista
            const loc = locations.find(l => l[0] === s.location_id);
            const locNombre = loc ? loc[1] : s.location_id ? `ID ${s.location_id}` : "—";
            return (
              <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>📅 {s.sport} — {s.day} {s.time}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>
                    Capacidad: {s.capacity} | 📍 {locNombre}
                  </p>
                </div>
                <Button onClick={() => deleteSchedule(s.id)} color="danger">🗑</Button>
              </Card>
            );
          })}
        </>
      )}

      {/* ── REPORTES ── */}
      {section === "reportes" && (
        <>
          <SectionTitle>📊 Módulo de Reportes</SectionTitle>
          <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "16px", marginTop: 0 }}>
            Selecciona los filtros y genera el reporte en PDF. Se enviará una notificación por correo al generarlo.
          </p>

          {/* Filtros */}
          <Card style={{ marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

              <div>
                <label style={{ fontSize: "12px", color: "#ffd200", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  🏅 Deporte
                  {filtroDeporte && <span style={{ fontSize: "10px", background: "rgba(247,151,30,0.2)", color: "#f7971e", padding: "1px 7px", borderRadius: "20px" }}>✓</span>}
                </label>
                <select value={filtroDeporte} onChange={e => setFiltroDeporte(e.target.value)} style={selectActivo(filtroDeporte)}>
                  <option value="" disabled>— Elige un deporte —</option>
                  {sports.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#ffd200", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  🧑‍🏫 Instructor
                  {filtroInstructor && <span style={{ fontSize: "10px", background: "rgba(247,151,30,0.2)", color: "#f7971e", padding: "1px 7px", borderRadius: "20px" }}>✓</span>}
                </label>
                <select value={filtroInstructor} onChange={e => setFiltroInstructor(e.target.value)} style={selectActivo(filtroInstructor)}>
                  <option value="" disabled>— Elige un instructor —</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.nombre} {i.apellido}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#ffd200", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  📍 Ubicación
                  {filtroUbicacion && <span style={{ fontSize: "10px", background: "rgba(247,151,30,0.2)", color: "#f7971e", padding: "1px 7px", borderRadius: "20px" }}>✓</span>}
                </label>
                <select value={filtroUbicacion} onChange={e => setFiltroUbicacion(e.target.value)} style={selectActivo(filtroUbicacion)}>
                  <option value="" disabled>— Elige una ubicación —</option>
                  {locations.map(l => <option key={l[0]} value={l[1]}>{l[1]}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#ffd200", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  📅 Día
                  {filtroDia && <span style={{ fontSize: "10px", background: "rgba(247,151,30,0.2)", color: "#f7971e", padding: "1px 7px", borderRadius: "20px" }}>✓</span>}
                </label>
                <select value={filtroDia} onChange={e => setFiltroDia(e.target.value)} style={selectActivo(filtroDia)}>
                  <option value="" disabled>— Elige un día —</option>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {errorFiltro && <p style={{ color: "#ff6b6b", fontSize: "13px", marginTop: "12px", marginBottom: 0 }}>{errorFiltro}</p>}

            <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
              <Button onClick={buscarReporte} color="primary">🔍 Buscar</Button>
              <Button onClick={limpiarReporte} color="secondary">✕ Limpiar</Button>
              {reporteData?.length > 0 && (
                <Button onClick={exportarPDF} color="danger">📄 Exportar PDF</Button>
              )}
            </div>
          </Card>

          {/* Estado vacío */}
          {reporteData === null && !errorFiltro && (
            <p style={{ textAlign: "center", color: "#555", padding: "24px 0", fontSize: "14px" }}>
              Selecciona al menos un filtro y presiona <strong style={{ color: "#ffd200" }}>Buscar</strong>.
            </p>
          )}
          {reporteData !== null && reporteData.length === 0 && (
            <p style={{ textAlign: "center", color: "#ff6b6b", padding: "20px 0", fontSize: "14px" }}>
              ⚠️ No se encontraron resultados con los filtros seleccionados.
            </p>
          )}

          {/* Resultados */}
          {reporteData?.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "10px", marginBottom: "16px" }}>
                {[
                  { label: "Horarios",    value: reporteData.length,                                                              color: "#ffd200" },
                  { label: "Capacidad",   value: reporteData.reduce((a, r) => a + (parseInt(r.capacity) || 0), 0),                color: "#51cf66" },
                  { label: "Deportes",    value: [...new Set(reporteData.map(r => r.sportName))].length,                          color: "#74c0fc" },
                  { label: "Instructores",value: [...new Set(reporteData.map(r => r.instructor_id))].length,                      color: "#f783ac" },
                ].map(m => (
                  <Card key={m.label} style={{ textAlign: "center", padding: "14px" }}>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>{m.label}</div>
                  </Card>
                ))}
              </div>

              <div style={{ overflowX: "auto", marginBottom: "30px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "rgba(247,151,30,0.15)", borderBottom: "2px solid rgba(247,151,30,0.4)" }}>
                      {["#", "Deporte", "Instructor", "Ubicación", "Día", "Hora", "Capacidad"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#ffd200", fontWeight: "bold", fontSize: "12px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reporteData.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: "10px 12px", color: "#666", fontSize: "12px" }}>{i + 1}</td>
                        <td style={{ padding: "10px 12px", fontWeight: "bold" }}>{r.sportName}</td>
                        <td style={{ padding: "10px 12px" }}>{r.instructorName}</td>
                        <td style={{ padding: "10px 12px", color: "#aaa" }}>{r.locationName}</td>
                        <td style={{ padding: "10px 12px" }}>{r.day || "—"}</td>
                        <td style={{ padding: "10px 12px" }}>{r.time || "—"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span style={{ background: "rgba(81,207,102,0.15)", color: "#51cf66", padding: "2px 10px", borderRadius: "20px", fontSize: "12px" }}>{r.capacity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </>
      )}

      {/* ── DASHBOARD ── */}
      {section === "dashboard" && (
        <>
          <SectionTitle>📈 Dashboard Power BI</SectionTitle>
          <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "14px", marginTop: 0 }}>
            Pega el enlace <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 7px", borderRadius: "4px", fontSize: "12px" }}>&lt;iframe&gt;</code> embed de Power BI para visualizar el tablero.
          </p>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="8" fill="#F2C811"/>
                  <rect x="8" y="22" width="6" height="12" rx="1.5" fill="#1F1F1F"/>
                  <rect x="17" y="14" width="6" height="20" rx="1.5" fill="#1F1F1F"/>
                  <rect x="26" y="8" width="6" height="26" rx="1.5" fill="#1F1F1F"/>
                </svg>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>Reporte Power BI</span>
              </div>
              <span style={{
                fontSize: "11px", padding: "3px 12px", borderRadius: "20px", fontWeight: "bold",
                background: activeEmbedUrl ? "rgba(81,207,102,0.15)" : "rgba(255,255,255,0.07)",
                color: activeEmbedUrl ? "#51cf66" : "#666",
              }}>
                {activeEmbedUrl ? "● Activo" : "○ Sin reporte"}
              </span>
            </div>

            {activeEmbedUrl ? (
              <iframe src={activeEmbedUrl} title="Power BI Dashboard" allowFullScreen
                style={{ width: "100%", height: "600px", border: "none", display: "block" }} />
            ) : (
              <div style={{ height: "240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "rgba(0,0,0,0.1)" }}>
                <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{ opacity: 0.3 }}>
                  <rect width="40" height="40" rx="8" fill="#F2C811"/>
                  <rect x="8" y="22" width="6" height="12" rx="1.5" fill="#1F1F1F"/>
                  <rect x="17" y="14" width="6" height="20" rx="1.5" fill="#1F1F1F"/>
                  <rect x="26" y="8" width="6" height="26" rx="1.5" fill="#1F1F1F"/>
                </svg>
                <p style={{ color: "#555", fontSize: "13px", textAlign: "center", maxWidth: "300px", lineHeight: 1.6, margin: 0 }}>
                  Ingresa la URL embed de tu tablero Power BI para visualizarlo aquí.<br/>
                  <span style={{ fontSize: "11px", color: "#444" }}>Debe incluir 4 indicadores, 6 gráficos (3 circulares + 3 barras) y 2 filtros.</span>
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.15)" }}>
              <span style={{ fontSize: "12px", color: "#888", whiteSpace: "nowrap" }}>URL embed:</span>
              <input type="text" value={embedUrl} onChange={e => setEmbedUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setActiveEmbedUrl(embedUrl.trim())}
                placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
                style={{ ...selectStyle, marginBottom: 0, fontSize: "12px", fontFamily: "monospace", flex: 1 }} />
              <Button onClick={() => setActiveEmbedUrl(embedUrl.trim())} color="primary">Cargar</Button>
              {activeEmbedUrl && (
                <Button onClick={() => { setActiveEmbedUrl(""); setEmbedUrl(""); }} color="danger">✕</Button>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ── MODAL DE CORREOS ── */}
      {emailModal && (() => {
       const admins      = users.filter(u => u.role_id === 2);
        const profesores  = users.filter(u => u.role_id === 3);
        const estudiantes = users.filter(u => u.role_id === 1);
        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
          }}>
            <div style={{
              background: "#0f2027", border: "1px solid rgba(247,151,30,0.3)",
              borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "460px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px" }}>✉️</span>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#ffd200" }}>Notificar por correo</h3>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#aaa", paddingLeft: "32px" }}>
                {emailModal.label}
              </p>
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#666" }}>
                Selecciona quiénes deben recibir la notificación. Deja en "Sin notificar" los que no apliquen.
              </p>

              {/* Admin */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11px", color: "#f7971e", display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  ⚙️ Admin
                </label>
                <select
                  value={emailModal.emails.admin}
                  onChange={e => setEmailModal(m => ({ ...m, emails: { ...m.emails, admin: e.target.value } }))}
                  style={{ ...selectStyle, marginBottom: 0 }}
                >
                  <option value="">— Sin notificar —</option>
                  {admins.length > 0
                    ? admins.map(u => <option key={u.id} value={u.email}>{u.nombre} {u.apellido} — {u.email}</option>)
                    : user?.email && <option value={user.email}>{user.nombre} (tú) — {user.email}</option>
                  }
                </select>
              </div>

              {/* Profesor */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11px", color: "#74c0fc", display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  🧑‍🏫 Profesor / Instructor
                </label>
                <select
                  value={emailModal.emails.profesor}
                  onChange={e => setEmailModal(m => ({ ...m, emails: { ...m.emails, profesor: e.target.value } }))}
                  style={{ ...selectStyle, marginBottom: 0 }}
                >
                  <option value="">— Sin notificar —</option>
                  {profesores.map(u => <option key={u.id} value={u.email}>{u.nombre} {u.apellido} — {u.email}</option>)}
                </select>
              </div>

              {/* Estudiante */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "11px", color: "#51cf66", display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  🎓 Estudiante / Usuario
                </label>
                <select
                  value={emailModal.emails.estudiante}
                  onChange={e => setEmailModal(m => ({ ...m, emails: { ...m.emails, estudiante: e.target.value } }))}
                  style={{ ...selectStyle, marginBottom: 0 }}
                >
                  <option value="">— Sin notificar —</option>
                  {estudiantes.map(u => <option key={u.id} value={u.email}>{u.nombre} {u.apellido} — {u.email}</option>)}
                </select>
              </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button onClick={closeEmailModal} color="secondary" width="100%">Cancelar</Button>
              <Button onClick={async () => { await emailModal.onConfirm(); closeEmailModal(); }} color="secondary" width="100%">Sin notificar</Button>
              <Button onClick={handleEmailModalConfirm} color="primary" width="100%">✉️ Confirmar y enviar</Button>
              </div>
            </div>
          </div>
        );
      })()}

      <LogoutButton />
       </div>
    </PageWrapper>
  );
}

export default Admin;