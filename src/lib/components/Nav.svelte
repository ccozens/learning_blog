<script lang="ts">
	import { page } from '$app/stores';

	$: currentPath = $page.route.id;
	export let navItems = [];
	export let currentPath = '';
</script>

<nav>
	<ul class="navItems">
		{#each navItems as navItem}
			<li class="navItem" class:active={currentPath === navItem.path}>
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
