<!-- script -->
<script lang="ts">
	let textColor = '#ff3e00';
</script>

<!-- html -->

<input type="color" bind:value={textColor} />

<div style="--theme-color: {textColor}">
	<p>This color is set using a CSS variable</p>
</div>

<style>
	p {
		color: var(--theme-color);
	}
</style>
