import { useEffect, useState, useRef } from "react";

const API_URL = "https://backend-6jy7.onrender.com";

function ChatWidget() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // ── Cargar usuarios al abrir ───────────────────────────────────────────
  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/users/`)
        .then(r => r.json())
        .then(data => setUsers(data.filter(u => u.id !== user?.id)))
        .catch(() => {});
    }
  }, [open]);

  // ── Cargar mensajes cuando hay usuario seleccionado ────────────────────
  useEffect(() => {
    if (!selectedUser) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedUser]);

  // ── Auto scroll al fondo ───────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Contar no leídos ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetch(`${API_URL}/messages/unread/${user.id}`)
        .then(r => r.json())
        .then(data => setUnread(data.count || 0))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = () => {
    if (!user?.id || !selectedUser?.id) return;
    fetch(`${API_URL}/messages/${user.id}/${selectedUser.id}`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id:   user.id,
        receiver_id: selectedUser.id,
        message:     newMsg.trim(),
      }),
    }).catch(() => {});
    setNewMsg("");
    fetchMessages();
  };

  const roleColor = (role_id) => {
    if (role_id === 1) return "#e63946"; // admin
    if (role_id === 3) return "#f7971e"; // instructor
    return "#74c0fc";                    // estudiante
  };

  const roleLabel = (role_id) => {
    if (role_id === 1) return "Admin";
    if (role_id === 3) return "Instructor";
    return "Estudiante";
  };

  const filteredUsers = users.filter(u =>
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return null;

  return (
    <>
      {/* ── Botón flotante ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          width: "56px", height: "56px", borderRadius: "50%",
          background: "linear-gradient(135deg, #1e3a5f, #4a6fa5)",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open ? "✕" : "💬"}
        {!open && unread > 0 && (
          <span style={{
            position: "absolute", top: "2px", right: "2px",
            background: "#e63946", color: "white",
            borderRadius: "50%", width: "18px", height: "18px",
            fontSize: "10px", fontWeight: "bold",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* ── Ventana del chat ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px", zIndex: 9998,
          width: "340px", height: "500px",
          background: "white", borderRadius: "16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          fontFamily: "'Segoe UI', sans-serif",
        }}>

          {/* Header */}
          <div style={{ background: "#1e3a5f", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            {selectedUser ? (
              <>
                <button onClick={() => { setSelectedUser(null); setMessages([]); }}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "18px", padding: "0 4px" }}>
                  ←
                </button>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: roleColor(selectedUser.role_id), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: "14px" }}>
                  {selectedUser.nombre?.[0]}
                </div>
                <div>
                  <p style={{ margin: 0, color: "white", fontWeight: "600", fontSize: "14px" }}>{selectedUser.nombre} {selectedUser.apellido}</p>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{roleLabel(selectedUser.role_id)}</span>
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: "18px" }}>💬</span>
                <div>
                  <p style={{ margin: 0, color: "white", fontWeight: "700", fontSize: "15px" }}>Mensajes</p>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Hola, {user.nombre}</span>
                </div>
              </>
            )}
          </div>

          {/* Lista de usuarios */}
          {!selectedUser && (
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* Búsqueda */}
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f0" }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar usuario..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#f8fafc" }}
                />
              </div>

              {filteredUsers.length === 0 ? (
                <p style={{ color: "#aaa", textAlign: "center", fontSize: "13px", padding: "20px" }}>No se encontraron usuarios</p>
              ) : filteredUsers.map(u => (
                <button key={u.id} onClick={() => setSelectedUser(u)} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", border: "none", background: "none",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  borderBottom: "1px solid #f0f0f0", transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: roleColor(u.role_id), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: "15px", flexShrink: 0 }}>
                    {u.nombre?.[0]}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#1a202c" }}>{u.nombre} {u.apellido}</p>
                    <span style={{ fontSize: "11px", color: roleColor(u.role_id), fontWeight: "600", background: `${roleColor(u.role_id)}18`, padding: "1px 7px", borderRadius: "20px" }}>
                      {roleLabel(u.role_id)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mensajes */}
          {selectedUser && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", background: "#f8fafc" }}>
                {messages.length === 0 && (
                  <p style={{ color: "#aaa", textAlign: "center", fontSize: "13px", marginTop: "30px" }}>
                    Aún no hay mensajes.<br/>¡Envía el primero!
                  </p>
                )}
                {messages.map((m, i) => {
                  const isMine = m.sender_id === user.id;
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "75%", padding: "8px 12px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: isMine ? "#1e3a5f" : "white",
                        color: isMine ? "white" : "#1a202c",
                        fontSize: "13px", lineHeight: 1.5,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}>
                        {m.message}
                        <div style={{ fontSize: "10px", color: isMine ? "rgba(255,255,255,0.5)" : "#aaa", marginTop: "3px", textAlign: "right" }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input mensaje */}
              <div style={{ padding: "10px 12px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", background: "white" }}>
                <input
                  type="text"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "20px", fontSize: "13px", outline: "none", background: "#f8fafc" }}
                />
                <button onClick={sendMessage} style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #f7971e, #ffd200)",
                  border: "none", cursor: "pointer", fontSize: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ChatWidget;
