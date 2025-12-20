# AmTennis

## Start Local Server

To serve the project locally, run:

```
npx serve .
```

This will start a local server at http://localhost:3000.

## Git: create branch, commit, and push

To create a new local branch from `main`, commit your changes, and push to the remote:

1. Update your local `main` and create a branch:

```bash
git checkout main
git pull origin main
git checkout -b chore/your-branch-name
```

2. Make changes, stage and commit:

```bash
git add .
git commit -m "chore: describe your changes"
```

3. Push the branch to the remote and create a pull request if desired:

```bash
git push -u origin chore/your-branch-name
# then open a PR on GitHub or your Git host
```

Notes:
- Replace `chore/your-branch-name` with a descriptive branch name.
- Use `git status` to inspect changes before committing.
- Use `git rebase main` or `git merge main` to keep your branch up to date as needed.

