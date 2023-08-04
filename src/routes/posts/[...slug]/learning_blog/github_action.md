---
title: 'Github Action'
date: '2023-07-31'
description: Github Action for project management
tags:
  - sveltekit
  - learning_blog
  - github
---




[GitHub Acrtions for project management](https://docs.github.com/en/actions/managing-issues-and-pull-requests/using-github-actions-for-project-management)

[GitHub Script docs](https://github.com/marketplace/actions/github-script)
[add assignee to an issue](https://octokit.github.io/rest.js/v19#issues-add-assignees)
[create a project card](https://octokit.github.io/rest.js/v19#projects-create-card)




## Action components

### [Workflow](https://docs.github.com/en/actions/using-workflows/)
...a configurable automated process that will run one or more jobs


### [Event](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#events)
...a specific activity in a repository that triggers a workflow run.


### [Job](https://docs.github.com/en/actions/using-jobs)
...a set of steps in a workflow that is executed on the same runner. Can have _dependencies_, and then will wait on job 1 before starting job 2.

[Available permissions](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs):

```yaml
permissions:
  actions: read|write|none
  checks: read|write|none
  contents: read|write|none
  deployments: read|write|none
  id-token: read|write|none
  issues: read|write|none
  discussions: read|write|none
  packages: read|write|none
  pages: read|write|none
  pull-requests: read|write|none
  repository-projects: read|write|none
  security-events: read|write|none
  statuses: read|write|none
```


### [Action](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#actions)
...a custom application for the GitHub Actions platform that performs a complex but frequently repeated task.

### [Runner](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#runners)
...a server that runs your workflows when they're triggered. Each runner runs a single job at a time.

## The workflow file
example:

```yaml
name: learn-github-actions
run-name: ${{ github.actor }} is learning GitHub Actions
on: [push]
jobs:
  check-bats-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm install -g bats
      - run: bats -v
```

| Code | Required | Explanation |
|------|----------|-------------|
|`name:`|[ ]|workflow name in the "Actions" tab of the repo|
|`run-name:`|[ ]|name shown while running|
|`on: [push]`|[x]|trigger for workflow (here, push|
|`jobs:`|[x]|groups the jobs to run|
|`check-bats-version:`|[x]|defines job called 'check-bats-version'|
|`runs-on: ubuntu-latest`|[x]|configures runner as ubuntu server|
|`steps:`|[x]|groups steps in the job|
|`- uses: actions/checkout@v3`<br /> &ensp; `with:` <br> &ensp; &ensp; &ensp;`node-version: 14`|[x]|action to use (here, checkoutv3, with node v14)|
|`  - run: npm install -g bats`<br /> `  - run: bats -v`|[x]|run keyword exectues job on runner|



[Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)

[Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

[Github scripts docs](https://github.com/marketplace/actions/github-script)
[Github rest API docs](https://octokit.github.io/rest.js/v19)


### Context object

```
payload: {
    action: 'opened',
    issue: {
      active_lock_reason: null,
      assignee: null,
      assignees: [],
      author_association: 'OWNER',
      body: null,
      closed_at: null,
      comments: 0,
      comments_url: 'https://api.github.com/repos/ccozens/learning_blog/issues/11/comments',
      created_at: '2023-07-12T09:17:13Z',
      events_url: 'https://api.github.com/repos/ccozens/learning_blog/issues/11/events',
      html_url: 'https://github.com/ccozens/learning_blog/issues/11',
      id: 1800542528,
      labels: [],
      labels_url: 'https://api.github.com/repos/ccozens/learning_blog/issues/11/labels{/name}',
      locked: false,
      milestone: null,
      node_id: 'I_kwDOJ6MSv85rUhlA',
      number: 11,
      performed_via_github_app: null,
      reactions: [Object],
      repository_url: 'https://api.github.com/repos/ccozens/learning_blog',
      state: 'open',
      state_reason: null,
      timeline_url: 'https://api.github.com/repos/ccozens/learning_blog/issues/11/timeline',
      title: 'test',
      updated_at: '2023-07-12T09:17:13Z',
      url: 'https://api.github.com/repos/ccozens/learning_blog/issues/11',
      user: [Object]
    },
    repository: {
      allow_forking: true,
      archive_url: 'https://api.github.com/repos/ccozens/learning_blog/{archive_format}{/ref}',
      archived: false,
      assignees_url: 'https://api.github.com/repos/ccozens/learning_blog/assignees{/user}',
      blobs_url: 'https://api.github.com/repos/ccozens/learning_blog/git/blobs{/sha}',
      branches_url: 'https://api.github.com/repos/ccozens/learning_blog/branches{/branch}',
      clone_url: 'https://github.com/ccozens/learning_blog.git',
      collaborators_url: 'https://api.github.com/repos/ccozens/learning_blog/collaborators{/collaborator}',
      comments_url: 'https://api.github.com/repos/ccozens/learning_blog/comments{/number}',
      commits_url: 'https://api.github.com/repos/ccozens/learning_blog/commits{/sha}',
      compare_url: 'https://api.github.com/repos/ccozens/learning_blog/compare/{base}...{head}',
      contents_url: 'https://api.github.com/repos/ccozens/learning_blog/contents/{+path}',
      contributors_url: 'https://api.github.com/repos/ccozens/learning_blog/contributors',
      created_at: '2023-07-11T08:06:16Z',
      default_branch: 'main',
      deployments_url: 'https://api.github.com/repos/ccozens/learning_blog/deployments',
      description: 'Svelte learning blog',
      disabled: false,
      downloads_url: 'https://api.github.com/repos/ccozens/learning_blog/downloads',
      events_url: 'https://api.github.com/repos/ccozens/learning_blog/events',
      fork: false,
      forks: 0,
      forks_count: 0,
      forks_url: 'https://api.github.com/repos/ccozens/learning_blog/forks',
      full_name: 'ccozens/learning_blog',
      git_commits_url: 'https://api.github.com/repos/ccozens/learning_blog/git/commits{/sha}',
      git_refs_url: 'https://api.github.com/repos/ccozens/learning_blog/git/refs{/sha}',
      git_tags_url: 'https://api.github.com/repos/ccozens/learning_blog/git/tags{/sha}',
      git_url: 'git://github.com/ccozens/learning_blog.git',
      has_discussions: false,
      has_downloads: true,
      has_issues: true,
      has_pages: false,
      has_projects: true,
      has_wiki: true,
      homepage: null,
      hooks_url: 'https://api.github.com/repos/ccozens/learning_blog/hooks',
      html_url: 'https://github.com/ccozens/learning_blog',
      id: 664998591,
      is_template: false,
      issue_comment_url: 'https://api.github.com/repos/ccozens/learning_blog/issues/comments{/number}',
      issue_events_url: 'https://api.github.com/repos/ccozens/learning_blog/issues/events{/number}',
      issues_url: 'https://api.github.com/repos/ccozens/learning_blog/issues{/number}',
      keys_url: 'https://api.github.com/repos/ccozens/learning_blog/keys{/key_id}',
      labels_url: 'https://api.github.com/repos/ccozens/learning_blog/labels{/name}',
      language: 'JavaScript',
      languages_url: 'https://api.github.com/repos/ccozens/learning_blog/languages',
      license: null,
      merges_url: 'https://api.github.com/repos/ccozens/learning_blog/merges',
      milestones_url: 'https://api.github.com/repos/ccozens/learning_blog/milestones{/number}',
      mirror_url: null,
      name: 'learning_blog',
      node_id: 'R_kgDOJ6MSvw',
      notifications_url: 'https://api.github.com/repos/ccozens/learning_blog/notifications{?since,all,participating}',
      open_issues: 8,
      open_issues_count: 8,
      owner: [Object],
      private: false,
      pulls_url: 'https://api.github.com/repos/ccozens/learning_blog/pulls{/number}',
      pushed_at: '2023-07-12T09:16:40Z',
      releases_url: 'https://api.github.com/repos/ccozens/learning_blog/releases{/id}',
      size: 31,
      ssh_url: 'git@github.com:ccozens/learning_blog.git',
      stargazers_count: 0,
      stargazers_url: 'https://api.github.com/repos/ccozens/learning_blog/stargazers',
      statuses_url: 'https://api.github.com/repos/ccozens/learning_blog/statuses/{sha}',
      subscribers_url: 'https://api.github.com/repos/ccozens/learning_blog/subscribers',
      subscription_url: 'https://api.github.com/repos/ccozens/learning_blog/subscription',
      svn_url: 'https://github.com/ccozens/learning_blog',
      tags_url: 'https://api.github.com/repos/ccozens/learning_blog/tags',
      teams_url: 'https://api.github.com/repos/ccozens/learning_blog/teams',
      topics: [],
      trees_url: 'https://api.github.com/repos/ccozens/learning_blog/git/trees{/sha}',
      updated_at: '2023-07-11T08:06:34Z',
      url: 'https://api.github.com/repos/ccozens/learning_blog',
      visibility: 'public',
      watchers: 0,
      watchers_count: 0,
      web_commit_signoff_required: false
    },
    sender: {
      avatar_url: 'https://avatars.githubusercontent.com/u/14309533?v=4',
      events_url: 'https://api.github.com/users/ccozens/events{/privacy}',
      followers_url: 'https://api.github.com/users/ccozens/followers',
      following_url: 'https://api.github.com/users/ccozens/following{/other_user}',
      gists_url: 'https://api.github.com/users/ccozens/gists{/gist_id}',
      gravatar_id: '',
      html_url: 'https://github.com/ccozens',
      id: 14309533,
      login: 'ccozens',
      node_id: 'MDQ6VXNlcjE0MzA5NTMz',
      organizations_url: 'https://api.github.com/users/ccozens/orgs',
      received_events_url: 'https://api.github.com/users/ccozens/received_events',
      repos_url: 'https://api.github.com/users/ccozens/repos',
      site_admin: false,
      starred_url: 'https://api.github.com/users/ccozens/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/ccozens/subscriptions',
      type: 'User',
      url: 'https://api.github.com/users/ccozens'
    }
  },
  eventName: 'issues',
  sha: '1dbc910bd9ab675f1eaa8356e439ddad156eb6c3',
  ref: 'refs/heads/main',
  workflow: 'Assign issues and create cards',
  action: '__actions_github-script',
  actor: 'ccozens',
  job: 'label_issues',
  runNumber: 6,
  runId: 5529813018,
  apiUrl: 'https://api.github.com',
  serverUrl: 'https://github.com',
  graphqlUrl: 'https://api.github.com/graphql'
}
```
