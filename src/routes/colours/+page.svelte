<script lang="ts">
	import FilterableList from './FilterableList.svelte';
	import { colours } from './Colours';
	import { getContrastRatio } from './GetContrastRatio';

	function textContrast(colour: string) {
		let contrast = getContrastRatio(colour, 'rgb(0, 0, 0)');
		return contrast ? 'black' : 'white';
	}
</script>

<FilterableList colourData={colours} field="both" let:item={row}>
	<header slot="header" class="row">
		<span class="colour" />
		<span class="name">name</span>
		<span class="hex">hex</span>
		<span class="rgb">rgb</span>
		<span class="hsl">hsl</span>
	</header>

	<div class="row" style="--rowBackgroundColor: {row.rgb}; --textColour: {textContrast(row.rgb)};">
		<span class="colour" style="background-color: {row.hex}" />
		<span class="name">{row.name}</span>
		<span class="hex">{row.hex}</span>
		<span class="rgb">{row.rgb}</span>
		<span class="hsl">{row.hsl}</span>
	</div>
</FilterableList>

<style>
	.row {
		display: grid;
		align-items: center;
		grid-template-columns: 2em 4fr 3fr;
		gap: 1em;
		margin: 0.2em 0;
		padding: 0.1em;
		background: var(--rowBackgroundColor, wheat);
		color: var(--textColour, black);
		border-radius: 0.2em;
	}

	header {
		font-weight: bold;
	}

	.row:not(header):hover {
		opacity: 0.5;
		border: solid 1px black;
	}

	.colour {
		aspect-ratio: 1;
		height: 100%;
		border-radius: 0.1em;
	}

	.rgb,
	.hsl {
		display: none;
	}

	@media (min-width: 40rem) {
		.row {
			grid-template-columns: 2em 4fr 3fr 3fr;
		}

		.rgb {
			display: block;
		}
	}

	@media (min-width: 60rem) {
		.row {
			grid-template-columns: 2em 4fr 3fr 3fr 3fr;
		}

		.hsl {
			display: block;
		}
	}
</style>
