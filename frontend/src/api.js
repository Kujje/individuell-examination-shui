const API_URL = "https://n1qta2cgal.execute-api.eu-north-1.amazonaws.com"; 

export async function getMessages() {
  const res = await fetch(`${API_URL}/messages`);
  if (!res.ok) throw new Error("Kunde inte hämta meddelanden");
  return res.json();
}

export async function createMessage(data) {
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Kunde inte skapa meddelande");
  return res.json();
}

export async function updateMessage(id, data) {
  const res = await fetch(`${API_URL}/messages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Kunde inte uppdatera meddelande");
  return res.json();
}

export async function getMessagesByUser(username) {
  const res = await fetch(`${API_URL}/messages/${username}`);
  if (!res.ok) throw new Error("Kunde inte hämta användarens meddelanden");
  return res.json();
}
