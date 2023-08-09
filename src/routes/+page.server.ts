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

const query = `query {
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

	const gitHubData: {
		data: {
			repository: {
				issues: {
					edges: {
						node: GitHubIssue;
					}[];
				};
			};
		};
	} = await res.json();

	async function parseGitHubData() {
		const issues = gitHubData.data.repository.issues.edges.map((edge) => edge.node);
		return {
			issues
		};
	}

	const issues = await parseGitHubData();
	return {
		issues
	};
};
