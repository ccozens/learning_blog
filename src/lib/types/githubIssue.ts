export interface GitHubIssue {
	title: string;
	url: string;
	body: string;
	comments: {
		edges: {
			node: {
				body: string;
			};
		};
	};
}

export interface GitHubIssuesResponse {
	issues: GitHubIssue[];
}
