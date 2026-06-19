interface JsonLdProps {
  /** Tek bir JSON-LD nesnesi veya birden fazlası. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * JSON-LD structured data'yı sayfaya gömer (script[type=application/ld+json]).
 * Server component; herhangi bir sayfada `<JsonLd data={...} />` ile kullanılır.
 */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify çıktısı kontrollü veridir (kullanıcı girdisi değil).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
