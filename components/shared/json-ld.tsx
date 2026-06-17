// Renders a JSON-LD structured-data block. The payload can include
// braider-supplied text (name, bio, city), so escape `<` to neutralize any
// `</script>` break-out before inlining.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
