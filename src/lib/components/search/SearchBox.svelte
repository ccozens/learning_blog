<script lang="ts">
	import { tick } from 'svelte';
	export let placeholder: string = 'search';
	export let search: string = '';
	export let isFocused: Boolean = false;
	export let keybind: string = '';

	// create key binding to focus input
	export const focusOnSearch = (event: KeyboardEvent) => {
		if (typeof window !== 'undefined' && !isFocused && event.key === keybind && event.metaKey) {
			event.preventDefault();
			isFocused = true;
		}
	};

	// create key binding to clear search
	export const cancelSearch = (event: KeyboardEvent) => {
		if (typeof window !== 'undefined' && isFocused && event.key === 'Escape') {
			clearSearch();
		}
	};

	// clear search and blur input
	export const clearSearch = () => {
		// add a 500 ms delay to prevent input from being blurred immediately
		setTimeout(() => {
			search = '';
			isFocused = false;
		}, 500);
	};

	// give focus to input when isFocused=true
	$: if (isFocused && typeof window !== 'undefined') {
		const input = document.querySelector('input');
		input?.focus();
	} else if (typeof window !== 'undefined') {
		const input = document.querySelector('input');
		// add a tick to prevent input from being blurred immediately
		tick().then(() => input?.blur());
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
