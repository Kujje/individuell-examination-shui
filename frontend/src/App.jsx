import { useEffect, useState } from "react";
import { getMessages, getMessagesByUser, createMessage, updateMessage } from "./api";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    refreshMessages();
  }, []);

  async function refreshMessages() {
    try {
      const data = await getMessages();
      sortAndSetMessages(data);
      setErrorMessage("");
    } catch (err) {
      console.error("Fel vid hämtning:", err);
      setErrorMessage("Kunde inte hämta meddelanden.");
    }
  }

  function sortAndSetMessages(data) {
    const sorted = [...data].sort((a, b) =>
      sortNewest
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    setMessages(sorted);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !text) return;
    try {
      await createMessage({ username, text });
      setText("");
      setUsername("");
      refreshMessages();
    } catch (err) {
      console.error("Fel vid skapande:", err);
      setErrorMessage("Kunde inte skapa meddelande.");
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editId) return;
    try {
      await updateMessage(editId, { text: editText });
      setEditId(null);
      setEditText("");
      refreshMessages();
    } catch (err) {
      console.error("Fel vid uppdatering:", err);
      setErrorMessage("Kunde inte uppdatera meddelande.");
    }
  }

  async function handleSearch() {
    if (!searchUser) {
      refreshMessages();
      return;
    }
    try {
      const data = await getMessagesByUser(searchUser);
      if (data.length === 0) {
        setErrorMessage("Inga meddelanden hittades för denna användare.");
        setMessages([]);
      } else {
        setErrorMessage("");
        sortAndSetMessages(data);
      }
    } catch (err) {
      console.error("Fel vid sökning:", err);
      setErrorMessage("Ett fel uppstod vid sökning.");
    }
  }

  function toggleSort() {
    const newSort = !sortNewest;
    setSortNewest(newSort);

    const sorted = [...messages].sort((a, b) =>
      newSort
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    setMessages(sorted);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return (
    <div>
      <header className="header">
        <h1>Shui</h1>
      </header>

      <main className="container">
        <form onSubmit={handleSubmit} className="row gap wrap">
          <input
            placeholder="Användarnamn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Meddelande"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn" type="submit">
            Publicera
          </button>
        </form>

        <div className="row gap wrap search-row">
          <input
            placeholder="Sök efter användare..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <button className="btn" onClick={handleSearch}>
            Sök
          </button>
          <button className="btn" onClick={refreshMessages}>
            Visa alla
          </button>
          <button className="btn" onClick={toggleSort}>
            {sortNewest ? "Nyast först" : "Äldst först"}
          </button>
        </div>

        {errorMessage && (
          <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
        )}

        <h2 className="section-title">Alla meddelanden</h2>
        <div className="cards">
          {messages.map((msg) => (
            <div key={msg.id} className="card">
              <div className="card-head">
                <p className="username">{msg.username}</p>
                <p className="date">{formatDate(msg.createdAt)}</p>
              </div>

              <div className="card-body">
                {editId === msg.id ? (
                  <input
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <p className="text">{msg.text}</p>
                )}
              </div>

              <div className="card-footer">
                {editId === msg.id ? (
                  <>
                    <button className="btn small-btn" onClick={handleUpdate}>
                      Spara
                    </button>
                    <button
                      className="btn small-btn"
                      type="button"
                      onClick={() => {
                        setEditId(null);
                        setEditText("");
                      }}
                    >
                      Avbryt
                    </button>
                  </>
                ) : (
                  <button
                    className="btn small-btn"
                    onClick={() => {
                      setEditId(msg.id);
                      setEditText(msg.text);
                    }}
                  >
                    Redigera
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
