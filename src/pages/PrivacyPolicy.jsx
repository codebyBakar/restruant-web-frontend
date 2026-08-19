import { Link } from "react-router-dom";
import { ArrowLeft } from "phosphor-react";
import { useSettings } from "../hooks/useSettings.js";

export default function PrivacyPolicy() {
  const { settings } = useSettings();
  const siteName = settings?.siteName || "Pratha";
  const contactEmail = settings?.email || "hello@pratha.com";

  return (
    <div className="container" style={{ padding: "150px 24px 90px", maxWidth: 760 }}>
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, marginBottom: 24, color: "var(--ink-soft)" }}>
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="eyebrow" style={{ marginBottom: 10 }}>Legal</div>
      <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", marginBottom: 35 }}>Privacy Policy</h1>
      {/* <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 36 }}>
        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p> */}

      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <Section title="1. Introduction">
          <p>
            {siteName} ("we", "our", "us") respects your privacy and is committed to protecting your personal
            data. This Privacy Policy explains what information we collect when you use our website, how we use
            it, and the choices you have. By using our website, you agree to the practices described in this
            policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect information you provide directly to us, including:</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li><strong>Order details</strong> — your name, phone number, email address, delivery address and order contents, needed to process and deliver your order.</li>
            <li><strong>Payment information</strong> — payment method and (for online bank transfers) the paid payment receipt you upload to confirm your order.</li>
            <li><strong>Reservation details</strong> — name, phone and party size when you reserve a table.</li>
            <li><strong>Contact form submissions</strong> — your name, email, phone and message when you contact us.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>To process, confirm and deliver your orders.</li>
            <li>To send you order updates and respond to your enquiries.</li>
            <li>To manage table reservations and contact you about them.</li>
            <li>To improve our menu, service and website experience.</li>
            <li>To comply with legal obligations and prevent fraud.</li>
          </ul>
        </Section>

        <Section title="4. Cookies">
          <p>
            Our website uses an essential cookie to keep you signed in to your admin session and to make the
            site work correctly. We do not use third-party tracking or advertising cookies. You can clear
            cookies at any time through your browser settings; the public website will continue to work without
            them.
          </p>
        </Section>

        <Section title="5. How We Share Your Information">
          <p>
            We do not sell your personal data. We only share information with trusted service providers who help
            us run the website — such as our hosting provider, database service and payment/cloud storage
            providers — and only to the extent necessary to provide our service. We may disclose information if
            required by law or to protect the rights, property or safety of {siteName}, our customers or others.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p>
            We take reasonable technical and organisational measures to protect your information, including
            encrypted connections (HTTPS), hashed passwords and restricted access to customer data. However, no
            method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We keep order and reservation records only as long as needed to fulfil your order, handle queries,
            and meet legal or accounting requirements. You can request deletion of your order history at any
            time from the order tracking page.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your data.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Lodge a complaint with a data protection authority.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            To exercise any of these rights, contact us at <a href={`mailto:${contactEmail}`} style={{ color: "var(--paprika)", fontWeight: 700 }}>{contactEmail}</a>.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            Our website is not directed to children under 13, and we do not knowingly collect personal data from
            children. If you believe a child has provided us with personal data, please contact us and we will
            delete it.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
            updated "Last updated" date. We encourage you to review this page periodically.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have any questions about this Privacy Policy, please reach out to us at{" "}
            <a href={`mailto:${contactEmail}`} style={{ color: "var(--paprika)", fontWeight: 700 }}>{contactEmail}</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 style={{ fontSize: 20, marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: "var(--ink-soft)" }}>{children}</div>
    </section>
  );
}
