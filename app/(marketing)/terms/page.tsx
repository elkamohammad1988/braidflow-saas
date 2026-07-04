import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell, LegalSection } from '@/components/shared/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that govern your use of BraidFlow as a client booking appointments or a braider accepting them.',
  alternates: { canonical: '/terms' }
};

const LAST_UPDATED = 'June 13, 2026';

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated={LAST_UPDATED}
      intro="These Terms of Service (“Terms”) govern your access to and use of BraidFlow. By creating an account or using the service, you agree to these Terms. If you do not agree, do not use BraidFlow."
    >
      <LegalSection title="1. Who we are and what BraidFlow does">
        <p>
          BraidFlow is a booking platform that lets clients discover braiders, book appointments,
          and pay a deposit to confirm a time. Braiders are independent service providers — not
          employees, agents, or partners of BraidFlow. We provide the software that facilitates
          bookings and deposit payments; we are not a party to the service agreement between a
          client and a braider, and we do not provide braiding services ourselves.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility and accounts">
        <p>
          You must be at least 18 years old (or the age of majority where you live) and able to form
          a binding contract to use BraidFlow. You are responsible for the accuracy of the
          information you provide, for keeping your password confidential, and for all activity under
          your account. Notify us promptly of any unauthorized use.
        </p>
      </LegalSection>

      <LegalSection title="3. Bookings and deposits">
        <p>
          To confirm a booking, a client pays a deposit through the platform. The slot is held only
          once the deposit is paid; until then it remains available to others. The deposit is applied
          toward the total price of the service, and the remaining balance is paid directly to the
          braider, typically in person at the appointment. Prices, deposit amounts, durations, and
          availability are set by each braider.
        </p>
      </LegalSection>

      <LegalSection title="4. Payments">
        <p>
          Deposits are processed by Stripe. By paying, you authorize the charge and agree to
          Stripe&apos;s terms. You represent that you are authorized to use the payment method you
          provide. BraidFlow is not responsible for fees your bank or card issuer may apply.
        </p>
      </LegalSection>

      <LegalSection title="5. Cancellations, reschedules, and refunds">
        <p>
          A booking may be rescheduled or cancelled through the platform subject to the braider&apos;s
          policy. When a booking is rescheduled, the existing deposit carries over to the new time. A
          braider may issue a refund of the deposit; whether a deposit is refundable, and on what
          timeline, is determined by the braider&apos;s stated cancellation policy and applicable law.
          BraidFlow facilitates refunds requested through the platform but does not itself guarantee
          any refund.
        </p>
      </LegalSection>

      <LegalSection title="6. No-shows and late arrivals">
        <p>
          Deposits exist to protect braiders from no-shows, which cost a working day. If a client
          fails to attend a confirmed appointment, the braider may retain the deposit in accordance
          with their policy. Clients should arrive on time; braiders should honor confirmed bookings
          or give reasonable notice if they cannot.
        </p>
      </LegalSection>

      <LegalSection title="7. Braider responsibilities">
        <ul>
          <li>Provide accurate listings, pricing, availability, and service descriptions.</li>
          <li>Honor confirmed bookings and communicate promptly about any changes.</li>
          <li>
            Hold any licenses, registrations, and insurance required in your jurisdiction, and
            comply with all applicable health, safety, and tax obligations.
          </li>
          <li>Deliver services professionally and as described.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the platform for any unlawful, fraudulent, or harmful purpose.</li>
          <li>Impersonate others or misrepresent your identity or affiliation.</li>
          <li>Attempt to access accounts or data that are not yours, or probe or disrupt the service.</li>
          <li>Scrape, overload, or interfere with the platform or its security features.</li>
          <li>Post content that is unlawful, abusive, harassing, or infringing.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Reviews and user content">
        <p>
          Clients may leave reviews of completed appointments. Reviews must be honest, based on
          genuine experiences, and free of unlawful or abusive content. You retain ownership of
          content you submit but grant BraidFlow a non-exclusive, royalty-free license to host and
          display it as part of operating the service. We may remove content that violates these
          Terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Intellectual property">
        <p>
          BraidFlow and its logos, design, and software are owned by us and protected by intellectual
          property laws. We grant you a limited, non-exclusive, non-transferable right to use the
          service in accordance with these Terms. You may not copy, modify, or create derivative
          works of the platform except as permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimers">
        <p>
          The platform is provided “as is” and “as available,” without warranties of any kind,
          whether express or implied, including fitness for a particular purpose and
          non-infringement. BraidFlow does not warrant that the service will be uninterrupted or
          error-free. Because braiders are independent providers, BraidFlow does not guarantee the
          quality, safety, or legality of any service booked through the platform.
        </p>
      </LegalSection>

      <LegalSection title="12. Limitation of liability">
        <p>
          To the maximum extent permitted by law, BraidFlow will not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or for lost profits or data,
          arising from your use of the service. Our total liability for any claim relating to the
          service will not exceed the greater of the amount you paid to BraidFlow in the three months
          before the claim, or fifty U.S. dollars.
        </p>
      </LegalSection>

      <LegalSection title="13. Indemnification">
        <p>
          You agree to indemnify and hold BraidFlow harmless from claims, losses, and expenses
          (including reasonable legal fees) arising out of your use of the service, your content, or
          your violation of these Terms or the rights of others.
        </p>
      </LegalSection>

      <LegalSection title="14. Termination">
        <p>
          You may stop using BraidFlow and close your account at any time. We may suspend or terminate
          access if you violate these Terms or to protect the platform and its users. Provisions that
          by their nature should survive termination — such as payment obligations, disclaimers, and
          limitations of liability — will survive.
        </p>
      </LegalSection>

      <LegalSection title="15. Changes to these Terms">
        <p>
          We may update these Terms from time to time. When we do, we will revise the “Last updated”
          date above and, for material changes, provide a more prominent notice. Continued use of the
          service after changes take effect constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="16. Governing law and disputes">
        <p>
          These Terms are governed by the laws of the jurisdiction in which BraidFlow operates,
          without regard to conflict-of-law rules. You agree to first contact us to attempt to
          resolve any dispute informally before pursuing formal action.
        </p>
      </LegalSection>

      <LegalSection title="17. Contact">
        <p>
          Questions about these Terms? Email{' '}
          <a href="mailto:legal@braidflow.app">legal@braidflow.app</a>. See also our{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
