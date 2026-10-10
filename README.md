# ProxiSpeak

ProxiSpeak is a team-built proximity voice chat project. This repository is a
monorepo: the React client and Node.js server live together and are run from
the repository root.

## Project status

The starter app includes a working web interface, a Socket.IO connection,
temporary in-memory rooms, participant presence, and a health endpoint. It does
**not** yet capture or stream microphone audio, establish WebRTC peer
connections, or detect physical proximity. Those are feature tasks for the
team, not completed features.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Run locally

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The API and
Socket.IO server listens on `http://localhost:3001`.

To run just one part:

```powershell
npm run dev --workspace server
npm run dev --workspace client
```

Check the server health at `http://localhost:3001/health`. Set
`VITE_SOCKET_URL` in `client/.env.local` if the client should connect to a
different server URL. Set `PORT` and `CLIENT_ORIGIN` in `server/.env` to
configure the server. Local environment files are ignored by Git; do not commit
secrets.

Build and type-check the client:

```powershell
npm run typecheck
npm run build
```

## Repository layout

```text
client/       React + TypeScript + Vite app
server/       Node.js + Express + Socket.IO service
docs/         Team workflow and architecture notes
.github/      Pull request template
```

See [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) for branch ownership,
integration responsibilities, and the pull-request process. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the current socket event
contract and the planned feature boundaries.

The four assigned work branches are `frontend-member1` (UI and Canvas),
`backend-member1` (team lead; Node.js and Socket.IO), `frontend-member2`
(WebRTC and audio UI), and `backend-member2` (proximity and signaling).

## Contributing

Create a feature branch from the latest `main`, make focused changes, run the
checks relevant to your change, and open a pull request back to `main`. Do not
push feature work directly to `main`. Coordinate changes to shared socket
events with the team lead before merging.
