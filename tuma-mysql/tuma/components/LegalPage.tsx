import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import Alert from "./ui/Alert";

/**
 * Shared shell for the terms and privacy pages, so the two can't drift into
 * looking like different products.
 */
export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <>
      <SiteHeader />

      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display text-3xl sm:text-4xl tracking-[-0.03em]">
          {title}
        </h1>
        <p className="mt-4 text-[15px] text-ink-500 leading-relaxed">{intro}</p>

        <Alert tone="info" title="Prototype" className="mt-6">
          Tuma is a demonstration build. This page describes how the prototype
          behaves today — it is not a legal agreement, and it should be replaced
          before the product handles real customer parcels.
        </Alert>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[15px] text-ink-600 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
