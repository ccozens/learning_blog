import type { PageLoad } from './$types';

// get all issues from github for this repo
export const load =  (async ({fetch}) => {
    const res = await fetch(`https://api.github.com/repos/ccozens/learning_blog/issues?state=all`);
    const data = await res.json();
    return {
        issues: data
    }
}) satisfies PageLoad;