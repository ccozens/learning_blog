import type { NavItem } from '$lib/types';

export async function getAllPaths(): Promise<NavItem[]> {
	// return all paths with .svelte files in
	const modules = import.meta.glob('/src/routes/**/*.svelte');
	const rawPaths: string[] = [];

	for (const path in modules) {
		// skip item if does not contain +page
		if (!path.includes('+page')) continue;
		// skip item if contains [
		if (path.includes('[')) continue;
		// split path into array
		const formattedPath = path.split('/');
		// get second to last item in array
		const item = formattedPath.at(-2);
		// check for item
		if (!item) continue;
		// add path to array,
		rawPaths.push(item);
	}

	const navItems: NavItem[] = rawPaths.map((navItem) => ({
		name: navItem,
		path: '/' + navItem
	}));

	// update first entry to be home
	navItems[0] = { name: 'Home', path: '/' };
	// capitalise first letter of each item
	navItems.forEach((navItem) => {
		navItem.name = navItem.name.charAt(0).toUpperCase() + navItem.name.slice(1);
	});
	return navItems;
}
