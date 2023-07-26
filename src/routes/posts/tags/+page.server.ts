import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    // access allTags from parent layout
    const { allTags } = await parent();

    return {allTags};
}