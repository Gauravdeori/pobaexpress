import { createFileRoute, Link } from "@tanstack/react-router";

import { Clause, ContactDetails, LegalLayout, Points } from "@/components/poba/LegalLayout";

const title = "Terms & Conditions — Poba Express";
const description =
  "The terms governing your use of the Poba Express website, app and WhatsApp ordering service.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      intro="Welcome to Poba Express. These Terms & Conditions govern your use of the Poba Express website, mobile application, WhatsApp Business account, and related services. By using our services, you agree to these Terms."
    >
      <Clause title="1. About Poba Express">
        <p>
          Poba Express is a hyperlocal delivery platform that connects customers with independent
          restaurants, bakeries, pharmacies, and other participating merchants for ordering and
          delivery services.
        </p>
      </Clause>

      <Clause title="2. User Eligibility">
        <p>By using our services, you confirm that:</p>
        <Points
          items={[
            "The information you provide is accurate.",
            "You will use the services only for lawful purposes.",
            "You will not misuse or interfere with the operation of the platform.",
          ]}
        />
      </Clause>

      <Clause title="3. Orders">
        <Points
          items={[
            "All orders are subject to acceptance by the participating merchant.",
            "Availability of products may change without notice.",
            "Merchants are responsible for the preparation, quality, ingredients, packaging, and legality of the products they sell.",
          ]}
        />
      </Clause>

      <Clause title="4. Delivery">
        <p>
          Poba Express will make reasonable efforts to deliver orders within the estimated time.
          Delivery times are estimates only and may vary due to traffic, weather, restaurant
          preparation time, or other circumstances beyond our reasonable control.
        </p>
      </Clause>

      <Clause title="5. Pricing">
        <Points
          items={[
            "Prices displayed are generally provided by the merchant.",
            "Delivery fees, taxes, and other applicable charges will be shown before the customer confirms the order.",
            "Prices may change without prior notice.",
          ]}
        />
      </Clause>

      <Clause title="6. Payments">
        <p>Payments may be made using the payment methods made available by Poba Express.</p>
        <p>
          Customers are responsible for ensuring sufficient funds and accurate payment information.
        </p>
      </Clause>

      <Clause title="7. Cancellations & Refunds">
        <p>
          Cancellations and refunds shall be handled in accordance with the{" "}
          <Link to="/refunds" className="font-medium text-accent hover:underline">
            Poba Express Refund &amp; Cancellation Policy
          </Link>
          , which forms part of these Terms.
        </p>
      </Clause>

      <Clause title="8. Customer Responsibilities">
        <p>Customers agree to:</p>
        <Points
          items={[
            "Provide accurate delivery details.",
            "Be available to receive the order.",
            "Treat delivery partners respectfully.",
            "Comply with applicable laws.",
          ]}
        />
      </Clause>

      <Clause title="9. Merchant Responsibility">
        <p>Restaurants, pharmacies, bakeries, and other merchants are solely responsible for:</p>
        <Points
          items={[
            "Food or product quality.",
            "Hygiene and safety.",
            "Compliance with applicable laws and licences.",
            "Accuracy of menus and product descriptions.",
          ]}
        />
      </Clause>

      <Clause title="10. Delivery Partner Responsibility">
        <p>
          Delivery partners are responsible for the safe and timely delivery of orders but are not
          responsible for the preparation or quality of the products.
        </p>
      </Clause>

      <Clause title="11. Limitation of Liability">
        <p>
          To the extent permitted by applicable law, Poba Express shall not be liable for indirect,
          incidental, special, or consequential losses arising from the use of its platform.
        </p>
        <p>Nothing in these Terms limits liability where such limitation is prohibited by law.</p>
      </Clause>

      <Clause title="12. Intellectual Property">
        <p>
          The name Poba Express, logos, trademarks, website content, graphics, software, and related
          materials are owned by or licensed to Poba Express. They may not be copied, modified, or
          used without prior written permission.
        </p>
      </Clause>

      <Clause title="13. Privacy">
        <p>
          Your personal information will be handled in accordance with the{" "}
          <Link to="/privacy" className="font-medium text-accent hover:underline">
            Poba Express Privacy Policy
          </Link>
          .
        </p>
      </Clause>

      <Clause title="14. Suspension or Termination">
        <p>
          Poba Express may suspend or terminate access to its services where a user violates these
          Terms, engages in fraudulent activity, or uses the platform unlawfully.
        </p>
      </Clause>

      <Clause title="15. Force Majeure">
        <p>
          Poba Express shall not be responsible for delays or failures caused by events beyond its
          reasonable control, including natural disasters, government actions, internet outages,
          strikes, or severe weather.
        </p>
      </Clause>

      <Clause title="16. Changes to These Terms">
        <p>
          Poba Express may update these Terms &amp; Conditions from time to time. The revised
          version will become effective when published on our website or application.
        </p>
      </Clause>

      <Clause title="17. Governing Law">
        <p>These Terms &amp; Conditions shall be governed by the laws of India.</p>
        <p>
          Any dispute shall first be resolved through mutual discussion. If unresolved, it shall be
          subject to the jurisdiction of the competent courts in Dhemaji District, Assam, unless
          otherwise required by applicable law.
        </p>
      </Clause>

      <Clause title="18. Contact Us">
        <ContactDetails />
      </Clause>

      <Clause title="Acceptance">
        <p>
          By accessing or using Poba Express, you confirm that you have read, understood, and agree
          to be bound by these Terms &amp; Conditions.
        </p>
      </Clause>
    </LegalLayout>
  );
}
