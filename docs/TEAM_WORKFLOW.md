# Team workflow

## Team lead responsibilities

- Keep `main` stable and review/merge pull requests.
- Coordinate the client/server event contract and resolve integration
  conflicts.
- Confirm that a feature's acceptance criteria and tests are included before
  merging.
- Configure GitHub collaborator access and protect `main` in repository
  settings. These settings must be enabled on GitHub; they are not configured
  by files in this repository.

## Suggested ownership

Assign the roles below to actual teammates; names are intentionally left
unassigned.

| Role | Suggested scope | Suggested branch |
| --- | --- | --- |
| Team lead / integrator | Integration, reviews, shared contracts, releases | `main` for reviewed code; `feature/<topic>` for implementation |
| Frontend owner | React screens, layout, responsive and accessible UI | `frontend/<username>` |
| Backend owner | Express API, Socket.IO rooms and server tests | `backend/<username>` |
| WebRTC owner | Microphone permissions, peer connections, audio lifecycle | `feature/webrtc` |
| Proximity owner | Proximity model and signaling behavior | `feature/proximity` |
| QA / integration owner | Test plan, regression checks, integration fixes | `testing/<username>` |

These are responsibility suggestions, not required permanent branches. Create
short-lived branches for features and pull them into `main` through review.
Avoid having two people independently edit the same files without first
agreeing who owns the integration.

## Daily branch workflow

Start from an up-to-date `main` and create your own branch:

```powershell
git switch main
git pull origin main
git switch -c frontend/<your-username>
```

Commit and publish only your branch:

```powershell
git status
git add client/
git commit -m "Build the room interface"
git push -u origin frontend/<your-username>
```

Use a focused `git add` path rather than `git add .` when unrelated files may
be present. Before switching branches, commit or safely stash unfinished work.

To bring newer `main` changes into your branch, switch to your branch first and
then merge:

```powershell
git switch frontend/<your-username>
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
