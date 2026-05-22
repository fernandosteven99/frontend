import { useEffect, useState } from "react";
import PageWrapper from "./ui/PageWrapper";
import SectionTitle from "./ui/SectionTitle";
import SportButton from "./ui/SportButton";
import Card from "./ui/Card";
import Button from "./ui/Button";
import AlertMessage from "./ui/AlertMessage";
import LogoutButton from "./ui/LogoutButton";

const API_URL = "https://backend-6jy7.onrender.com";

function Sports() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [sports, setSports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/sports`).then(r => r.json()).then(setSports);
  }, []);

  const handleSelectSport = (sport) => {
    setSelectedSport(sport);
    setMessage("");
    fetch(`${API_URL}/sports/${sport.id}/schedules`).then(r => r.json()).then(setSchedules);
  };

  const handleReserve = async (schedule_id) => {
    const response = await fetch(`${API_URL}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, schedule_id }),
    });
    const data = await response.json();
    setMessage(data.message || data.error);
  };

  return (
    <PageWrapper>
      <h2 style={{ textAlign: "center", marginBottom: "8px" }}>🏅 Deportes Disponibles</h2>
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "30px" }}>Bienvenido, {user?.nombre}</p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
        {sports.map(sport => (
          <SportButton key={sport.id} sport={sport} isSelected={selectedSport?.id === sport.id} onClick={() => handleSelectSport(sport)} />
        ))}
      </div>

      {selectedSport && (
        <>
          <SectionTitle>Horarios de {selectedSport.name}</SectionTitle>
          {schedules.length === 0 ? (
            <p style={{ color: "#aaa" }}>No hay horarios disponibles</p>
          ) : (
            schedules.map(schedule => (
              <Card key={schedule.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>📅 {schedule.day} — {schedule.time}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>Cupos: {schedule.capacity}</p>
                </div>
                <Button onClick={() => handleReserve(schedule.id)} disabled={schedule.capacity <= 0}>
                  {schedule.capacity > 0 ? "Inscribirse" : "Sin cupos"}
                </Button>
              </Card>
            ))
          )}
        </>
      )}

      <AlertMessage message={message} type="success" />
      <LogoutButton />
    </PageWrapper>
  );
}

export default Sports;
