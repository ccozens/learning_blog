<!-- script -->
<script lang="ts">
	export let buttonColor = '#e97aeb';
</script>

<!-- html -->

<button style="--button-color: {buttonColor}">Button</button>
<button style:--button-color="#568af1">Button</button>
<button style:--button-color={buttonColor}>Button</button>

<style>
	button {
		background-color: var(--button-color);
	}
</style>
