<script>
	import { error } from '@sveltejs/kit';
	export let status;
	export let error;
</script>

<main>
	<h1>Error {status}</h1>
	<p>{error.message}</p>
</main>
