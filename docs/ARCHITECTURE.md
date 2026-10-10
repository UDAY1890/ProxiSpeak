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

## Team ownership and planned work

- Team lead (`backend-member1`): owns the Node.js/Express and Socket.IO server,
  room lifecycle, event contract, backend tests, and integration.
- `frontend-member1`: owns frontend UI and Canvas work.
- `frontend-member2`: owns WebRTC peer connections, microphone/audio lifecycle,
  audio UI, cleanup, and tests.
- `backend-member2`: owns proximity behavior and works with the lead on
  signaling requirements and contract changes.

The signaling events listed above currently relay payloads only. Full WebRTC
peer connections and microphone streaming are still future work. The team must
agree what “proximity” means (for example an in-app distance model versus
device/location-derived proximity) before implementing it. Do not add location
collection without an explicit product and privacy decision.

Rooms are currently ephemeral. Add persistence or authentication only after
the team agrees on requirements. The frontend and backend owners should test
the shared contract, validation errors, disconnects, and multi-client room
behavior as part of their changes.

Coordinate contract changes with the team lead and update this document and
client/server code together in the same pull request where possible.
