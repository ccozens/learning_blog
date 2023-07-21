<script lang="ts">
    import { page } from "$app/stores"

  </script>

{#if $page.data.session}
<div class="whole">
	<h1>Test</h1>
</div>

{:else}
    <div>
        <h1>Test</h1>
    </div>
{/if}
<style>
	.whole {
		min-width: 100vw;
		min-height: 100vh;
		background: #1e1e30;
		background: -webkit-radial-gradient(circle, #1e1e30, #11111f);
		background: -moz-radial-gradient(circle, #1e1e30, #11111f);
		background: radial-gradient(circle, #1e1e30, #11111f);
	}
</style>
