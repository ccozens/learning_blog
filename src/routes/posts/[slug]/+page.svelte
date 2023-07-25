<script>
    export let data;
    const {content, title, dateFormatted } = data.postData;
    const body = content.html;

</script>

<article>
    <h1>{title}</h1>
    <p>Posted on {dateFormatted}</p>
     {@html body}
</article>