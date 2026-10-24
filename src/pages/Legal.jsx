import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Footer, Header } from '../components/Layout';
import { LEGAL as L } from '../legal';
import { money } from '../utils';

function useFees() {
  const [c, setC] = useState({ fee: 299, singleFee: 149, quickFee: 99 });
  useEffect(() => { api('/config').then(setC).catch(() => {}); }, []);
  return c;
}

function LegalLayout({ title, intro, children }) {
  return (
    <>
      <Header />
      <main className="legal-page">
        <div className="eyebrow"><span /> LEGAL</div>
        <h1>{title}</h1>
        <p className="legal-updated">Effective date: {L.effectiveDate}</p>
        {intro && <p className="legal-intro">{intro}</p>}
        {children}
        <div className="legal-links">
          <Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms & Conditions</Link><Link to="/refund-policy">Refund Policy</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function Terms() {
  const f = useFees();
  return (
    <LegalLayout title="Terms & Conditions" intro={`Welcome to ${L.businessName} (“we”, “us”, “our”). By using ${L.website} (the “Platform”), creating an account, or making a payment, you agree to these Terms. If you do not agree, please do not use the Platform.`}>
      <h2>1. What we do</h2>
      <p>{L.businessName} is an online platform where you can discover properties for rent or sale and schedule property visits. We act only as a facilitator between you and property owners. Any rental or sale agreement is made directly between you and the owner. We do not guarantee that a property is available, or that listing details such as price, size, photos or amenities are complete or error-free.</p>

      <h2>2. Eligibility and your account</h2>
      <p>You must be at least 18 years old and able to enter into a binding contract under Indian law. You sign up with your name, email address and mobile number, and log in using a one-time password (OTP) sent to your email. You must give accurate details and keep your account secure. You are responsible for everything done through your account.</p>

      <h2>3. Fees</h2>
      <p>Fees are in Indian Rupees (INR) and are shown to you before you pay. At the time of writing they are:</p>
      <ul>
        <li><b>Single property visit:</b> {money(f.singleFee)} for one property visit.</li>
        <li><b>Unlimited visit pass:</b> {money(f.fee)}, paid once, covering visits to any number of properties.</li>
        <li><b>Property visit charge:</b> {money(f.quickFee)}, paid on our visit charge page.</li>
      </ul>
      <p>We may change our fees at any time. The fee shown when you pay is the fee that applies. Payments are processed securely by Razorpay; we do not see or store your card, UPI or bank details.</p>

      <h2>4. All payments are non-refundable</h2>
      <div className="legal-callout"><b>Please read carefully:</b> every payment made on the Platform is <b>non-refundable</b>. This includes the single-visit fee, the unlimited visit pass and the property visit charge. No refund is given if you cancel a visit, do not attend, choose not to take a property, or change your mind. The limited exceptions are listed in our <Link to="/refund-policy">Refund Policy</Link>.</div>

      <h2>5. Property visits</h2>
      <ul>
        <li>You choose your preferred date and time, between 8:00 AM and 9:00 PM. A visit is confirmed only after we confirm it with you on WhatsApp or by phone.</li>
        <li>We may ask to reschedule a visit if the owner or our team is unavailable.</li>
        <li>You visit properties at your own risk. Please take reasonable care of your safety and belongings.</li>
        <li>You must not damage, misuse or take anything from a property.</li>
      </ul>

      <h2>6. Brokerage</h2>
      <p>If you finalise a rental or purchase of a property introduced to you through us, a brokerage of <b>{L.brokerage}</b> is payable to {L.businessName} unless we have told you otherwise in writing. Brokerage is not part of the fees in section 3 and is separate from them.</p>

      <h2>7. Acceptable use</h2>
      <p>You agree not to give false information, misuse the Platform, try to interfere with its security, scrape or copy our content, or use it for any unlawful purpose. We may suspend or close accounts that break these Terms.</p>

      <h2>8. Our content</h2>
      <p>The Platform’s design, text, photos, videos and logos belong to {L.businessName} or its licensors. You may not copy or reuse them without our written permission. Links to third parties, such as Instagram or WhatsApp, are provided for convenience, and we are not responsible for their content or policies.</p>

      <h2>9. Limitation of liability</h2>
      <p>To the fullest extent allowed by law, {L.businessName} is not liable for any indirect or consequential loss, for the conduct of property owners or other users, or for the condition, legality or availability of any property. Our total liability to you for any claim relating to the Platform is limited to the amount you paid us for the service in question.</p>

      <h2>10. Changes and termination</h2>
      <p>We may update these Terms from time to time. The date at the top shows when they were last changed. Continuing to use the Platform after a change means you accept the updated Terms. We may suspend or end access to the Platform at any time where needed.</p>

      <h2>11. Governing law</h2>
      <p>These Terms are governed by the laws of India. Courts at {L.jurisdiction} have exclusive jurisdiction over any dispute.</p>

      <h2>12. Contact us</h2>
      <p>Questions about these Terms? Email <a href={`mailto:${L.email}`}>{L.email}</a>.</p>
    </LegalLayout>
  );
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" intro={`${L.businessName} (“we”, “us”) respects your privacy. This policy explains what personal information we collect on ${L.website}, why we collect it, and the choices you have. We handle your data in line with applicable Indian law, including the Digital Personal Data Protection Act, 2023.`}>
      <h2>1. Information we collect</h2>
      <ul>
        <li><b>Account details:</b> your name, email address and mobile number when you sign up, and the one-time passwords (OTPs) used to verify your email.</li>
        <li><b>Visit and booking details:</b> the property you choose, your preferred date and time, any note you write, and the status of your visit.</li>
        <li><b>Payment details:</b> payments are handled by Razorpay. We receive and store only the order ID, payment ID, amount, date and status. We do not receive or store your card, UPI or bank details.</li>
        <li><b>Visit charge page:</b> your name and mobile number when you pay on that page.</li>
        <li><b>Messages:</b> anything you send us on WhatsApp, email or phone.</li>
        <li><b>Technical data:</b> your IP address and browser details (in server logs and for security), and an anonymous visitor ID used to count unique visitors.</li>
      </ul>

      <h2>2. Cookies and browser storage</h2>
      <p>We do not use advertising cookies. We store a few items in your browser so the site works: your login token, properties you save, and small flags such as the anonymous visitor ID. You can clear these in your browser settings, but you may then be logged out.</p>

      <h2>3. Why we use your information</h2>
      <ul>
        <li>To create and secure your account and verify you by OTP.</li>
        <li>To schedule and manage your property visits and contact you about them.</li>
        <li>To process payments and keep records of them.</li>
        <li>To answer your questions and provide support.</li>
        <li>To keep the Platform safe, prevent fraud and misuse, and improve our service.</li>
        <li>To meet our legal, tax and accounting duties.</li>
      </ul>
      <p>We use your data based on your consent and to provide the services you ask for. You can withdraw consent at any time (see section 7).</p>

      <h2>4. Who we share it with</h2>
      <p>We do not sell your personal information. We share it only with service providers who help us run the Platform, and only as much as they need:</p>
      <ul>
        <li><b>Razorpay</b> for payment processing.</li>
        <li><b>Cloud hosting and database providers</b> (such as Amazon Web Services and MongoDB Atlas) to store and run the Platform.</li>
        <li><b>Cloudinary</b> to store property photos and videos.</li>
        <li><b>Email services</b> to send your login codes.</li>
        <li><b>WhatsApp (Meta)</b> when you choose to message us, under WhatsApp’s own privacy policy.</li>
        <li><b>Property owners</b>, where needed to arrange a visit you requested.</li>
        <li><b>Authorities</b>, where required by law.</li>
      </ul>
      <p>Our pages also load fonts from Google Fonts and images from Unsplash. Those services may receive your IP address when your browser fetches them.</p>

      <h2>5. How long we keep it</h2>
      <p>We keep your account details while your account is active. Payment and booking records are kept for as long as tax, accounting and other laws require. After that, we delete or anonymise them.</p>

      <h2>6. Security</h2>
      <p>We use reasonable safeguards such as encrypted connections (HTTPS), hashed login codes and access controls. No online service is completely secure, so we cannot guarantee absolute security.</p>

      <h2>7. Your rights</h2>
      <p>You can ask us to: see the personal data we hold about you, correct it, delete it, or stop using it where you have given consent. You can update your name and mobile number yourself in <Link to="/account">My account</Link>. For anything else, email <a href={`mailto:${L.email}`}>{L.email}</a>. We will reply within a reasonable time. Some records, such as payments, may have to be kept to meet legal duties.</p>

      <h2>8. Children</h2>
      <p>The Platform is not meant for anyone under 18, and we do not knowingly collect their data.</p>

      <h2>9. Changes to this policy</h2>
      <p>We may update this policy from time to time. The effective date at the top shows the latest version.</p>

      <h2>10. Contact and grievances</h2>
      <p>{L.grievanceOfficer}<br />{L.businessName}, {L.address}<br />Email: <a href={`mailto:${L.email}`}>{L.email}</a></p>
    </LegalLayout>
  );
}

export function Refund() {
  const f = useFees();
  return (
    <LegalLayout title="Cancellation & Refund Policy" intro={`This policy explains how payments made on ${L.website} are treated.`}>
      <div className="legal-callout"><b>All payments are non-refundable.</b> Once a payment is successful, we do not refund it.</div>

      <h2>1. What this covers</h2>
      <ul>
        <li><b>Single property visit fee</b> ({money(f.singleFee)}).</li>
        <li><b>Unlimited visit pass</b> ({money(f.fee)}).</li>
        <li><b>Property visit charge</b> ({money(f.quickFee)}).</li>
      </ul>

      <h2>2. No refund in these cases</h2>
      <ul>
        <li>You cancel a visit from your account or by message.</li>
        <li>You do not attend a scheduled visit.</li>
        <li>You do not like a property, or decide not to rent or buy it.</li>
        <li>You change your mind after paying.</li>
        <li>You do not use all the visits your unlimited pass allows.</li>
      </ul>

      <h2>3. When we may help</h2>
      <p>In these limited cases we will refund the amount, or give you a free reschedule, as we think fair:</p>
      <ul>
        <li><b>Duplicate or wrong charge:</b> you were charged more than once, or the wrong amount, for the same payment.</li>
        <li><b>Payment taken but service not recorded:</b> money left your account but your payment or visit does not show in My account. Please contact us with your payment ID.</li>
        <li><b>We cancel:</b> we cancel a visit and cannot offer you a suitable new time.</li>
      </ul>
      <p>If a payment fails but money is deducted, your bank or Razorpay normally reverses it automatically, usually within 5 to 7 working days.</p>

      <h2>4. How to reach us</h2>
      <p>Email <a href={`mailto:${L.email}`}>{L.email}</a> with your name, mobile number and payment ID. Approved refunds go back to the original payment method.</p>
      <p>See also our <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
    </LegalLayout>
  );
}
