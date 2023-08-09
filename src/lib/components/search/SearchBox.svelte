<script lang="ts">
	export let placeholder: string = 'search';
	export let search: string = '';
	export let isFocused: Boolean = false;
	export let clearSearch = () => {};
	export let keybind: string = '';

	// create key binding to focus input
	const focusOnSearch = (event: KeyboardEvent) => {
		if (!isFocused && event.key === keybind && event.metaKey) {
			event.preventDefault();
			isFocused = true;
		}
	};

	const cancelSearch = (event: KeyboardEvent) => {
		if (isFocused && event.key === 'Escape') {
			clearSearch();
		}
	};

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
