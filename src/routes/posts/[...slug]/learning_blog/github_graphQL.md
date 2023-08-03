---
title: GitHub GraphQL query.
date: '2023-07-31'
description: description
tags:
  - sveltekit
  - learning_blog
  - graphQL
  - API
  - github
---
#GitHub GraphQL query.

I wanted to have an at-a-glance way of seeing what I should be working on to improve focus, so as I was already using [GitHub issues to track work on this project](https://github.com/ccozens/learning_blog/issues), I decided to make an API call to my repo to pull out issues labelled _in\_progress_. As I'm the only user, this shouldn't cause complication, though I did find I had to add _state=open_ to the filter.

I used the [GitHub GraphQL docs](https://docs.github.com/en/graphql) and, at their suggestion, the [Altair GraphQL Client](https://altairgraphql.dev/) to make sure I had the query right.

1. Create a [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), specifically I [created a fine-grained PAT following the isntructions on GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token), with:
	- repo access: [this blog](https://github.com/ccozens/learning_blog) only.
	- permission to: *Read access to actions and metadata*, and *Read and Write access to issues*.
	- expiry a year from creation, so save me having to recreate it that often and as this is not highly sensitive information.

2. Add the PAT to the code. Sveltekit reads environment variables from `.env` automatically during development, so create `.env`:

	```plaintext .env
	ACTION_SECRET = '####'
	```

	Note I called it ACTION_SECRET.

3. While still in GitHub, we'll need some issues to test. This query will return issues labelled *in_progress* that are *open*, so create some issues that are not in progress, that are in progress, and the close one of each to test. Github has docs on [creating issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue) and [managing and creating labels](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels). For example, [the issues for this repo are here](https://github.com/ccozens/learning_blog/issues).

4. [SvelteKit does not load environment variables in production](), so  install https://github.com/motdotla/dotenv#readme: `pnpm add dotenv`. This isn't essential yet but will be on deployment. Also, remember to add the environment variables to your hosting provider ([I used vercel, and their docs are here](https://vercel.com/docs/concepts/projects/environment-variables)).

5. Install the [Altair GraphQL Client](https://altairgraphql.dev/) . I followed [GitHub's guide to using the explorer](https://docs.github.com/en/graphql/guides/using-the-explorer#using-the-altair-graphql-client-ide) and it is excellent. Following their instructions, and add the PAT created above to the headers. Do this by clickig the first element on the left dock men ("Headers") and a setting the header to: *Authorization* with value *Bearer TOKENVALUE*. Make sure to follow the part in the GitHub guide on loading in the [public schema](https://docs.github.com/en/graphql/overview/public-schema).

7. I then built out this query:

```typescript
query issues_in_progress {
  repository(owner: "ccozens", name: "learning_blog") {
    issues(first: 10, labels: ["in_progress"], states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {
      edges {
        node {
          title
          url
          body
          comments(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }) {
            edges {
              node {
                body
              }
            }
          }
        }
      }
    }
  }
}
```

####What happens here?
- First we declare `query` to access the query root of GitHub's GraphQL interface , and name the query `issues_in_progress`
- then traverse to the `repository` node with parameters `owner: "ccozens", name: "learning_blog"` to access this rep.
- then to the `issues` node with params `(first: 10, labels: ["in_progress"], states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC })`, which:
	- `first: 10` retrieve the first 10 issues that match the parameters. Note this is a required parameter for pagination.
	- `labels: ["in_progress"]`: retrieve only issues with *in_progress* label
	- `states: OPEN`: retrieve only open issues
	- `orderBy: { field: UPDATED_AT, direction: DESC }`: order the retrieved issues by the UPDATED_AT field in descending order, in other words most recently updated first.

At the time of writing, this returns:

```json
{
  "data": {
    "repository": {
      "issues": {
        "edges": [
          {
            "node": {
              "title": "docs for github graph api",
              "url": "https://github.com/ccozens/learning_blog/issues/24",
              "body": "",
              "comments": {
                "edges": []
              }
            }
          }
        ]
      }
    }
  }
}
```

7. Transfer to `src/routes/+pages.server.ts`, so that this query runs on the server on the homepage:

```typescript +page.server.ts
import { ACTION_SECRET } from '$env/static/private';
import type { PageServerLoad } from './$types';
import type { GitHubIssue } from '$lib/types';

const query = `query issues_in_progress {
  repository(owner: "ccozens", name: "learning_blog") {
    issues(first: 10, labels: ["in_progress"], states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {
      edges {
        node {
          title
          url
          body
          comments(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }) {
            edges {
              node {
                body
              }
            }
          }
        }
      }
    }
  }
}
`;
```

8. Below that, add the actual [sveltekit load function](https://kit.svelte.dev/docs/load) that makes data available to pages via the `data` prop :

```typescript
export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `bearer ${ACTION_SECRET}`
		},
		body: JSON.stringify({ query })
	});

	const data: {
		repository: {
			issues: {
				edges: {
					node: GitHubIssue;
				}[];
			};
		};
	} = await res.json();

	return {
		issues: data
	};
};
```

9. Now create a component: `src/lib/components/GitHubIssuesInProgress.svelte`:

```typescript GitHubIssuesInProgress.svelte
<script lang="ts">
	import type { GitHubIssue } from '$lib/types';

	// api call is in src/routes/+page.server.ts
	export let issues: GitHubIssue[] = [];
	// filter issues for open issues
	const openIssues = issues.filter((issue: GitHubIssue) => issue.state === 'open');
	// filter data.issues for labels = in_progress
	const issuesInProgress: GitHubIssue[] = openIssues.filter((issue: GitHubIssue) =>
		issue.labels.some((label) => label.name === 'in_progress')
	);
</script>

{#if issuesInProgress.length === 0}
	<p>No issues in progress</p>
{:else}
	<h2>Currently working on</h2>

	{#each issuesInProgress as issue}
		<a class="issue" href={issue.html_url} target="_blank">{issue.title}</a>
	{/each}
{/if}

<style>
	.issue::before {
		content: '👉 ';
	}

	.issue {
		display: block;
		margin-bottom: 1rem;
		text-decoration: none;
	}
</style>
```

Note:
- this has logic in the [script block](https://svelte.dev/docs/svelte-components#script) to filter the returned issues for in progress and open state. This is because, while the query works perfectly in altair, it returns all issues in sveltekit. I've no idea why.
- The markup section has an [if logic block](https://svelte.dev/docs/logic-blocks#if) that only renders if there are issues in progress, and an [each logic block](https://svelte.dev/docs/logic-blocks#each) that shows each issue as a link to the issue.
- the [style block](https://svelte.dev/docs/svelte-components#style) contains a custom bullet and some simple CSS.

10. Render the component! In`src/+page.svelte`, create a prop to access the data and define the component:

```typescript
<script lang="ts">
	import GitHubIssuesInProgress from '$lib/components/GitHubIssuesInProgress.svelte';
	import type { GitHubIssue } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let issues: GitHubIssue[] = data.issues;
</script>

<h1>You're ready: start doing</h1>

<GitHubIssuesInProgress {issues} />
```

<details><summary>A note on the type definitions</summary>
Note here that I created some types from a complete GitHub issues and stored in `src/lib/types/gitHubIssue.ts`:

```typescript
export interface GitHubIssue {
	url: string;
	repository_url: string;
	labels_url: string;
	comments_url: string;
	events_url: string;
	html_url: string;
	id: number;
	node_id: string;
	number: number;
	title: string;
	user: GitHubUser;
	labels: GitHubLabel[];
	state: string;
	locked: boolean;
	assignee: GitHubUser;
	assignees: GitHubUser[];
	milestone: GitHubMilestone | null;
	comments: number;
	created_at: string;
	updated_at: string;
	closed_at: string | null;
	author_association: string;
	active_lock_reason: string | null;
	body: string;
	reactions: GitHubReactions;
	timeline_url: string;
	performed_via_github_app: string | null;
	state_reason: string | null;
}

export interface GitHubUser {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

export interface GitHubLabel {
	id: number;
	node_id: string;
	url: string;
	name: string;
	color: string;
	default: boolean;
	description: string;
}

export interface GitHubMilestone {
	// Define the properties for milestone if needed
}

export interface GitHubReactions {
	url: string;
	total_count: number;
	'+1': number;
	'-1': number;
	laugh: number;
	hooray: number;
	confused: number;
	heart: number;
	rocket: number;
	eyes: number;
}
```

In the same folder I have an `index.ts` that re-exports all these:

```typescript index.ts
// github types
export * from './githubIssue';
```

</details>

10. voila! And now to refactor for versatility:

```typescript +page.server.ts
import { ACTION_SECRET } from '$env/static/private';
import type { PageServerLoad } from './$types';
import type { GitHubIssue } from '$lib/types';

const owner = 'ccozens';
const name = 'learning_blog';
const first = 10;
const labels = 'in_progress';
const states = 'OPEN';
const orderByField = 'UPDATED_AT';
const orderByDirection = 'DESC';

const query = `query issues_in_progress {
  repository(owner: "${owner}", name: "${name}") {
    issues(first: ${first}, labels: ["${labels}"], states: ${states}, orderBy: { field: ${orderByField}, direction: ${orderByDirection} }) {
      edges {
        node {
          title
          url
          body
          comments(first: ${first}, orderBy: { field: ${orderByField}, direction: ${orderByDirection} }) {
            edges {
              node {
                body
              }
            }
          }
        }
      }
    }
  }
}
`;

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `bearer ${ACTION_SECRET}`
		},
		body: JSON.stringify({ query })
	});

	const data: {
		repository: {
			issues: {
				edges: {
					node: GitHubIssue;
				}[];
			};
		};
	} = await res.json();

	return {
		issues: data
	};
};
```

Ideally I would have updated `+page.svelte` so the consts were declared there and passed across, but I want to move on to other parts of the app and I don't envisage this as a full UI where I can edit the data shown from the website - I just want to see the issues.
