<script lang="ts">
	import { page } from '$app/stores';
	import type { NavItem } from '$lib/types';

	export let navItems: NavItem[] = [];
	$: currentPath = $page.route.id;
	$: activePath = currentPath === '/posts/tags' ? '/tags' : currentPath;
</script>

<nav>
	<ul class="navItems">
		{#each navItems as navItem}
			<li class="navItem" class:active={activePath !== '/' && activePath === navItem.path}>
				<a href={navItem.path}> {navItem.name}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.navItems {
		margin-bottom: 2rem;
		padding: 0;
		list-style: none;
	}
	.navItem {
		display: inline-block;
		margin-right: 1rem;
		cursor: pointer;
	}
	.active {
		background-color: yellow;
	}
</style>
