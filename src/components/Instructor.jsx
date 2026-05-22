import { useEffect, useState } from "react";
import PageWrapper from "./ui/PageWrapper";
import SectionTitle from "./ui/SectionTitle";
import Card from "./ui/Card";
import Button from "./ui/Button";
import AlertMessage from "./ui/AlertMessage";
import LogoutButton from "./ui/LogoutButton";
import SportButton from "./ui/SportButton";

function Instructor() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/schedules/instructor/${user.id}`)
      .then(r => r.json()).then(setSchedules);
  }, [user.id]);

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setMessage("");
    fetch(`http://127.0.0.1:8000/schedules/${schedule.id}/students`)
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
      await fetch("http://127.0.0.1:8000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: student.reservation_id, status: attendance[student.reservation_id] }),
      });
    }
    setMessage("Asistencia guardada para todos los estudiantes");
  };

  return (
    <PageWrapper>
      <h2 style={{ textAlign: "center", marginBottom: "8px" }}>🏋️ Panel del Instructor</h2>
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "30px" }}>Bienvenido, {user?.nombre}</p>

      <SectionTitle>Mis clases</SectionTitle>
      {schedules.length === 0 ? (
        <p style={{ color: "#aaa" }}>No tienes clases asignadas</p>
      ) : (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
          {schedules.map(schedule => (
            <SportButton
              key={schedule.id}
              sport={{ name: `${schedule.sport} — ${schedule.day} ${schedule.time}` }}
              isSelected={selectedSchedule?.id === schedule.id}
              onClick={() => handleSelectSchedule(schedule)}
            />
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
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: attendance[student.reservation_id] === "present" ? "#51cf66" : "#ff6b6b", color: "white", fontWeight: "bold", cursor: "pointer" }}
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

      <AlertMessage message={message} type="success" />
      <LogoutButton />
    </PageWrapper>
  );
}

export default Instructor;