
import React from "react";
import { motion } from "framer-motion";
import PricingCard from "@/components/ui/PricingCard";

const Pricing: React.FC = () => {
  const plans = [
    {
      title: "Basic",
      price: "Free",
      description: "Perfect for getting started and exploring the platform.",
      features: [
        { text: "5 Projects", included: true },
        { text: "Basic Components", included: true },
        { text: "Community Support", included: true },
        { text: "1GB Storage", included: true },
        { text: "Custom Domain", included: false },
        { text: "Priority Support", included: false },
        { text: "Premium Components", included: false },
      ],
      popular: false,
      ctaText: "Get Started",
    },
    {
      title: "Pro",
      price: "$29",
      description: "For professionals and growing teams with advanced needs.",
      features: [
        { text: "Unlimited Projects", included: true },
        { text: "All Basic Components", included: true },
        { text: "Premium Components", included: true },
        { text: "10GB Storage", included: true },
        { text: "Custom Domain", included: true },
        { text: "Priority Support", included: true },
        { text: "API Access", included: false },
      ],
      popular: true,
      ctaText: "Start Free Trial",
    },
    {
      title: "Enterprise",
      price: "$99",
      description: "For organizations needing complete functionality and support.",
      features: [
        { text: "Unlimited Projects", included: true },
        { text: "All Components", included: true },
        { text: "Unlimited Storage", included: true },
        { text: "Multiple Custom Domains", included: true },
        { text: "24/7 Premium Support", included: true },
        { text: "API Access", included: true },
        { text: "Custom Integrations", included: true },
      ],
      popular: false,
      ctaText: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-medium">
              Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Choose the Perfect Plan for Your Needs
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer flexible pricing options to accommodate projects of all sizes, 
            from individual creators to large organizations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              ctaText={plan.ctaText}
              delay={index}
            />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
