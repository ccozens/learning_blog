
import { ACTION_SECRET } from '$env/static/private';
import type { PageServerLoad } from './$types';
import type { GitHubIssue } from '$lib/types';

const query = `query issues_in_progress {
  repository(owner: "ccozens", name: "learning_blog") {
    issues(first: 10, labels: ["in_progress"]) {
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


export const load: PageServerLoad = async ({ fetch }) => {
    const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `bearer ${ACTION_SECRET}`
        },
        body: JSON.stringify({ query })
    });
    // const data = await res.json();

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
    }
}
