import { ArrowLeft, Shield, Database, Share2, Lock, Globe, Mail, Clock } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const LOGO_SRC = '/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png';

interface Props {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
  const { mode: themeMode } = useThemeStore();

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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-sm text-theme-muted mt-1">Last updated: June 17, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-theme-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" /> 1. Introduction
            </h2>
            <p className="text-sm">
              DesignForge ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our visual design and video editing platform. This policy complies with the Philippines Data Privacy Act of 2012 (RA 10173), enforced by the National Privacy Commission, and the General Data Protection Regulation (GDPR) for users in the European Union.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" /> 2. Information We Collect
            </h2>
            <div className="space-y-3 text-sm">
              <p>We collect the following types of personal information:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">Account Information:</strong> Email address, password (encrypted), and optional display name when you register.</li>
                <li><strong className="text-theme-secondary">User Content:</strong> Designs, projects, uploaded images, videos, and other creative content you create or upload.</li>
                <li><strong className="text-theme-secondary">Usage Data:</strong> IP address, browser type, device information, operating system, and timestamps of your interactions.</li>
                <li><strong className="text-theme-secondary">Technical Data:</strong> Canvas interactions, tool usage, and error logs for debugging and service improvement.</li>
                <li><strong className="text-theme-secondary">Cookies:</strong> See our Cookie Policy for details on cookie usage.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-sky-400" /> 3. How We Use Your Information
            </h2>
            <div className="space-y-3 text-sm">
              <p>We process your personal data based on the following lawful grounds:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">To Provide Services:</strong> Creating, storing, and syncing your designs across devices.</li>
                <li><strong className="text-theme-secondary">To Improve Our Platform:</strong> Analyzing usage patterns to enhance features and performance.</li>
                <li><strong className="text-theme-secondary">Security:</strong> Detecting and preventing fraud, abuse, and unauthorized access.</li>
                <li><strong className="text-theme-secondary">Communication:</strong> Sending important service updates, security alerts, and optional feature announcements.</li>
                <li><strong className="text-theme-secondary">Legal Compliance:</strong> Fulfilling our legal obligations under Philippine and international law.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" /> 4. Data Storage and Security
            </h2>
            <p className="text-sm">
              Your data is stored securely using Supabase (PostgreSQL) and Supabase Storage. We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits. Passwords are hashed using bcrypt and never stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" /> 5. Data Sharing and Transfers
            </h2>
            <p className="text-sm">
              We do not sell your personal data. We may share data with trusted service providers (such as Supabase for hosting) solely to operate our platform. All data transfers comply with the principles of transparency, legitimate purpose, and proportionality under the Philippine Data Privacy Act. For EU users, we ensure GDPR-compliant data processing agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 6. Your Rights
            </h2>
            <div className="space-y-3 text-sm">
              <p>Under the Philippine Data Privacy Act and GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">Right to Access:</strong> Request a copy of your personal data.</li>
                <li><strong className="text-theme-secondary">Right to Correction:</strong> Update or correct inaccurate information.</li>
                <li><strong className="text-theme-secondary">Right to Erasure:</strong> Request deletion of your account and associated data.</li>
                <li><strong className="text-theme-secondary">Right to Object:</strong> Object to certain types of processing.</li>
                <li><strong className="text-theme-secondary">Right to Portability:</strong> Export your data in a machine-readable format.</li>
                <li><strong className="text-theme-secondary">Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time.</li>
              </ul>
              <p className="text-theme-muted">To exercise these rights, contact us at privacy@designforge.app.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" /> 7. Data Retention
            </h2>
            <p className="text-sm">
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable law. When you delete your account, we will delete your personal data within 30 days, except where retention is required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 8. Contact Us
            </h2>
            <p className="text-sm">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Protection Officer:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-panel border border-panel-border text-sm">
              <p><strong className="text-white">DesignForge Data Protection Officer</strong></p>
              <p className="text-theme-muted">Email: privacy@designforge.app</p>
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
