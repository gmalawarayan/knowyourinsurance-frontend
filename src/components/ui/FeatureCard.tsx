
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        "glass-card p-6 flex flex-col items-start hover:shadow-md hover:scale-[1.02] transition-all duration-300",
        className
      )}
    >
      <div className="p-3 rounded-full bg-blue-50 text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold font-display mb-2">{title}</h3>
      <p className="text-gray-600 text-left">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
