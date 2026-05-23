import { useEffect, useState } from "react";
import PageWrapper from "./ui/PageWrapper";
import SectionTitle from "./ui/SectionTitle";
import Card from "./ui/Card";
import Button from "./ui/Button";
import AlertMessage from "./ui/AlertMessage";
import LogoutButton from "./ui/LogoutButton";

function Messages() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [inbox, setInbox] = useState([]);
  const [alert, setAlert] = useState("");
  const [section, setSection] = useState("inbox");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/users/").then(r => r.json()).then(setUsers);
    fetch(`http://127.0.0.1:8000/notifications/user/${user.id}`).then(r => r.json()).then(setInbox);
  }, [user.id]);

  const filteredUsers = users.filter(u =>
    u.id !== user.id &&
    (u.nombre.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) return;
    const r = await fetch("http://127.0.0.1:8000/notifications/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUser.id, sender_id: user.id, message })
    });
    const data = await r.json();
    setAlert(data.message);
    setMessage("");
    setSelectedUser(null);
    setTimeout(() => setAlert(""), 3000);
  };

  const markSeen = async (id) => {
    await fetch(`http://127.0.0.1:8000/notifications/${id}/seen`, { method: "PUT" });
    setInbox(inbox.map(n => n.id === id ? { ...n, seen: true } : n));
  };

  const roleColors = {
    Admin: { bg: "#ebf8ff", color: "#2b6cb0" },
    Instructor: { bg: "#f0fff4", color: "#276749" },
    Student: { bg: "#fff5f5", color: "#c53030" },
  };

  return (
    <PageWrapper maxWidth="800px">
      <div style={{ padding: "20px" }}>
        <SectionTitle>💬 Mensajes</SectionTitle>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Button onClick={() => setSection("inbox")} color={section === "inbox" ? "primary" : "secondary"}>
            📥 Bandeja ({inbox.filter(n => !n.seen).length})
          </Button>
          <Button onClick={() => setSection("send")} color={section === "send" ? "primary" : "secondary"}>
            ✉️ Enviar mensaje
          </Button>
        </div>

        <AlertMessage message={alert} type="success" />

        {section === "inbox" && (
          <>
            <SectionTitle>Mensajes recibidos</SectionTitle>
            {inbox.length === 0 ? (
              <p style={{ color: "#718096" }}>No tienes mensajes.</p>
            ) : (
              inbox.map(n => (
                <Card key={n.id} style={{
                  borderLeft: `4px solid ${n.seen ? "#e2e8f0" : "#1e3a5f"}`,
                  background: n.seen ? "white" : "#ebf8ff"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#1a202c" }}>
                        {n.sender || "Sistema"}
                      </p>
                      <p style={{ margin: "0 0 8px", color: "#4a5568", fontSize: "14px" }}>{n.message}</p>
                      <p style={{ margin: 0, color: "#a0aec0", fontSize: "12px" }}>{n.created_at}</p>
                    </div>
                    {!n.seen && (
                      <Button onClick={() => markSeen(n.id)} color="secondary">
                        ✓ Marcar leído
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </>
        )}

        {section === "send" && (
          <>
            <SectionTitle>Enviar mensaje</SectionTitle>
            <input
              type="text"
              placeholder="🔍 Buscar usuario..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #cbd5e0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
                marginBottom: "12px"
              }}
            />

            {search && (
              <div style={{ marginBottom: "16px", maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => { setSelectedUser(u); setSearch(""); }}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      borderBottom: "1px solid #f7fafc",
                      background: selectedUser?.id === u.id ? "#ebf8ff" : "white"
                    }}
                  >
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "#1e3a5f", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "700", fontSize: "14px"
                    }}>
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: "600", color: "#1a202c" }}>{u.nombre} {u.apellido}</p>
                      <span style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
                        background: roleColors[u.role]?.bg || "#f7fafc",
                        color: roleColors[u.role]?.color || "#718096"
                      }}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <Card style={{ marginBottom: "16px", background: "#ebf8ff", border: "1px solid #bee3f8" }}>
                <p style={{ margin: 0, fontWeight: "600", color: "#2b6cb0" }}>
                  Para: {selectedUser.nombre} {selectedUser.apellido}
                </p>
              </Card>
            )}

            <textarea
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #cbd5e0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
                marginBottom: "12px",
                resize: "vertical"
              }}
            />

            <Button onClick={sendMessage} color="primary" width="100%">
              ✉️ ENVIAR MENSAJE
            </Button>
          </>
        )}

        <LogoutButton />
      </div>
    </PageWrapper>
  );
}

export default Messages;
