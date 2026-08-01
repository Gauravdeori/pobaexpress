import { createFileRoute } from "@tanstack/react-router";

import { Clause, ContactDetails, LegalLayout, Points } from "@/components/poba/LegalLayout";

const title = "Privacy Policy — Poba Express";
const description =
  "How Poba Express collects, uses, stores and protects your personal information.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="Welcome to Poba Express. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website, mobile application, WhatsApp Business account, or any other services provided by Poba Express."
    >
      <Clause title="1. Information We Collect">
        <p>We may collect:</p>
        <Points
          items={[
            "Full name",
            "Mobile number",
            "Email address",
            "Delivery address",
            "Payment details (excluding confidential banking credentials)",
            "Order history",
            "Device and location information (where permission is granted)",
            "Customer support communications",
          ]}
        />
      </Clause>

      <Clause title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <Points
          items={[
            "Process and deliver your orders",
            "Coordinate with restaurants and delivery partners",
            "Provide customer support",
            "Send order updates and notifications",
            "Improve our services",
            "Prevent fraud and misuse",
            "Comply with legal obligations",
          ]}
        />
      </Clause>

      <Clause title="3. Sharing of Information">
        <p>We may share your information only with:</p>
        <Points
          items={[
            "Partner restaurants",
            "Delivery partners",
            "Payment service providers",
            "Government authorities where legally required",
          ]}
        />
        <p className="font-medium text-primary">
          We do not sell your personal information to third parties.
        </p>
      </Clause>

      <Clause title="4. Data Security">
        <p>
          Poba Express takes reasonable administrative, technical, and organizational measures to
          protect your information from unauthorized access, misuse, alteration, or disclosure.
        </p>
      </Clause>

      <Clause title="5. Customer Responsibilities">
        <p>Customers should:</p>
        <Points
          items={[
            "Provide accurate delivery information.",
            "Keep their account information secure.",
            "Notify us promptly of any unauthorized use.",
          ]}
        />
      </Clause>

      <Clause title="6. Cookies and Similar Technologies">
        <p>
          Our website or application may use cookies or similar technologies to improve user
          experience, remember preferences, and analyze service performance.
        </p>
      </Clause>

      <Clause title="7. Data Retention">
        <p>
          We retain personal information only for as long as necessary to provide our services, meet
          legal requirements, resolve disputes, and maintain business records.
        </p>
      </Clause>

      <Clause title="8. Children's Privacy">
        <p>
          Our services are not intended for children under the age required by applicable law to
          independently use such services. If we learn that personal information has been collected
          from a child without appropriate authorization where required, we will take reasonable
          steps to delete it.
        </p>
      </Clause>

      <Clause title="9. Your Rights">
        <p>Subject to applicable law, you may request to:</p>
        <Points
          items={[
            "Access your personal information.",
            "Correct inaccurate information.",
            "Request deletion of your information where legally permitted.",
            "Withdraw consent where processing is based on consent.",
          ]}
        />
      </Clause>

      <Clause title="10. Changes to This Policy">
        <p>
          Poba Express may update this Privacy Policy from time to time. The revised version will
          become effective from the date it is published.
        </p>
      </Clause>

      <Clause title="11. Contact Us">
        <ContactDetails />
      </Clause>

      <Clause title="Acceptance">
        <p>
          By using Poba Express services, you acknowledge that you have read and understood this
          Privacy Policy and agree to its terms.
        </p>
      </Clause>
    </LegalLayout>
  );
}
