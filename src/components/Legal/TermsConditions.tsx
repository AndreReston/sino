import { ArrowLeft, FileText, Scale, AlertCircle, CreditCard, Handshake, Shield } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

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
            <h1 className="text-3xl font-bold text-white">Terms and Conditions</h1>
            <p className="text-sm text-theme-muted mt-1">Last updated: June 17, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-theme-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> 1. Acceptance of Terms
            </h2>
            <p className="text-sm">
              By accessing or using DesignForge ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use the Platform. These terms are governed by the laws of the Republic of the Philippines, including the E-Commerce Act of 2000 (RA 8792), and applicable international regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sky-400" /> 2. User Accounts
            </h2>
            <div className="space-y-3 text-sm">
              <p>To access certain features, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security of your password and account credentials.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
                <li>Be at least 13 years of age (or the minimum age in your jurisdiction).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> 3. User Content and Intellectual Property
            </h2>
            <div className="space-y-3 text-sm">
              <p><strong className="text-white">Your Content:</strong> You retain ownership of all designs, images, videos, and other content you create or upload. You grant DesignForge a limited, non-exclusive license solely to store, display, and process your content for the purpose of providing our services.</p>
              <p><strong className="text-white">Prohibited Content:</strong> You may not upload content that:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Infringes on intellectual property rights of third parties.</li>
                <li>Contains malware, viruses, or other harmful code.</li>
                <li>Is illegal, defamatory, obscene, or promotes violence or discrimination.</li>
                <li>Violates any applicable laws or regulations.</li>
              </ul>
              <p>We reserve the right to remove any content that violates these terms.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sky-400" /> 4. Payments and Subscriptions
            </h2>
            <p className="text-sm">
              DesignForge is currently free to use. If we introduce paid features in the future, you will be notified in advance. All electronic transactions will comply with the Philippine E-Commerce Act of 2000, ensuring legally binding digital transactions, contracts, and signatures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-sky-400" /> 5. Acceptable Use
            </h2>
            <div className="space-y-3 text-sm">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Use the Platform for any illegal purpose or in violation of any laws.</li>
                <li>Attempt to gain unauthorized access to any portion of the Platform.</li>
                <li>Interfere with or disrupt the Platform or its servers and networks.</li>
                <li>Scrape, harvest, or collect user data without consent.</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Platform.</li>
                <li>Use automated systems or bots to access the Platform.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" /> 6. Disclaimer of Warranties
            </h2>
            <p className="text-sm">
              The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Platform will be uninterrupted, timely, secure, or error-free. We are not liable for any loss of data, designs, or content resulting from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> 7. Limitation of Liability
            </h2>
            <p className="text-sm">
              To the maximum extent permitted by law, DesignForge and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> 8. Termination
            </h2>
            <p className="text-sm">
              We may suspend or terminate your account and access to the Platform at any time, with or without notice, for any reason, including violation of these Terms. Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> 9. Governing Law and Dispute Resolution
            </h2>
            <p className="text-sm">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from these Terms shall first be resolved through amicable negotiation. If unresolved, disputes shall be submitted to arbitration in the Philippines under the rules of the Philippine Dispute Resolution Center.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sky-400" /> 10. Changes to Terms
            </h2>
            <p className="text-sm">
              We may modify these Terms at any time. We will notify you of significant changes via email or through the Platform. Your continued use of the Platform after such changes constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 11. Contact Information
            </h2>
            <div className="p-4 rounded-xl bg-panel border border-panel-border text-sm">
              <p><strong className="text-white">DesignForge Legal Department</strong></p>
              <p className="text-theme-muted">Email: legal@designforge.app</p>
              <p className="text-theme-muted">Address: Philippines</p>
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
