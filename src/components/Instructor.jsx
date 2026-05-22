import { useEffect, useState } from "react";
import PageWrapper from "./ui/PageWrapper";
import SectionTitle from "./ui/SectionTitle";
import Card from "./ui/Card";
import Button from "./ui/Button";
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
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");

  const showMsg = (text, type = "success") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  useEffect(() => {
    fetch(`${API_URL}/schedules/instructor/${user.id}`)
      .then(r => r.json()).then(setSchedules);
  }, [user.id]);

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

  const handleSaveAll = async () => {
    for (const student of students) {
      await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: student.reservation_id, status: attendance[student.reservation_id] }),
      });
    }
    showMsg("Asistencia guardada para todos los estudiantes");
  };

  return (
    <PageWrapper>
      <Navbar
        sections={[
          { id: "clases", label: "🏋️ Mis Clases" },
          { id: "asistencia", label: "📊 Asistencia" },
        ]}
        activeSection={section}
        onSelect={setSection}
        userName={user?.nombre}
        role="Instructor"
      />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 24px" }}>
        <AlertMessage message={message} type={msgType} />

        {section === "clases" && (
          <>
            <SectionTitle>Mis Clases</SectionTitle>
            {schedules.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes clases asignadas</p>
            ) : (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                {schedules.map(schedule => (
                  <button
                    key={schedule.id}
                    type="button"
                    onClick={() => handleSelectSchedule(schedule)}
                    style={{
                      padding: "12px 20px",
                      background: selectedSchedule?.id === schedule.id
                        ? "linear-gradient(135deg, #f7971e, #ffd200)"
                        : "rgba(255,255,255,0.08)",
                      color: selectedSchedule?.id === schedule.id ? "#000" : "white",
                      border: "none", borderRadius: "10px", cursor: "pointer",
                      fontWeight: "bold", fontSize: "13px"
                    }}
                  >
                    🏅 {schedule.sport} — {schedule.day} {schedule.time}
                  </button>
                ))}
              </div>
            )}

            {selectedSchedule && (
              <>
                <SectionTitle>Estudiantes — {selectedSchedule.sport} {selectedSchedule.day}</SectionTitle>
                {students.length === 0 ? (
                  <p style={{ color: "#aaa" }}>No hay estudiantes inscritos</p>
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
            {schedules.length === 0 ? (
              <p style={{ color: "#aaa" }}>No tienes clases asignadas.</p>
            ) : (
              schedules.map(s => (
                <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: "bold" }}>🏅 {s.sport}</p>
                    <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>📅 {s.day} — {s.time}</p>
                  </div>
                </Card>
              ))
            )}
          </>
        )}

        <LogoutButton />
      </div>
    </PageWrapper>
  );
}

export default Instructor;
