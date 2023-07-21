import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';
import { GITHUB_ID, GITHUB_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = SvelteKitAuth(async () => {
	const authOptions = {
		providers: [
			GitHub({
				clientId: GITHUB_ID,
				clientSecret: GITHUB_SECRET
			})
		],
		secret: AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});