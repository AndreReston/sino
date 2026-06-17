import { ArrowLeft, Shield, Database, Share2, Lock, Globe, Mail, Clock, Baby, Eye, HardDrive } from 'lucide-react';

const LOGO_SRC = '/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png';

interface Props {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
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
              <Shield className="w-5 h-5 text-sky-400" /> 1. Introduction
            </h2>
            <p className="text-sm">
              DesignForge ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our visual design and video editing platform. This policy complies with the Philippines Data Privacy Act of 2012 (RA 10173), the General Data Protection Regulation (GDPR) for users in the European Union, and the California Consumer Privacy Act (CCPA) for users in California, USA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" /> 2. Information We Collect
            </h2>
            <div className="space-y-3 text-sm">
              <p>We collect the following categories of personal information:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">Account Information:</strong> Email address, password (bcrypt-encrypted), and optional display name. We do not collect government-issued ID numbers, financial account numbers, or medical information.</li>
                <li><strong className="text-theme-secondary">User Content (Media):</strong> Designs, projects, uploaded images, videos, audio files, and other creative content you create, upload, or store. This includes file metadata such as creation dates, dimensions, and file formats.</li>
                <li><strong className="text-theme-secondary">Usage Data:</strong> IP address, browser type, device information, operating system, screen resolution, and timestamps of your interactions. We use this data to detect fraud and improve service quality.</li>
                <li><strong className="text-theme-secondary">Technical Data:</strong> Canvas interactions, tool usage, error logs, and performance metrics for debugging and service improvement.</li>
                <li><strong className="text-theme-secondary">Cookies:</strong> See our <a href="/cookie-policy" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">Cookie Policy</a> for details on cookie usage and consent mechanisms.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-sky-400" /> 3. Data Storage and Encryption (Privacy by Design)
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                We implement "privacy by design" principles. Your data is stored using Supabase (PostgreSQL) and Supabase Storage. All user-uploaded media (photos, videos, audio) is secured with the following measures:
              </p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">Encryption in Transit:</strong> All data transferred between your device and our servers is protected using SSL/TLS (HTTPS with TLS 1.3).</li>
                <li><strong className="text-theme-secondary">Encryption at Rest:</strong> Database backups and stored media files are encrypted at rest using AES-256.</li>
                <li><strong className="text-theme-secondary">Password Security:</strong> Passwords are hashed using bcrypt with a salt. We never store plain-text passwords.</li>
                <li><strong className="text-theme-secondary">Access Controls:</strong> Row-Level Security (RLS) policies restrict database access to authenticated users viewing their own data only.</li>
                <li><strong className="text-theme-secondary">Data Sovereignty:</strong> Supabase storage regions are selected to minimize cross-border data transfers. Backups are retained for 7 days.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-sky-400" /> 4. How We Use Your Information
            </h2>
            <div className="space-y-3 text-sm">
              <p>We process your personal data based on the following lawful grounds:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">To Provide Services:</strong> Creating, storing, syncing, and rendering your designs across devices.</li>
                <li><strong className="text-theme-secondary">To Improve Our Platform:</strong> Analyzing anonymized usage patterns to enhance features and performance.</li>
                <li><strong className="text-theme-secondary">Security:</strong> Detecting and preventing fraud, abuse, and unauthorized access.</li>
                <li><strong className="text-theme-secondary">Communication:</strong> Sending important service updates, security alerts, and (with consent) feature announcements.</li>
                <li><strong className="text-theme-secondary">Legal Compliance:</strong> Fulfilling our obligations under Philippine, EU, and US law.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" /> 5. Data Sharing and Transfers
            </h2>
            <p className="text-sm">
              We do not sell your personal data. We may share data with trusted service providers (such as Supabase for cloud hosting) solely to operate our platform. All data transfers comply with the principles of transparency, legitimate purpose, and proportionality under the Philippine Data Privacy Act. For EU users, we ensure GDPR-compliant data processing agreements (Standard Contractual Clauses where applicable). We do not transfer California user data for monetary consideration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 6. Your Privacy Rights
            </h2>
            <div className="space-y-3 text-sm">
              <h3 className="text-sm font-semibold text-white mb-1">Under the Philippine Data Privacy Act (RA 10173)</h3>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Right to Access</li>
                <li>Right to Correction</li>
                <li>Right to Erasure</li>
                <li>Right to Object to Processing</li>
                <li>Right to Withdraw Consent</li>
              </ul>

              <h3 className="text-sm font-semibold text-white mb-1 mt-3">Under GDPR (EU Users)</h3>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Right to Access, Rectification, and Erasure</li>
                <li>Right to Data Portability</li>
                <li>Right to Restrict Processing</li>
                <li>Right to Object to Automated Decision-Making</li>
                <li>Right to Lodge a Complaint with a Supervisory Authority</li>
              </ul>

              <h3 className="text-sm font-semibold text-white mb-1 mt-3">Under CCPA (California Residents)</h3>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Right to Know what personal data is collected and shared</li>
                <li>Right to Delete personal data</li>
                <li>Right to Opt-Out of the sale of personal data (we do not sell data)</li>
                <li>Right to Non-Discrimination for exercising privacy rights</li>
              </ul>
              <p className="text-theme-muted">To exercise these rights, contact our Data Protection Officer at privacy@designforge.app.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Baby className="w-5 h-5 text-sky-400" /> 7. Childrens Privacy (COPPA)
            </h2>
            <p className="text-sm">
              Our Platform is not intended for children under the age of 13. We comply with the Childrens Online Privacy Protection Act (COPPA). We do not knowingly collect personal data from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at privacy@designforge.app, and we will delete such information. We do not require parental consent for any data collection activities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" /> 8. Data Retention
            </h2>
            <p className="text-sm">
              We retain your personal data and media files only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable law. Account data is retained while your account is active. When you delete your account, we will delete your personal data and user-uploaded media within 30 days, except where retention is required by law or for legitimate business purposes (e.g., fraud prevention). Database backups are retained for 7 days and then automatically purged.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" /> 9. Tracking and Cookies
            </h2>
            <p className="text-sm">
              We use a cookie consent banner to manage tracking preferences. We only deploy analytics and marketing cookies after you provide explicit consent. Essential cookies (required for login, session management, and core functionality) are always active. You can update your preferences at any time using the cookie banner. For details, see our <a href="/cookie-policy" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 10. Contact Us
            </h2>
            <div className="space-y-3 text-sm">
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Protection Officer:</p>
              <div className="p-4 rounded-xl bg-panel border border-panel-border text-sm">
                <p><strong className="text-white">DesignForge Data Protection Officer</strong></p>
                <p className="text-theme-muted">Email: privacy@designforge.app</p>
                <p className="text-theme-muted">Address: Philippines</p>
              </div>
              <p className="text-theme-muted">For EU residents, you have the right to lodge a complaint with your local supervisory authority.</p>
              <p className="text-theme-muted">For California residents, you may contact us at the same email to exercise CCPA rights.</p>
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
