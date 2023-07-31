# Contributing Guide For Sushi Bot

Thank you for showing interest in contributing to Sushi Bot,
be it as a developer, bug catcher, or ideator!

The issues in this are used for feature plans by our developers,
feature requests from our community, and bug reports from our
community. If you have questions regardig Sushi Bot, please join
[Sushi Hub][community server] and ask them there; **do not open
issues, they will be immediately closed by us**.

## For Developers

### Setting up the workspace (Non-collaborators)

Follow these steps to prepare a workspace for the code:

1. Fork and clone the repository and make sure you're on the main branch
2. Create and checkout to a branch for your changes
3. Run `npm i` to install all the dependencies
4. Have fun coding!

### Setting up the workspace (Collaborators)

Follow these steps to prepare a workspace for the code:

1. Clone this repository and make sure you're on the main branch
2. Create and checkout to a branch for your changes
3. Run `npm i` to install all the dependencies
4. Have fun coding!

### Creating Issues (Collaborators)

Before creating an issue, make sure that there aren't already any related issue.
When opening an issue, use an appropriate template.

### Solving Issues

Look through our issues to find one that interests you. You can make use of our
[labels][repo labels] when doing so. Issues with an assignee is to be worked
on by that collaborator. If you're a non-collaborator, feel free to fork this
repository, work on the issue, and open a pull request with an implementation.

### Testing Changes

Though not required, it's good to test your changes before committing
and pushing them. Make sure that you have 

1. Run `npm run build` to compile the TypeScript code
2. Run `npm run dev` to start the bot with hot reloading enabled
3. Change code and recompile as needed

### Committing Changes

Don't make too many changes before committing them, so it'll be easier
to roll back if any errors arise! Keep commits small and self contained,
and refer to the [commit convention](./COMMIT_CONVENTION.md) of this
repository when writing commit messages.

### Creating Pull Requests

When you're done coding for the issue you're working on, create a pull request (PR).

- Choose an apprepriate PR template and follow the instructions there
- Start a review that goes through the key points in the PR. A Sushi Bot
team member will review the changes and mark the key points as resolved
- We may request changes in the form of suggested changes or comments,
in which case you'll need to make those changes and mark the comments
as resolved

If all goes well, your PR will be merged into the stable version of Sushi Bot!

You might be invited to the Sushi Bot team if we're impressed of your work.

## For Bug Catchers and Ideators

### Creating Issues

Before creating an issue, make sure that there aren't already any related issue.
When creating an issue, use an appropriate template.
The "Feature request" template is for exactly what is would suggest,
and so is the "Bug report" template.
Make sure to include all the necessary information in the issue;
such as what you expect of the bot when a requested feature has been
implemented, or the steps to reproduce a bug along with the expected behaviour.

[community server]: https://discord.gg/Pqv2JkDKAg
[repo labels]: https://github.com/MirageAegis/Sushi-Bot/labels
