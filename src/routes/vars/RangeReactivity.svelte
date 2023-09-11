<script>
	let hue = 0;
</script>

<div style="--theme-color: hsl({hue}, 100%, 50%)">
	<p>This color is dynamically updated</p>
</div>

<input type="range" min="0" max="360" bind:value={hue} />

<style>
	p {
		color: var(--theme-color);
	}

	input {
		width: 50%;
	}
</style>
