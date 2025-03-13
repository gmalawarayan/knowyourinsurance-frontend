
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  className?: string;
  delay?: number;
  popular?: boolean;
  ctaText?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  features,
  className,
  delay = 0,
  popular = false,
  ctaText = "Get Started",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        "glass-card p-8 flex flex-col h-full",
        popular ? "border-blue-500 relative shadow-lg" : "",
        className
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded-full">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold font-display mb-2">{title}</h3>
        <div className="flex items-baseline mb-2">
          <span className="text-3xl font-bold font-display">{price}</span>
          {price !== "Free" && <span className="text-sm text-gray-500 ml-1">/mo</span>}
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      
      <div className="flex-grow space-y-4 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check
              className={cn(
                "mr-2 h-5 w-5",
                feature.included ? "text-blue-600" : "text-gray-300"
              )}
            />
            <span className={cn(
              "text-sm",
              feature.included ? "text-gray-700" : "text-gray-400"
            )}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>
      
      <Button 
        className={cn(
          "mt-auto w-full transition-all", 
          popular 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
        )}
      >
        {ctaText}
      </Button>
    </motion.div>
  );
};

export default PricingCard;
