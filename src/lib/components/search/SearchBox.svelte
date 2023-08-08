<script lang="ts">
	export let placeholder: string = 'search';
	export let search: string = '';
	export let isFocused: Boolean = false;
	export let clearSearch = () => {};

	// create key binding to focus input
	const focusOnSearch = (event: KeyboardEvent) => {
		if (!isFocused && event.key === 'k' && event.metaKey) {
			event.preventDefault();
			isFocused = true;
		}
	};

	const cancelSearch = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			clearSearch();
		}
	};

	// give focus to input when isFoxused=true
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
