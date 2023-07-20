<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;


</script>

<div class="heading-container">
	<h1 class="standout-heading">You're ready. Start making stuff.</h1>
</div>

<div>

	<h2>working on</h2>

	</div>

<style>
	/* Styling for the container of the heading */
	.heading-container {
		background: radial-gradient(
			at center top,
			rgb(180, 83, 9),
			rgb(253, 186, 116),
			rgb(159, 18, 57)
		);
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
		text-align: center;
	}

	.standout-heading {
		colour: #333; /* Dark writing colour */
		font-size: 36px;
		text-transform: uppercase;
		letter-spacing: 2px;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Creating a 3D effect with a dark shadow */
	}
</style>
