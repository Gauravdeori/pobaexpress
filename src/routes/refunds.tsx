import { createFileRoute } from "@tanstack/react-router";

import { Clause, ContactDetails, LegalLayout, Points } from "@/components/poba/LegalLayout";

const title = "Refund & Cancellation Policy — Poba Express";
const description =
  "How cancellations and refunds work for food, medicine and cake orders placed through Poba Express.";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      intro="This Refund & Cancellation Policy governs all orders placed through Poba Express for food, medicine, cake, and other delivery services. By placing an order, customers agree to this policy."
    >
      <Clause title="1. Order Cancellation by Customer">
        <p className="font-medium text-primary">Before restaurant/store acceptance</p>
        <p>
          Customers may cancel their order without any cancellation fee if the restaurant or store
          has not yet accepted or started preparing the order.
        </p>
        <p className="pt-2 font-medium text-primary">After restaurant/store acceptance</p>
        <p>
          Once the restaurant, pharmacy, bakery, or other merchant has accepted or started preparing
          the order, cancellation may not be possible.
        </p>
        <p>
          If cancellation is permitted after acceptance, any applicable charges will be communicated
          to the customer.
        </p>
      </Clause>

      <Clause title="2. Order Cancellation by Poba Express">
        <p>Poba Express may cancel an order if:</p>
        <Points
          items={[
            "The restaurant or store is unable to fulfill the order.",
            "The ordered item is unavailable.",
            "Severe weather, natural disasters, strikes, or other events beyond reasonable control prevent delivery.",
            "The delivery address is incorrect, incomplete, or inaccessible.",
            "Fraudulent or suspicious activity is detected.",
          ]}
        />
        <p>Where applicable, eligible refunds will be processed in accordance with this policy.</p>
      </Clause>

      <Clause title="3. Refund Eligibility">
        <p>Refunds may be considered where appropriate, including situations such as:</p>
        <Points
          items={[
            "The order was paid for but was not delivered.",
            "The wrong order was delivered due to an error by the restaurant or delivery process.",
            "Duplicate payment was made.",
            "The restaurant could not prepare the order after accepting it.",
          ]}
        />
        <p>Each request will be reviewed on its own facts.</p>
      </Clause>

      <Clause title="4. Non-Refundable Situations">
        <p>Refunds may not be available if:</p>
        <Points
          items={[
            "The customer provides an incorrect delivery address or contact details.",
            "The customer is unavailable to receive the order after reasonable delivery attempts.",
            "The customer changes their mind after food or other perishable items have been prepared.",
            "Minor delays occur because of traffic, weather, or similar circumstances beyond reasonable control.",
          ]}
        />
      </Clause>

      <Clause title="5. Damaged or Missing Items">
        <p>
          If an order is received with missing or damaged items, the customer should notify Poba
          Express as soon as reasonably possible after delivery.
        </p>
        <p>
          Poba Express will investigate the issue with the relevant restaurant or merchant before
          deciding on an appropriate resolution.
        </p>
      </Clause>

      <Clause title="6. Refund Method">
        <p>
          Approved refunds will generally be issued through the original payment method used by the
          customer.
        </p>
        <p>
          Where cash payments are involved, refunds may be made through another mutually agreed
          method.
        </p>
      </Clause>

      <Clause title="7. Processing Time">
        <p>
          Approved refunds are generally processed within 5–7 business days, although actual credit
          timelines may depend on the customer&apos;s payment provider or bank.
        </p>
      </Clause>

      <Clause title="8. Customer Support">
        <p>For refund or cancellation assistance, customers may contact:</p>
        <ContactDetails />
      </Clause>

      <Clause title="9. Changes to This Policy">
        <p>
          Poba Express reserves the right to update or modify this Refund &amp; Cancellation Policy
          from time to time. The latest version will apply from the date it is published.
        </p>
      </Clause>

      <Clause title="Acceptance">
        <p>
          By placing an order through Poba Express, customers acknowledge that they have read and
          agree to this Refund &amp; Cancellation Policy.
        </p>
      </Clause>
    </LegalLayout>
  );
}
