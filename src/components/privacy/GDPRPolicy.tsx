
import React from "react";
import { Shield, Lock, FileText, Info, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GDPRPolicyProps {
  onClose: () => void;
}

const GDPRPolicy: React.FC<GDPRPolicyProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto p-6 space-y-6 overflow-y-auto max-h-[80vh]">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">GDPR Compliance Policy</h2>
        </div>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            Introduction
          </h3>
          <p className="mt-2 text-gray-700">
            This GDPR Compliance Policy explains how we collect, use, and protect your personal data in accordance with the 
            General Data Protection Regulation (GDPR). We are committed to ensuring the security and protection of the 
            personal data that we process, and to provide a compliant approach to data protection.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Data We Collect
          </h3>
          <p className="mt-2 text-gray-700">
            We may collect the following personal data:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Identity information (name, email address)</li>
            <li>Usage data (how you interact with our service)</li>
            <li>Technical data (IP address, browser information)</li>
            <li>Document content when you upload insurance policies for analysis</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <Lock className="w-5 h-5 mr-2 text-blue-600" />
            How We Use Your Data
          </h3>
          <p className="mt-2 text-gray-700">
            We use your personal data for the following purposes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Providing and maintaining our service</li>
            <li>Analyzing your insurance policies when requested</li>
            <li>Improving our service and user experience</li>
            <li>Communicating with you about service updates</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <Gavel className="w-5 h-5 mr-2 text-blue-600" />
            Your GDPR Rights
          </h3>
          <p className="mt-2 text-gray-700">
            Under the GDPR, you have the following rights:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li><strong>Right to access</strong> - You have the right to request copies of your personal data.</li>
            <li><strong>Right to rectification</strong> - You have the right to request that we correct any inaccurate information.</li>
            <li><strong>Right to erasure</strong> - You have the right to request that we erase your personal data.</li>
            <li><strong>Right to restrict processing</strong> - You have the right to request that we restrict the processing of your data.</li>
            <li><strong>Right to data portability</strong> - You have the right to request that we transfer your data to another organization.</li>
            <li><strong>Right to object</strong> - You have the right to object to our processing of your personal data.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Data Security</h3>
          <p className="mt-2 text-gray-700">
            We implement appropriate security measures to protect your personal data against unauthorized access, 
            alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Encryption of data in transit using TLS/SSL</li>
            <li>Regular security assessments</li>
            <li>Access controls to limit data access to authorized personnel</li>
            <li>Data minimization practices</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Cookie Policy</h3>
          <p className="mt-2 text-gray-700">
            We use cookies to enhance your experience on our website. You can control and manage cookies through your browser settings.
            Our cookies are used for:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Essential site functionality</li>
            <li>Analytics to improve our service</li>
            <li>Remembering your preferences</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="mt-2 text-gray-700">
            If you have any questions about this GDPR Policy or our data practices, please contact us at: 
            <a href="mailto:privacy@designcraft.com" className="text-blue-600 ml-1">privacy@designcraft.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default GDPRPolicy;
