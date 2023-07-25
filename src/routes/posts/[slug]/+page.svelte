<script>
    export let data;
    const {content, title, dateFormatted, tags } = data.postData;
    const body = content.html;

</script>

<article>
    <h1>{title}</h1>
    <p>Posted on {dateFormatted}</p>
     {@html body}
</article>



{#if tags.length}
  <aside>
    <h2>Posted in:</h2>
    <ul>
      {#each tags as tag}
        <li>
          <a href="/blog/tag/{tag}">
            {tag}
          </a>
        </li>
      {/each}
    </ul>
  </aside>
{/if}