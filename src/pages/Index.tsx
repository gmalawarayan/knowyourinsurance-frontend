
import React from "react";
import ChatLayout from "@/components/layout/ChatLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import PrivacyBanner from "@/components/privacy/PrivacyBanner";
import SecurityIndicators from "@/components/privacy/SecurityIndicators";

const Index = () => {
  return (
    <ChatLayout>
      <div className="max-w-4xl mx-auto w-full px-4">
        <PrivacyBanner />
        <div className="flex justify-end mb-2">
          <SecurityIndicators />
        </div>
        <ChatInterface />
      </div>
    </ChatLayout>
  );
};

export default Index;
