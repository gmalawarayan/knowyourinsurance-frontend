
import React from "react";
import { Shield, Lock, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto p-6 space-y-6 overflow-y-auto max-h-[80vh]">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
        </div>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <div className="space-y-4">
        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <Lock className="w-5 h-5 mr-2 text-blue-600" />
            How We Handle Your Data
          </h3>
          <p className="mt-2 text-gray-700">
            Your privacy is our top priority. When you upload insurance policy documents to our service:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Documents are encrypted during transmission using TLS/SSL.</li>
            <li>We process your documents securely using the ChatPDF API for analysis.</li>
            <li>Your original documents and extracted data are not shared with any third parties except as required to provide our service.</li>
            <li>We do not use your documents for training our AI models.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Data Retention</h3>
          <p className="mt-2 text-gray-700">
            By default, your documents are stored for 30 days to allow you to continue analyzing them. After this period:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Your documents are automatically deleted from our servers.</li>
            <li>You can manually delete your documents at any time from your account.</li>
            <li>Once deleted, documents are permanently removed within 24 hours.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-blue-600" />
            Local Processing Option
          </h3>
          <p className="mt-2 text-gray-700">
            We offer a local processing option that allows parts of the document analysis to happen directly on your device:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Initial document preprocessing happens on your device.</li>
            <li>Only necessary data is sent to our servers for AI analysis.</li>
            <li>This reduces the amount of sensitive information transmitted.</li>
            <li>Toggle this option in your account settings.</li>
          </ul>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold">Your Rights</h3>
          <p className="mt-2 text-gray-700">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Access your personal data</li>
            <li>Correct inaccurate personal data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <p className="mt-2 text-gray-700">
            If you have any questions about our privacy practices, please contact us at privacy@designcraft.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
