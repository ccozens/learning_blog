<!-- script -->
<script lang="ts">
	export let hue = 0;
</script>

<!-- html -->

<input type="range" min="0" max="360" bind:value={hue} />
