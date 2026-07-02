import { ArrowLeft } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { Sun, Moon } from 'lucide-react';

type Props = {
  onBack: () => void;
};

export default function PrivacyPolicy({ onBack }: Props) {
  const { mode, toggle } = useThemeStore();

  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.05] blur-[130px]" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-sky-500/[0.05] blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-4xl mx-auto px-6 py-5 border-b border-white/[0.04]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-theme-muted hover:text-theme-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </button>
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-panel-border bg-panel hover:bg-panel-hover text-theme-dim hover:text-theme-primary transition-colors"
          title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-theme-muted mb-8">Last updated: July 2, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-theme-secondary">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Data Minimization (GDPR & CCPA Compliance)</h2>
            <p className="leading-relaxed">
              DreFlow adheres to strict data minimization principles in compliance with the General Data Protection
              Regulation (GDPR) and the California Consumer Privacy Act (CCPA). All repository scanning, SQL parsing,
              and layout state logic occur <strong>entirely locally within your browser's client memory context</strong>.
              This data is <strong>instantly purged when your browser tab is closed</strong>.
            </p>
            <p className="leading-relaxed mt-3">
              We do not transmit your source code, database schemas, or architectural diagrams to our infrastructure
              for processing. All visual rendering, complexity scoring, and connection mapping happens on your device.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. AI Transparency Disclosure (EU AI Act Article 50)</h2>
            <p className="leading-relaxed">
              In accordance with the European Union AI Act Article 50 transparency obligations for AI systems,
              DreFlow provides the following disclosure:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Automated Analysis Features:</strong> DreFlow utilizes backend Large Language Model (LLM)
                heuristics and token parsing for certain automated suggestion features.
              </li>
              <li>
                <strong>Zero-Data-Retention APIs:</strong> User code inputs processed by these features are handled
                through APIs configured with zero data retention. Your code is <strong>never used for model training</strong>.
              </li>
              <li>
                <strong>Processing Scope:</strong> AI-assisted features only process data you explicitly submit for analysis.
                No background scanning or passive data collection occurs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Information We Collect</h2>
            <p className="leading-relaxed">When you create an account, we collect:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Email address (for authentication)</li>
              <li>Display name (optional)</li>
              <li>Saved design metadata (titles, canvas dimensions, page count)</li>
            </ul>
            <p className="leading-relaxed mt-3">
              We do <strong>not</strong> collect: source code content, database credentials, schema definitions,
              or any files you analyze with the tool.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage</h2>
            <p className="leading-relaxed">
              User account data and saved design metadata are stored securely using Supabase infrastructure
              with row-level security (RLS) policies ensuring each user can only access their own data.
              All data in transit is encrypted via TLS 1.3.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p className="leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Access all personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of any non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies & Local Storage</h2>
            <p className="leading-relaxed">
              DreFlow uses browser local storage and IndexedDB to persist your work sessions locally on your device.
              This data never leaves your device and is fully under your control. We use essential cookies for
              authentication only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Third-Party Services</h2>
            <p className="leading-relaxed">
              DreFlow integrates with third-party stock media providers (Pexels) for template images. These
              services operate under their own privacy policies. No user data is shared with these providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact</h2>
            <p className="leading-relaxed">
              For privacy-related inquiries or to exercise your data rights, contact us at:
              <a href="mailto:privacy@dreflow.app" className="text-sky-400 hover:text-sky-300 ml-1">
                privacy@dreflow.app
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
