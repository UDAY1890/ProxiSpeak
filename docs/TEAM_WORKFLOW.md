# Team workflow

## Four-person team ownership

The project follows the four-work-branch layout in the team diagram. The team
lead is also `backend-member1` and owns Node.js and Socket.IO; `main` remains
the stable, reviewed integration branch.

| Member / branch | Primary ownership |
| --- | --- |
| Team lead — `backend-member1` | Node.js/Express server, Socket.IO rooms and event contract, backend tests, integration, pull-request reviews, and keeping `main` stable. |
| `frontend-member1` | Frontend UI and Canvas work. |
| `frontend-member2` | WebRTC peer connections, microphone/audio lifecycle, and audio UI. |
| `backend-member2` | Proximity behavior and coordination of signaling requirements with the team lead. |

These are shared responsibility branch names from the team layout. A member
may create short-lived `feature/<topic>` branches from their work branch for a
larger task, then merge them back through review. Coordinate edits to shared
client/server event payloads with the team lead before implementation.

## Team lead responsibilities

- Keep `main` stable and review/merge pull requests.
- Implement and maintain the Node.js and Socket.IO server, including the
  client/server event contract.
- Coordinate with `backend-member2` on proximity and signaling requirements,
  and with both frontend members on event payloads and integration.
- Confirm acceptance criteria and relevant tests are included before merging.
- Invite the other three teammates with write access and protect `main` in
  GitHub repository settings. These settings must be enabled on GitHub; they
  are not configured by files in this repository.

## Daily branch workflow

Start from an up-to-date `main` and switch to your assigned branch (create it
from `main` if it does not exist yet):

```powershell
git switch main
git pull origin main
git switch -c backend-member1
```

Use your own assignment instead of `backend-member1`: `frontend-member1`,
`frontend-member2`, or `backend-member2`. If the branch already exists on
GitHub, fetch and track it rather than creating a duplicate:

```powershell
git fetch origin
git switch --track origin/frontend-member1
```

Commit and publish only your branch:

```powershell
git status
git add server/
git commit -m "Add room membership handling"
git push -u origin backend-member1
```

Use a focused `git add` path rather than `git add .` when unrelated files may
be present. Before switching branches, commit or safely stash unfinished work.
Replace `server/` and the branch name with paths and branch names in your
assignment.

To bring newer `main` changes into your branch, switch to your branch first and
then merge:

```powershell
git switch backend-member1
git fetch origin
git merge origin/main
```

Resolve conflicts, run relevant checks, and push the updated feature branch.

## Pull request checklist

- Base branch is `main`; source branch is the focused feature branch.
- Describe the user-visible change and any contract/configuration changes.
- List the checks run and their results.
- Request a review from the team lead or relevant code owner.
- Keep unrelated formatting, generated files, and local environment files out.
- Merge only after review, passing checks, and conflict resolution.

In GitHub repository settings, invite teammates with write access and enable
branch protection for `main` (pull request review and required checks as
appropriate for the team).
