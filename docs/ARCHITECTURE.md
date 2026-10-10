# Architecture and integration contract

## Current runtime

- `client/` is a Vite-served React + TypeScript single-page application.
- `server/` is an Express HTTP server with a Socket.IO endpoint.
- The client connects to the server URL in `VITE_SOCKET_URL`, defaulting to
  `http://localhost:3001`.
- Rooms and their participants are held in server memory. Restarting the server
  clears them; this starter has no database or authentication.

## HTTP endpoint

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Returns server status for local checks and future monitoring. |

## Socket.IO events

Payloads are JSON objects. Room identifiers and display names are trimmed and
limited to 64 and 32 characters respectively by the server.

| Direction | Event | Payload | Purpose |
| --- | --- | --- | --- |
| Client -> server | `room:join` | `{ roomId, displayName }` | Join a room. |
| Server -> client | `room:joined` | `{ roomId, self, participants }` | Confirms join and returns current participants, including self. |
| Server -> room | `room:participant-joined` | `{ participant }` | Notifies existing room members. |
| Server -> room | `room:participant-left` | `{ socketId }` | Notifies members when a participant leaves. |
| Client -> server | `room:leave` | none | Leave the current room. |
| Server -> client | `room:error` | `{ message }` | Reports invalid join or signaling input. |
| Client -> server | `signal:offer`, `signal:answer`, `signal:ice-candidate` | `{ targetId, description }` or `{ targetId, candidate }` | Relays WebRTC signaling to another socket in the same room. |
| Server -> client | Matching `signal:*` event | `{ fromId, description }` or `{ fromId, candidate }` | Delivers a relayed signal. |

Signaling events only relay data; they do not create a peer connection or
transmit audio. The sender and target must be connected to the same room.

## Planned work (not implemented yet)

1. WebRTC owner: microphone permission UX, peer connection lifecycle, audio
   tracks, cleanup, and tests.
2. Proximity owner: agree on what proximity means for the product (for example
   an in-app distance model versus device/location-derived proximity), then
   implement and document it. Do not add location collection without an explicit
   product and privacy decision.
3. Backend owner: persistence/authentication only after the team agrees on
   requirements; current rooms are ephemeral.
4. QA owner: test the client/server contract, validation errors, disconnects,
   and multi-client room behavior.

Coordinate contract changes with the team lead and update this document and
client/server code together in the same pull request where possible.
