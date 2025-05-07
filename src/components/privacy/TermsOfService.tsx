
import React from "react";
import { Gavel, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TermsOfServiceProps {
  onClose: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto p-6 space-y-6 overflow-y-auto max-h-[80vh]">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <Gavel className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Terms of Service</h2>
        </div>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold">Introduction</h3>
          <p className="mt-2 text-gray-700">
            Welcome to DesignCraft. By accessing our website at designcraft.com, you agree to be bound by these Terms of Service.
            Please read these Terms carefully before using our service.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Service Description
          </h3>
          <p className="mt-2 text-gray-700">
            DesignCraft provides an AI-powered document analysis service that helps users understand their insurance policies.
            Our service includes document processing, analysis, and personalized recommendations.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">User Responsibilities</h3>
          <p className="mt-2 text-gray-700">
            When using our service, you agree to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Provide accurate and complete information</li>
            <li>Use the service only for lawful purposes</li>
            <li>Not upload any content that infringes on intellectual property rights</li>
            <li>Not attempt to gain unauthorized access to any part of the service</li>
            <li>Not use the service to distribute harmful software or content</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Intellectual Property
          </h3>
          <p className="mt-2 text-gray-700">
            The service and its original content, features, and functionality are owned by DesignCraft and are protected by 
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Limitations of Liability</h3>
          <p className="mt-2 text-gray-700">
            DesignCraft shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Your use or inability to use the service</li>
            <li>Any unauthorized access to your data</li>
            <li>Any errors or inaccuracies in the content</li>
            <li>Any interruption or cessation of transmission to or from the service</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Service Modifications</h3>
          <p className="mt-2 text-gray-700">
            DesignCraft reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice.
            We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the service.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Governing Law</h3>
          <p className="mt-2 text-gray-700">
            These Terms shall be governed by and defined following the laws of [Your Country]. 
            DesignCraft and yourself irrevocably consent to the exclusive jurisdiction and venue of the 
            [Your City] courts for all disputes arising out of or relating to these Terms.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Changes to Terms</h3>
          <p className="mt-2 text-gray-700">
            We reserve the right to modify these Terms at any time. If we make material changes to these Terms, 
            we will notify you by email or by placing a prominent notice on our website.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="mt-2 text-gray-700">
            If you have any questions about these Terms, please contact us at: 
            <a href="mailto:legal@designcraft.com" className="text-blue-600 ml-1">legal@designcraft.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
