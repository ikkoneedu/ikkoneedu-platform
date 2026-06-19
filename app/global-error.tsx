"use client";

/**
 * Kök layout hata sınırı.
 * Yalnızca root layout çökerse devreye girer; kendi <html>/<body> sağlar.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="font-sans antialiased">
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            background: "#050C16",
            color: "#E3E2E5",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Bir şeyler ters gitti
          </h1>
          <p style={{ color: "#C4C6CF", maxWidth: "28rem" }}>
            Beklenmeyen bir hata oluştu. Lütfen sayfayı yeniden deneyin.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "#0A2342",
              color: "#E3E2E5",
              padding: "0.625rem 1.25rem",
              cursor: "pointer",
            }}
          >
            Yeniden Dene
          </button>
        </main>
      </body>
    </html>
  );
}
