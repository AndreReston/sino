import { ArrowLeft, FileText, Scale, AlertCircle, CreditCard, Handshake, Shield, Copyright, Ban, Clock, DollarSign, Repeat, Lock } from 'lucide-react';

const LOGO_SRC = '/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png';

interface Props {
  onBack?: () => void;
}

export default function TermsConditions({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.04] blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.04] blur-[130px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <img src={LOGO_SRC} alt="DesignForge" className="w-9 h-9 rounded-xl object-cover" />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 to-sky-400 bg-clip-text text-transparent">DesignForge</span>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-theme-muted hover:text-theme-primary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <FileText className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-sm text-theme-muted mt-1">Last updated: June 17, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-theme-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> 1. Acceptance of Terms
            </h2>
            <p className="text-sm">
              By accessing or using DesignForge ("the Platform", "we", "us", "our"), you agree to be bound by these Terms of Service ("ToS"). If you do not agree to these terms, you must not use the Platform. These terms constitute a legally binding agreement between you and DesignForge. These terms are governed by the laws of the Republic of the Philippines, including the E-Commerce Act of 2000 (RA 8792), and applicable international regulations. If you are using the Platform on behalf of an organization, you represent that you have authority to bind that organization to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sky-400" /> 2. Eligibility and User Accounts
            </h2>
            <div className="space-y-3 text-sm">
              <p>To access certain features, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security of your password and account credentials.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
                <li>Be at least 13 years of age (or the minimum age in your jurisdiction). By creating an account, you represent and warrant that you meet this age requirement. If you are under 13, you may not use the Platform.</li>
                <li>Not create accounts by automated means or under false pretenses.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Copyright className="w-5 h-5 text-sky-400" /> 3. Intellectual Property and Content Ownership
            </h2>
            <div className="space-y-3 text-sm">
              <p><strong className="text-white">Your Content:</strong> You retain full ownership of all copyright, trademark, and other intellectual property rights in the designs, images, videos, audio, and other content you create or upload using the Platform ("User Content"). DesignForge does not claim ownership of your User Content.</p>

              <p><strong className="text-white">Platform License:</strong> By uploading or creating content on the Platform, you grant DesignForge a limited, non-exclusive, royalty-free, worldwide license solely to:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Store, host, and serve your User Content to provide our services to you.</li>
                <li>Process, transcode, and render your User Content for editing, preview, and export functionality.</li>
                <li>Display thumbnails and previews within your account interface.</li>
              </ul>
              <p>This license terminates when you delete your User Content or your account, except where we have already made your content available to others or are required to retain it by law.</p>

              <p><strong className="text-white">Stock Assets and Templates:</strong> Any built-in stock photos, videos, audio tracks, fonts, or templates provided by DesignForge are licensed to you for use within the Platform. You may use these assets in your own designs for personal or commercial purposes, but you may not extract, redistribute, or resell them outside of the Platform. All stock assets are licensed from reputable providers with verified commercial licenses.</p>

              <p><strong className="text-white">Platform IP:</strong> DesignForge, the DesignForge logo, and all code, software, trademarks, and branding elements are the exclusive property of DesignForge. You may not copy, modify, distribute, or create derivative works from our Platform code or branding without written authorization.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-sky-400" /> 4. Acceptable Use Policy (AUP)
            </h2>
            <div className="space-y-3 text-sm">
              <p>You may not use the Platform to create, upload, or distribute content that:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Infringes on any intellectual property rights, including copyright, trademark, or patent rights of any third party.</li>
                <li>Is illegal, defamatory, libelous, obscene, pornographic, or promotes violence, terrorism, or discrimination.</li>
                <li>Constitutes "deepfake" content — synthetic media created to deceive, defraud, or impersonate real individuals without consent.</li>
                <li>Contains malware, viruses, trojans, or any other harmful code.</li>
                <li>Violates any applicable local, national, or international law or regulation.</li>
                <li>Invades the privacy or violates the rights of any individual or entity.</li>
                <li>Is used to harass, stalk, or threaten others.</li>
              </ul>
              <p>Additionally, you agree not to:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Use automated systems, bots, or scripts to access, scrape, or harvest data from the Platform.</li>
                <li>Attempt to gain unauthorized access to any portion of the Platform, its servers, or networks.</li>
                <li>Interfere with or disrupt the Platform or its servers and networks.</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Platform.</li>
                <li>Circumvent any security features or access controls.</li>
              </ul>
              <p>We reserve the right to remove any content that violates this Acceptable Use Policy and to suspend or terminate accounts of repeat offenders without notice.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-sky-400" /> 5. Payments, Subscriptions, and Billing
            </h2>
            <div className="space-y-3 text-sm">
              <p><strong className="text-white">Payment Processing:</strong> All payments are processed through secure, third-party payment gateways (Stripe, PayPal). We do not store raw credit card numbers, CVV codes, or billing addresses on our servers. All payment processing complies with PCI-DSS standards.</p>

              <p><strong className="text-white">Subscription Terms:</strong> If you subscribe to a paid plan, you will be billed in advance on a recurring basis (monthly or annually, depending on your selection). All charges are displayed in your local currency where supported, or in USD otherwise.</p>

              <p><strong className="text-white">Billing Alerts:</strong> You will receive an explicit email notification at least 7 days before any recurring subscription renewal. You may cancel your subscription at any time through your account settings or by contacting support. Upon cancellation, you will retain access to paid features until the end of the current billing period.</p>

              <p><strong className="text-white">Refunds:</strong> Refund requests are evaluated on a case-by-case basis. Within 14 days of your initial subscription purchase, you may be eligible for a full refund if you have not materially used the paid features. No refunds are provided for partial months or after the 14-day window.</p>

              <p><strong className="text-white">Price Changes:</strong> We may change subscription prices at any time. You will be notified at least 30 days in advance of any price increase. Your continued use after the effective date constitutes acceptance of the new pricing.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" /> 6. DMCA and Copyright Policy
            </h2>
            <div className="space-y-3 text-sm">
              <p>DesignForge respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA). We will respond promptly to claims of copyright infringement committed using our Platform.</p>
              <p>If you are a copyright owner or authorized agent and believe content on our Platform infringes your rights, please submit a DMCA takedown notice to our designated agent at dmca@designforge.app with the following information:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Your physical or electronic signature.</li>
                <li>Identification of the copyrighted work claimed to be infringed.</li>
                <li>Identification of the infringing material and its location on the Platform.</li>
                <li>Your contact information (address, phone, email).</li>
                <li>A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement that the information in the notice is accurate, and under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
              </ul>
              <p>We will remove or disable access to allegedly infringing material and notify the user who uploaded it. Repeat infringers will have their accounts terminated. For counter-notifications, contact dmca@designforge.app.</p>
              <p>For full details, see our <a href="/dmca" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">DMCA Policy</a>.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" /> 7. Disclaimer of Warranties
            </h2>
            <p className="text-sm">
              The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that the Platform will be uninterrupted, timely, secure, error-free, or free from viruses or other harmful components. We do not warrant the accuracy or reliability of any content obtained through the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> 8. Limitation of Liability
            </h2>
            <p className="text-sm">
              To the maximum extent permitted by applicable law, DesignForge and its affiliates, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, use, or other intangible losses, arising from: (a) your use or inability to use the Platform; (b) any unauthorized access to or alteration of your data; (c) any downtime, service interruption, or data loss; (d) any third-party content or conduct on the Platform; or (e) any other matter relating to the Platform. Our total liability to you for any claim shall not exceed the amount you paid to us in the 12 months preceding the claim, or USD 100 if you have not paid anything.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> 9. Termination and Account Suspension
            </h2>
            <p className="text-sm">
              We may suspend or terminate your account and access to the Platform at any time, with or without notice, for any reason, including but not limited to violation of these Terms. Upon termination, your right to use the Platform will immediately cease. We may, but are not obligated to, delete your User Content after termination. All provisions of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property provisions, disclaimers, limitation of liability, and indemnification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> 10. Governing Law and Dispute Resolution
            </h2>
            <p className="text-sm">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions. Any disputes arising from these Terms shall first be resolved through amicable negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in the Philippines under the rules of the Philippine Dispute Resolution Center. The arbitration shall be conducted in English. The arbitral award shall be final and binding. Nothing in this section shall prevent either party from seeking injunctive relief in a court of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-sky-400" /> 11. Changes to Terms
            </h2>
            <p className="text-sm">
              We may modify these Terms at any time. We will notify you of significant changes via email or through the Platform at least 15 days before the changes take effect. Your continued use of the Platform after such changes constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically. If you do not agree to the changes, you must stop using the Platform and cancel your subscription before the changes take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 12. Contact Information
            </h2>
            <div className="space-y-3 text-sm">
              <p>For legal inquiries, DMCA notices, or general questions about these Terms:</p>
              <div className="p-4 rounded-xl bg-panel border border-panel-border text-sm">
                <p><strong className="text-white">DesignForge Legal Department</strong></p>
                <p className="text-theme-muted">Email: legal@designforge.app</p>
                <p className="text-theme-muted">DMCA Agent: dmca@designforge.app</p>
                <p className="text-theme-muted">Address: Philippines</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.04] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_SRC} alt="DesignForge" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-sky-400 bg-clip-text text-transparent">DesignForge</span>
          </div>
          <p className="text-xs text-theme-dim">Copyright &copy; {new Date().getFullYear()} DesignForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
