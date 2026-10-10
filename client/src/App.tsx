import { useEffect, useMemo, useState, type FormEvent } from "react";
import { io, type Socket } from "socket.io-client";

type Participant = {
  socketId: string;
  displayName: string;
};

type RoomJoined = {
  roomId: string;
  self: Participant;
  participants: Participant[];
};

type RoomError = {
  message: string;
};

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001";

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function App() {
  const socket: Socket = useMemo(() => io(socketUrl, { autoConnect: false }), []);
  const [connected, setConnected] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [room, setRoom] = useState<RoomJoined | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      setRoom(null);
      setParticipants([]);
    };
    const onJoined = (nextRoom: RoomJoined) => {
      setRoom(nextRoom);
      setParticipants(nextRoom.participants);
      setError("");
    };
    const onParticipantJoined = ({ participant }: { participant: Participant }) => {
      setParticipants((current) =>
        current.some((item) => item.socketId === participant.socketId)
          ? current
          : [...current, participant],
      );
    };
    const onParticipantLeft = ({ socketId }: { socketId: string }) => {
      setParticipants((current) =>
        current.filter((participant) => participant.socketId !== socketId),
      );
    };
    const onRoomError = ({ message }: RoomError) => setError(message);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:joined", onJoined);
    socket.on("room:participant-joined", onParticipantJoined);
    socket.on("room:participant-left", onParticipantLeft);
    socket.on("room:error", onRoomError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:joined", onJoined);
      socket.off("room:participant-joined", onParticipantJoined);
      socket.off("room:participant-left", onParticipantLeft);
      socket.off("room:error", onRoomError);
      socket.disconnect();
    };
  }, [socket]);

  function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = displayName.trim();
    const roomId = roomInput.trim() || makeRoomCode();
    if (!name) {
      setError("Add your name before joining a room.");
      return;
    }
    setError("");

    const join = () => socket.emit("room:join", { roomId, displayName: name });
    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
      socket.connect();
    }
  }

  function leaveRoom() {
    socket.emit("room:leave");
    setRoom(null);
    setParticipants([]);
    setMuted(false);
  }

  async function copyRoomCode() {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.roomId);
      setError("");
    } catch {
      setError("Could not copy the room code. You can select and copy it instead.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="ProxiSpeak home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>proxi<span className="brand-light">speak</span></span>
        </a>
        <div className="topbar-right">
          <span className={`connection-pill ${connected ? "is-online" : ""}`}>
            <span className="status-dot" />
            {connected ? "Server connected" : "Ready to connect"}
          </span>
          <a className="github-link" href="https://github.com/UDAY1890/ProxiSpeak">
            Project
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> A little closer, wherever you are</p>
          <h1>Good conversations<br />happen <span>in the moment.</span></h1>
          <p className="hero-description">
            Step into a room, bring your people along, and let the conversation
            find its own rhythm.
          </p>
          <div className="hero-note">
            <span className="note-icon" aria-hidden="true">✳</span>
            <span>Made for the moments between the plans.</span>
          </div>
        </div>

        <div className="sound-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="sound-core">
            <div className="sound-bars">
              <i /><i /><i /><i /><i /><i /><i />
            </div>
          </div>
          <span className="orbit-person person-one">J</span>
          <span className="orbit-person person-two">M</span>
          <span className="orbit-person person-three">A</span>
          <span className="orbit-person person-four">S</span>
          <span className="orbit-label">YOUR PEOPLE, IN SYNC</span>
          <span className="art-spark spark-one">✳</span>
          <span className="art-spark spark-two">·</span>
        </div>
      </section>

      <section className="workspace" aria-label="Join or manage a voice room">
        <div className="room-card">
          {!room ? (
            <>
              <div className="card-heading">
                <div>
                  <p className="section-kicker">YOUR SPACE</p>
                  <h2>Find your people</h2>
                </div>
                <span className="card-step">01 <span>/ 02</span></span>
              </div>
              <p className="card-intro">A name and a room is all it takes to get started.</p>
              <form className="join-form" onSubmit={joinRoom}>
                <label htmlFor="display-name">Your name</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">◉</span>
                  <input
                    id="display-name"
                    autoComplete="nickname"
                    maxLength={32}
                    placeholder="What should we call you?"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </div>
                <label htmlFor="room-code">Room code <span className="optional">(optional)</span></label>
                <div className="input-wrap">
                  <span className="input-icon room-icon" aria-hidden="true">#</span>
                  <input
                    id="room-code"
                    maxLength={64}
                    placeholder="Leave blank to create a room"
                    value={roomInput}
                    onChange={(event) => setRoomInput(event.target.value)}
                  />
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="primary-button" type="submit" disabled={!displayName.trim()}>
                  <span>{roomInput.trim() ? "Join the room" : "Create a room"}</span>
                  <span className="button-arrow" aria-hidden="true">↗</span>
                </button>
              </form>
              <p className="privacy-note"><span aria-hidden="true">⌑</span> Your room is private to people with its code.</p>
            </>
          ) : (
            <>
              <div className="card-heading">
                <div>
                  <p className="section-kicker">YOU’RE IN</p>
                  <h2>The room is open</h2>
                </div>
                <span className="live-badge"><span /> LIVE</span>
              </div>
              <div className="active-room">
                <span className="room-hash">#</span>
                <div>
                  <span className="room-label">ROOM CODE</span>
                  <strong>{room.roomId}</strong>
                </div>
                <button className="copy-button" type="button" onClick={copyRoomCode}>Copy</button>
              </div>
              <div className="people-heading">
                <span>IN THIS ROOM</span>
                <span className="people-count">{participants.length} here</span>
              </div>
              <div className="participant-list">
                {participants.map((participant, index) => (
                  <div className="participant" key={participant.socketId}>
                    <span className={`avatar avatar-${index % 4}`}>{initials(participant.displayName)}</span>
                    <span className="participant-name">
                      {participant.displayName}
                      {participant.socketId === room.self.socketId && <small>YOU</small>}
                    </span>
                    <span className="participant-presence"><i /> here</span>
                  </div>
                ))}
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="room-controls">
                <button
                  className={`control-button ${muted ? "control-muted" : ""}`}
                  type="button"
                  onClick={() => setMuted((current) => !current)}
                  aria-pressed={muted}
                >
                  <span aria-hidden="true">{muted ? "×" : "♪"}</span>
                  {muted ? "Unmute" : "Mute"}
                </button>
                <button className="leave-button" type="button" onClick={leaveRoom}>Leave room</button>
              </div>
              <p className="privacy-note"><span aria-hidden="true">ⓘ</span> Audio controls are a preview; voice streaming is not connected yet.</p>
            </>
          )}
        </div>

        <aside className="side-card">
          <div className="side-card-top">
            <span className="side-icon" aria-hidden="true">✳</span>
            <span className="side-tag">THE PROXISPEAK WAY</span>
          </div>
          <h3>Less scheduling.<br />More <em>showing up.</em></h3>
          <p>Rooms are little corners of the internet for the people you want close.</p>
          <div className="side-divider" />
          <div className="side-footer">
            <div className="avatar-stack" aria-hidden="true">
              <span className="avatar avatar-0">J</span>
              <span className="avatar avatar-1">M</span>
              <span className="avatar avatar-2">A</span>
              <span className="avatar avatar-more">+</span>
            </div>
            <span>Good things sound better together.</span>
          </div>
        </aside>
      </section>

      <footer className="footer">
        <span>PROXISPEAK <span className="footer-dot">·</span> FIND YOUR FREQUENCY</span>
        <span className="footer-status"><i /> Built for bringing people closer</span>
      </footer>
    </main>
  );
}
