import { createServer } from "node:http";
import express from "express";
import { Server } from "socket.io";

const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "proxispeak-server" });
});

function leaveCurrentRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId) return;

  const participants = rooms.get(roomId);
  participants?.delete(socket.id);
  socket.leave(roomId);
  socket.data.roomId = undefined;

  if (participants?.size === 0) {
    rooms.delete(roomId);
  } else {
    socket.to(roomId).emit("room:participant-left", { socketId: socket.id });
  }
}

function isValidSignal(payload, expectedField) {
  return (
    payload &&
    typeof payload.targetId === "string" &&
    typeof payload[expectedField] === "object" &&
    payload[expectedField] !== null
  );
}

io.on("connection", (socket) => {
  socket.on("room:join", (payload = {}) => {
    if (!payload || typeof payload !== "object") {
      socket.emit("room:error", { message: "A room code and display name are required." });
      return;
    }
    const { roomId, displayName } = payload;
    if (
      typeof roomId !== "string" ||
      typeof displayName !== "string" ||
      !roomId.trim() ||
      !displayName.trim()
    ) {
      socket.emit("room:error", { message: "A room code and display name are required." });
      return;
    }

    const cleanRoomId = roomId.trim().slice(0, 64);
    const cleanName = displayName.trim().slice(0, 32);
    leaveCurrentRoom(socket);

    if (!rooms.has(cleanRoomId)) rooms.set(cleanRoomId, new Map());
    const roomParticipants = rooms.get(cleanRoomId);
    const participant = { socketId: socket.id, displayName: cleanName };

    socket.join(cleanRoomId);
    socket.data.roomId = cleanRoomId;
    roomParticipants.set(socket.id, cleanName);

    socket.emit("room:joined", {
      roomId: cleanRoomId,
      self: participant,
      participants: [...roomParticipants.entries()].map(([socketId, name]) => ({
        socketId,
        displayName: name,
      })),
    });
    socket.to(cleanRoomId).emit("room:participant-joined", { participant });
  });

  socket.on("room:leave", () => leaveCurrentRoom(socket));

  for (const [eventName, fieldName] of [
    ["signal:offer", "description"],
    ["signal:answer", "description"],
    ["signal:ice-candidate", "candidate"],
  ]) {
    socket.on(eventName, (payload) => {
      const roomId = socket.data.roomId;
      if (!roomId || !isValidSignal(payload, fieldName)) {
        socket.emit("room:error", { message: "Invalid signaling data or no active room." });
        return;
      }

      const targetId = payload.targetId;
      if (!rooms.get(roomId)?.has(targetId)) {
        socket.emit("room:error", { message: "The signaling recipient is not in this room." });
        return;
      }

      const { targetId: _targetId, ...signal } = payload;
      io.to(targetId).emit(eventName, { fromId: socket.id, ...signal });
    });
  }

  socket.on("disconnect", () => leaveCurrentRoom(socket));
});

httpServer.listen(port, () => {
  console.log(`ProxiSpeak server listening on http://localhost:${port}`);
});
