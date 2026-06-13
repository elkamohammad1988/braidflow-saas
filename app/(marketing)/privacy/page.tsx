import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell, LegalSection } from '@/components/shared/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How BraidFlow collects, uses, and protects your information when you book or accept appointments.'
};

const LAST_UPDATED = 'June 13, 2026';

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated={LAST_UPDATED}
      intro="BraidFlow (“BraidFlow”, “we”, “us”) is a booking platform that connects clients with braiders and protective-style stylists. This policy explains what information we collect, why we collect it, and the choices you have. It applies to our website and services."
    >
      <LegalSection title="Information we collect">
        <ul>
          <li>
            <strong className="text-ink">Account information.</strong> When you sign up we
            collect your name, email address, and whether you join as a client or a braider, plus
            the password you set (stored only as a salted hash by our authentication provider).
          </li>
          <li>
            <strong className="text-ink">Profile and business details.</strong> Braiders provide
            information such as their display name, location, services, pricing, and availability so
            clients can find and book them.
          </li>
          <li>
            <strong className="text-ink">Booking information.</strong> When a booking is made we
            collect the service, date and time, any notes you add, and the parties involved.
          </li>
          <li>
            <strong className="text-ink">Payment information.</strong> Deposits are processed by
            Stripe. Your full card number is sent directly to Stripe and is never stored on our
            servers. We retain only non-sensitive payment metadata (such as amount, status, and
            Stripe identifiers) needed to track bookings and refunds.
          </li>
          <li>
            <strong className="text-ink">Technical data.</strong> Like most services, we and our
            providers automatically receive basic technical information (such as IP address and
            browser type) to keep the service secure, working, and free from abuse.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use information">
        <ul>
          <li>Create and manage your account and authenticate you.</li>
          <li>Enable discovery, booking, deposits, reschedules, cancellations, and refunds.</li>
          <li>Send transactional email — confirmations, reminders, and account notices.</li>
          <li>Prevent fraud and abuse, enforce our Terms, and keep the platform secure.</li>
          <li>Comply with legal obligations and resolve disputes.</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not use it for third-party
          advertising.
        </p>
      </LegalSection>

      <LegalSection title="How we share information">
        <p>We share information only as needed to run the service:</p>
        <ul>
          <li>
            <strong className="text-ink">Between the parties to a booking.</strong> A braider can
            see the name, contact details, and booking details of clients who book with them, and
            vice-versa, so the appointment can happen.
          </li>
          <li>
            <strong className="text-ink">Service providers.</strong> We rely on Supabase
            (database, authentication, and hosting), Stripe (payments), Resend (transactional
            email), and Vercel (application hosting). They process data on our behalf under their
            own terms and security commitments.
          </li>
          <li>
            <strong className="text-ink">Legal and safety.</strong> We may disclose information if
            required by law, or to protect the rights, property, or safety of our users or the
            public.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Payments">
        <p>
          Card payments are handled by Stripe, a PCI-DSS Level 1 certified payment processor. When
          you pay a deposit, your card details are transmitted directly to Stripe over an encrypted
          connection. BraidFlow does not see or store your full card number, CVC, or expiry. See
          Stripe&apos;s own privacy policy for details on how it processes payment data.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and sessions">
        <p>
          We use cookies that are strictly necessary to sign you in and keep you signed in
          securely. We do not use advertising or cross-site tracking cookies. If we add optional
          analytics in the future, we will update this policy.
        </p>
      </LegalSection>

      <LegalSection title="Data retention">
        <p>
          We keep your information for as long as your account is active or as needed to provide
          the service. Booking and payment records may be retained longer where required for tax,
          accounting, dispute resolution, or legal compliance. You can ask us to delete your
          account, after which we remove or anonymize personal data that we are not required to
          keep.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data is encrypted in transit. Access to data is restricted at the database level with
          row-level security so that, for example, clients see only their own bookings and braiders
          see only their own business data. Privileged operations run server-side with least
          privilege. No system is perfectly secure, but we work to protect your information using
          industry-standard safeguards.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export, or delete
          your personal information, and to object to or restrict certain processing. You can update
          most details from your account, or contact us at{' '}
          <a href="mailto:privacy@braidflow.app">privacy@braidflow.app</a> and we will respond within
          a reasonable time.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          BraidFlow is not directed to children under 16, and we do not knowingly collect personal
          information from them. If you believe a child has provided us information, contact us and
          we will delete it.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy from time to time. When we do, we will revise the “Last updated”
          date above and, for material changes, provide a more prominent notice.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy? Email{' '}
          <a href="mailto:privacy@braidflow.app">privacy@braidflow.app</a>. See also our{' '}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
