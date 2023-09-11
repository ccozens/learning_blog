<!-- script -->
<script lang="ts">
	import Slider from './Slider.svelte';

	let hue = 99;
</script>

<!-- html -->

<p style:hue style="--theme-color: hsl({hue}, 100%, 50%)">
	Hue: {hue}
</p>
<Slider bind:hue />
<p style:hue style="--theme-color: hsl({hue}, 100%, 50%)">
	This colour is set by an external component
</p>

<style>
	p {
		color: var(--theme-color);
	}
</style>
