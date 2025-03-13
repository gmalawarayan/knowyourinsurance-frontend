
import React from "react";
import { motion } from "framer-motion";
import FeatureCard from "@/components/ui/FeatureCard";
import { 
  Layers, 
  Smartphone, 
  Zap, 
  Code, 
  Shield, 
  RefreshCw 
} from "lucide-react";

const Features: React.FC = () => {
  const features = [
    {
      icon: <Layers size={24} />,
      title: "Beautiful UI Components",
      description: "Pre-designed, customizable UI components that look great out of the box.",
    },
    {
      icon: <Smartphone size={24} />,
      title: "Fully Responsive",
      description: "Designs that look perfect on any device, from mobile to desktop.",
    },
    {
      icon: <Zap size={24} />,
      title: "Lightning Fast",
      description: "Optimized for performance to ensure your sites load quickly.",
    },
    {
      icon: <Code size={24} />,
      title: "Clean Code",
      description: "Well-structured, maintainable code that follows best practices.",
    },
    {
      icon: <Shield size={24} />,
      title: "Secure By Default",
      description: "Built with security in mind to protect your applications.",
    },
    {
      icon: <RefreshCw size={24} />,
      title: "Regular Updates",
      description: "Constant improvements and new features to keep your sites current.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
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
              Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Everything You Need to Create Amazing Websites
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform provides all the tools and components you need to build
            beautiful, responsive websites without the hassle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
