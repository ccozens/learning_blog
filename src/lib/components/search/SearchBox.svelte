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

	// create key binding to clear search
	export const cancelSearch = (event: KeyboardEvent) => {
		if (isFocused && event.key === 'Escape') {
			clearSearch();
		}
	};

	// clear search and blur input
	export function clearSearch() {
		search = '';
		isFocused = false;
	}

	// give focus to input when isFocused=true
	$: if (isFocused) {
		const input = document.querySelector('input');
		input?.focus();
	} else {
		const input = document.querySelector('input');
		input?.blur();
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
