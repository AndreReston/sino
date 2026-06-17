import { ArrowLeft, FileText, Shield, Mail, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const LOGO_SRC = '/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png';

interface Props {
  onBack?: () => void;
}

export default function DMCAPolicy({ onBack }: Props) {
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
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">DMCA Takedown Policy</h1>
            <p className="text-sm text-theme-muted mt-1">Last updated: June 17, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-theme-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> 1. Policy Overview
            </h2>
            <p className="text-sm">
              DesignForge respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA, 17 U.S.C. § 512). This policy outlines how copyright owners and their authorized agents can report alleged copyright infringement on our Platform, and how we respond to such reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sky-400" /> 2. Reporting Copyright Infringement
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                If you are a copyright owner or an authorized agent thereof, and you believe that content on the DesignForge Platform infringes your copyright, you may submit a DMCA Takedown Notice to our Designated Copyright Agent.
              </p>
              <p>Your notice must include the following information:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li><strong className="text-theme-secondary">Physical or Electronic Signature:</strong> A signature (or electronic equivalent) of the copyright owner or a person authorized to act on their behalf.</li>
                <li><strong className="text-theme-secondary">Identification of Copyrighted Work:</strong> A clear description of the copyrighted work that you claim has been infringed. If multiple works are involved, you may provide a representative list.</li>
                <li><strong className="text-theme-secondary">Identification of Infringing Material:</strong> The specific URL or other location on the Platform where the allegedly infringing material is located, with sufficient detail for us to locate it.</li>
                <li><strong className="text-theme-secondary">Your Contact Information:</strong> Your full name, mailing address, telephone number, and email address.</li>
                <li><strong className="text-theme-secondary">Good-Faith Statement:</strong> A statement that you have a good-faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
                <li><strong className="text-theme-secondary">Accuracy Statement:</strong> A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 3. Designated Copyright Agent
            </h2>
            <p className="text-sm">
              DMCA notices must be sent to our Designated Copyright Agent:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-panel border border-panel-border text-sm">
              <p><strong className="text-white">DesignForge Copyright Agent</strong></p>
              <p className="text-theme-muted">Email: dmca@designforge.app</p>
              <p className="text-theme-muted">Address: Philippines</p>
            </div>
            <p className="text-sm mt-3">
              We recommend sending DMCA notices via email for fastest processing. Please include "DMCA Takedown Notice" in the subject line.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" /> 4. Our Response Process
            </h2>
            <div className="space-y-3 text-sm">
              <p>Upon receiving a valid DMCA notice, we will:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Promptly acknowledge receipt of the notice within 48 hours.</li>
                <li>Review the notice for completeness and validity.</li>
                <li>Remove or disable access to the allegedly infringing material within 5 business days, if the notice is valid.</li>
                <li>Notify the user who uploaded the material that it has been removed due to a copyright complaint.</li>
                <li>Maintain records of all takedown notices and counter-notifications for legal compliance.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-sky-400" /> 5. Counter-Notification
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                If you are a user whose content was removed due to a DMCA notice, and you believe the removal was a mistake or misidentification, you may submit a Counter-Notification to our Copyright Agent.
              </p>
              <p>Your counter-notification must include:</p>
              <ul className="list-disc list-inside space-y-1 text-theme-muted">
                <li>Your physical or electronic signature.</li>
                <li>Identification of the material that was removed and its location before removal.</li>
                <li>A statement under penalty of perjury that you have a good-faith belief the material was removed as a result of mistake or misidentification.</li>
                <li>Your name, address, telephone number, and email address.</li>
                <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or if outside the United States, the jurisdiction of any judicial district in which DesignForge may be found), and that you will accept service of process from the person who provided the original DMCA notice or their agent.</li>
              </ul>
              <p>Upon receipt of a valid counter-notification, we may restore the removed material within 10-14 business days unless the original complainant files a court action against you.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sky-400" /> 6. Repeat Infringers
            </h2>
            <p className="text-sm">
              DesignForge has a strict policy against repeat copyright infringers. We will terminate the accounts of users who are determined to be repeat infringers in appropriate circumstances. A user may be considered a repeat infringer after receiving three or more valid DMCA notices, or after other evidence of persistent infringement is presented.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sky-400" /> 7. Misrepresentation
            </h2>
            <p className="text-sm">
              Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material is infringing, or that material was removed by mistake, may be liable for damages, including costs and attorneys' fees, incurred by us or the affected user. Please ensure the accuracy of all information before submitting a notice or counter-notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" /> 8. Contact
            </h2>
            <p className="text-sm">
              For questions about this DMCA Policy, contact our Copyright Agent at dmca@designforge.app.
            </p>
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
