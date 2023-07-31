# Git Commit Message Convention

## Message Format

Commit messages **MUST** have a header and may have a body and footer,
and follow the following format:
```
<issue> <subject>

[body]

[footer]
```

Issues should not be closed via issues.

### Issue

Each commit should reference the issue it's related to, e.g. `#8 <subject>`;
or multiple issues if related to them, e.g. `#4 #16 <subject>`.
In the case that this is not applicable; insert `docs`, `chore`, `refactor`,
or another type of task in place of the issue followed by a colon,
e.g. `chore: <subject>`.

### Subject

The subject should be a succinct description of the change and:
- use the imperative, present tense, e.g. "Implement", not "Implemented" nor "Implements";
- have the first letter capitalised; and
- have no trailing periods (".").

### Body

The commit message may include a body if the change(s) need more context and motivation.
It should also  use the imperative, present tense; just like the subject.

### Footer

In case the changes were made by multiple developers on the same machine,
add a co-author to the footer.

## Reverting Changes

### Message Format

When reverting a commit, use the following as the commit message:
```
revert: <commit header>

This reverts <commit hash>, <reason>
```

### Commit Header

The exact header that was used for the commit being reverted.

### Commit Hash

The SHA hash of the commit being reverted.

### Reason

Clearly state why this revert is being made.
