import { ArrowLeft, Cookie, Info, Settings, Clock } from 'lucide-react';

const LOGO_SRC = '/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png';

interface Props {
  onBack?: () => void;
}

export default function CookiePolicy({ onBack }: Props) {
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
            <Cookie className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
            <p className="text-sm text-theme-muted mt-1">Last updated: June 17, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-theme-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" /> 1. What Are Cookies
            </h2>
            <p className="text-sm">
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, improve your browsing experience, and provide useful analytics. We also use similar technologies like localStorage and sessionStorage for data persistence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-sky-400" /> 2. Types of Cookies We Use
            </h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-panel border border-panel-border">
                <h3 className="text-sm font-semibold text-white mb-1">Essential Cookies</h3>
                <p className="text-xs text-theme-muted">
                  Required for the Platform to function. These include authentication tokens, session management, and saved design preferences. Without these cookies, the Platform cannot operate properly.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-panel border border-panel-border">
                <h3 className="text-sm font-semibold text-white mb-1">Analytics Cookies</h3>
                <p className="text-xs text-theme-muted">
                  Help us understand how users interact with our Platform. These cookies collect anonymous information about page visits, feature usage, and error reports. We use this data to improve our services.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-panel border border-panel-border">
                <h3 className="text-sm font-semibold text-white mb-1">Marketing Cookies</h3>
                <p className="text-xs text-theme-muted">
                  Used to deliver personalized advertisements and measure campaign effectiveness. These are only deployed with your explicit consent.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-400" /> 3. Managing Your Preferences
            </h2>
            <p className="text-sm">
              You can manage your cookie preferences at any time using our cookie banner or by clearing your browser's stored data. Essential cookies cannot be disabled as they are necessary for the Platform to function. For analytics and marketing cookies, you have full control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" /> 4. Cookie Duration
            </h2>
            <div className="space-y-3 text-sm">
              <p>Our cookies fall into two categories based on duration:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">Session Cookies:</strong> Temporary cookies that expire when you close your browser. Used for session management.</li>
                <li><strong className="text-theme-secondary">Persistent Cookies:</strong> Remain on your device for a set period. Used for remembering preferences and login sessions.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" /> 5. Third-Party Cookies
            </h2>
            <p className="text-sm">
              Currently, DesignForge does not use third-party cookies. All cookies are first-party and set directly by our Platform. We do not share cookie data with external advertisers or social media platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" /> 6. Changes to This Policy
            </h2>
            <p className="text-sm">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" /> 7. Contact Us
            </h2>
            <div className="p-4 rounded-xl bg-panel border border-panel-border text-sm">
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
