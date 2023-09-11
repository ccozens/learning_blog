<!-- script -->
<script lang="ts">
	import Basics from './Basics.svelte';
	import Button from './Button.svelte';
	import ComponentReactivity from './ComponentReactivity.svelte';
	import RangeReactivity from './RangeReactivity.svelte';
</script>

<!-- html -->
<div class="wrapper">
	<Basics />
</div>

<div class="wrapper">
	<p>These colours are defined in the component</p>
	<Button />
</div>

<div class="wrapper">
	<p>Here a prop is passed in</p>
	<Button buttonColor="#00ff3e" />
</div>

<div class="wrapper">
	<RangeReactivity />
</div>

<div class="wrapper">
	<ComponentReactivity />
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
</style>
