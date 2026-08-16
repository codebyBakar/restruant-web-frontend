import { Link } from "react-router-dom";
import { ArrowLeft } from "phosphor-react";
import { useSettings } from "../hooks/useSettings.js";

export default function TermsConditions() {
  const { settings } = useSettings();
  const siteName = settings?.siteName || "Pratha";
  const contactEmail = settings?.email || "hello@pratha.com";

  return (
    <div className="container" style={{ padding: "150px 24px 90px", maxWidth: 760 }}>
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, marginBottom: 24, color: "var(--ink-soft)" }}>
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="eyebrow" style={{ marginBottom: 10 }}>Legal</div>
      <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", marginBottom: 35 }}>Terms &amp; Conditions</h1>
      {/* <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 36 }}>
        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p> */}

      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using the {siteName} website, you agree to be bound by these Terms &amp; Conditions.
            If you do not agree with any part of these terms, please do not use our website or services.
          </p>
        </Section>

        <Section title="2. About Our Service">
          <p>
            {siteName} is a restaurant offering food for delivery and pickup. We provide an online menu so you
            can browse our dishes, build an order and place it for collection or delivery. We may update the
            menu, prices, opening hours and service areas at any time without prior notice.
          </p>
        </Section>

        <Section title="3. Orders &amp; Pricing">
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>All prices are shown in our selected currency and may include applicable taxes and delivery fees, which are displayed before you confirm your order.</li>
            <li>An order is only confirmed once you complete checkout and receive an order number.</li>
            <li>We reserve the right to refuse or cancel an order in cases of error, unavailability, suspected fraud or any other legitimate reason.</li>
            <li>Promotional deals and discount codes are subject to their stated terms and may be withdrawn at any time.</li>
          </ul>
        </Section>

        <Section title="4. Payment">
          <p>
            We accept cash on delivery/pickup and online bank transfer. For online payments, your order remains
            pending until we confirm receipt of your payment. If a payment cannot be verified, we may cancel the
            order and contact you.
          </p>
        </Section>

        <Section title="5. Delivery &amp; Pickup">
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Delivery times are estimates and may vary due to traffic, weather or order volume.</li>
            <li>It is your responsibility to provide a correct delivery address and contact number.</li>
            <li>For pickup orders, please collect your food within the stated pickup window; food quality cannot be guaranteed after that time.</li>
          </ul>
        </Section>

        <Section title="6. Allergies &amp; Dietary Needs">
          <p>
            We prepare food in a kitchen that handles gluten, dairy, nuts and other allergens. While we do our
            best to describe ingredients accurately, we cannot guarantee that any dish is free from allergens.
            Please inform us of any allergies before ordering, and contact us directly if you have concerns.
          </p>
        </Section>

        <Section title="7. User Conduct">
          <p>
            You agree not to misuse our website — for example, by attempting to interfere with its operation,
            submitting false orders, or using automated tools to place orders or access data. We may suspend
            access for users who violate these terms.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content on this website — including text, images, logos, menu descriptions and design — is the
            property of {siteName} or its licensors and is protected by copyright and other laws. You may not
            reproduce or use it without our written permission.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, {siteName} shall not be liable for any indirect,
            incidental or consequential damages arising from your use of the website or our food service. Our
            total liability in connection with any order shall not exceed the amount you paid for that order.
          </p>
        </Section>

        <Section title="10. Changes to These Terms">
          <p>
            We may revise these Terms &amp; Conditions at any time. The latest version will always be available
            on this page. Continued use of the website after changes are posted means you accept the updated
            terms.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These terms are governed by the laws of the jurisdiction in which {siteName} operates, without
            regard to its conflict-of-law provisions.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            Questions about these Terms &amp; Conditions? Contact us at{" "}
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
