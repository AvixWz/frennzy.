import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-lg font-semibold">Mediway</h3>
          <p className="mt-3 text-sm text-muted">
            Trusted medical tourism partner connecting international patients to India&apos;s top hospitals and specialists.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/treatments" className="hover:text-primary">
                Treatments
              </Link>
            </li>
            <li>
              <Link href="/doctors" className="hover:text-primary">
                Doctors
              </Link>
            </li>
            <li>
              <Link href="/hospitals" className="hover:text-primary">
                Hospitals
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Patient Services</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Visa assistance</li>
            <li>Airport pickup</li>
            <li>Interpreter support</li>
            <li>Post-treatment follow-up</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>care@mediway.com</li>
            <li>+91 98765 43210</li>
            <li>New Delhi, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted sm:px-6 lg:px-8">
        Copyright {new Date().getFullYear()} Mediway. All rights reserved.
      </div>
    </footer>
  );
}
