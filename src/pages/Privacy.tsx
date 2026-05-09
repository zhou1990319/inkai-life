import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Cookie } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Shield className="w-16 h-16 text-[#c9a050] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: May 8, 2026</p>
        </motion.div>

        <div className="space-y-8">
          <Section icon={Database} title="Data Collection">
            <p className="text-gray-300 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Account information (username, email)</li>
              <li>Profile data (avatar, bio, location)</li>
              <li>Content you create (posts, comments, AI generations)</li>
              <li>Usage data and interactions</li>
            </ul>
          </Section>

          <Section icon={Eye} title="How We Use Your Data">
            <p className="text-gray-300 mb-4">
              Your data helps us provide and improve our services:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Personalize your experience</li>
              <li>Process AI tattoo generations</li>
              <li>Connect you with tattoo artists</li>
              <li>Send notifications and updates</li>
            </ul>
          </Section>

          <Section icon={Lock} title="Data Security">
            <p className="text-gray-300">
              We implement industry-standard security measures to protect your data.
              All data is encrypted in transit and at rest. We never sell your personal
              information to third parties.
            </p>
          </Section>

          <Section icon={Cookie} title="Cookie Policy">
            <p className="text-gray-300 mb-4">
              We use cookies to enhance your browsing experience:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Essential cookies for site functionality</li>
              <li>Analytics cookies to understand usage</li>
              <li>Preference cookies to remember your settings</li>
            </ul>
          </Section>

          <div className="bg-[#141414] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-white font-semibold mb-2">Contact Us</h3>
            <p className="text-gray-400">
              If you have questions about this Privacy Policy, please contact us at
              <a href="mailto:privacy@inkai.life" className="text-[#c9a050] ml-1 hover:underline">
                privacy@inkai.life
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141414] rounded-xl p-6 border border-[#2a2a2a]"
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-[#c9a050]" />
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
