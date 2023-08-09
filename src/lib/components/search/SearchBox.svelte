<script lang="ts">
	export let placeholder: string = 'search';
	export let search: string = '';
	export let isFocused: Boolean = false;
	export let keybind: string = '';

	// create key binding to focus input
	export const focusOnSearch = (event: KeyboardEvent) => {
		if (!isFocused && event.key === keybind && event.metaKey) {
			event.preventDefault();
			isFocused = true;
		}
	};

	export const cancelSearch = (event: KeyboardEvent) => {
		if (isFocused && event.key === 'Escape') {
			clearSearch();
		}
	};
	export function clearSearch() {
		search = '';
		isFocused = false;
		blurSearch(node);
	}
	// select SearchBox node
	let node: HTMLInputElement | null = null;
	$: if (isFocused) {
		node = document.querySelector('input');
	}

	// svelte action to clear searcg, set isFocused to false, and blur input
	function blurSearch(node: HTMLInputElement | null) {
		if (!isFocused) {
			node?.blur();
		}
	}

	// give focus to input when isFocused=true
	$: if (isFocused) {
		const input = document.querySelector('input');
		input?.focus();
	}
</script>

<svelte:window on:keydown={focusOnSearch} />

<input
	type="text"
	{placeholder}
	bind:value={search}
	on:focus={() => (isFocused = true)}
	on:blur={() => clearSearch()}
	on:keydown={cancelSearch}
/>
