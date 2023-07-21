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
