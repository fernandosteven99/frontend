import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageWrapper from "./ui/PageWrapper";
import SectionTitle from "./ui/SectionTitle";
import Button from "./ui/Button";
import AlertMessage from "./ui/AlertMessage";
import LogoutButton from "./ui/LogoutButton";

function Report() {
  const [sports, setSports] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({ sport_id: "", day: "", role_id: "" });
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/sports").then(r => r.json()).then(setSports);
    fetch("http://127.0.0.1:8000/roles/").then(r => r.json()).then(setRoles);
  }, []);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (filters.sport_id) params.append("sport_id", filters.sport_id);
    if (filters.day) params.append("day", filters.day);
    if (filters.role_id) params.append("role_id", filters.role_id);

    const response = await fetch(`http://127.0.0.1:8000/reports/inscriptions?${params}`);
    const data = await response.json();
    setResults(data);
    if (data.length === 0) setMessage("No se encontraron resultados");
    else setMessage("");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Encabezado
    doc.setFillColor(15, 32, 39);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 210, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Sistema de Inscripcion a Deportes", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Reporte generado: ${date}`, 14, 23);

    // Filtros aplicados
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Filtros aplicados:", 14, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const sportName = sports.find(s => s.id === parseInt(filters.sport_id))?.name || "Todos";
    const roleName = roles.find(r => r[0] === parseInt(filters.role_id))?.[1] || "Todos";
    doc.text(`Deporte: ${sportName}`, 14, 48);
    doc.text(`Día: ${filters.day || "Todos"}`, 14, 55);
    doc.text(`Rol: ${roleName}`, 14, 62);

    // Estadísticas
    doc.setFillColor(44, 83, 100);
    doc.rect(0, 68, 210, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Total de inscripciones: ${results.length}`, 14, 76);

    // Tabla
    autoTable(doc, {
      startY: 85,
      head: [["Nombre", "Apellido", "Email", "Deporte", "Día", "Hora", "Rol"]],
      body: results.map(r => [r.nombre, r.apellido, r.email, r.sport, r.day, r.time, r.role]),
      headStyles: { fillColor: [15, 32, 39], textColor: [255, 210, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 32, 39);
      doc.rect(0, 282, 210, 15, "F");
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8);
      doc.text("Sistema de Inscripcion a Deportes", 14, 290);
      doc.text(`Pagina ${i} de ${pageCount}`, 180, 290);
    }

    doc.save(`reporte_inscripciones_${date}.pdf`);
  };

  const selectStyle = {
    padding: "10px",
    background: "#1a3a4a",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    width: "100%",
    marginBottom: "10px",
    boxSizing: "border-box"
  };

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return (
    <PageWrapper maxWidth="800px">
      <h2 style={{ textAlign: "center", marginBottom: "8px" }}>📊 Módulo de Reportes</h2>
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "30px" }}>Genera reportes de inscripciones</p>

      <SectionTitle>Filtros de búsqueda</SectionTitle>

      <select value={filters.sport_id} onChange={e => setFilters({ ...filters, sport_id: e.target.value })} style={selectStyle}>
        <option value="">🏅 Todos los deportes</option>
        {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <select value={filters.day} onChange={e => setFilters({ ...filters, day: e.target.value })} style={selectStyle}>
        <option value="">📅 Todos los días</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <select value={filters.role_id} onChange={e => setFilters({ ...filters, role_id: e.target.value })} style={selectStyle}>
        <option value="">👥 Todos los roles</option>
        {roles.map(r => <option key={r[0]} value={r[0]}>{r[1]}</option>)}
      </select>

      <Button onClick={handleSearch} color="primary" width="100%">🔍 BUSCAR</Button>

      <AlertMessage message={message} type="info" />

      {results.length > 0 && (
        <>
          <SectionTitle>Resultados ({results.length})</SectionTitle>
          {results.map((r, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "8px"
            }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>{r.nombre} {r.apellido}</p>
              <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>{r.email} — {r.sport} — {r.day} {r.time} — {r.role}</p>
            </div>
          ))}
          <div style={{ marginTop: "20px" }}>
            <Button onClick={generatePDF} color="primary" width="100%">📄 DESCARGAR PDF</Button>
          </div>
        </>
      )}

      <LogoutButton />
    </PageWrapper>
  );
}

export default Report;