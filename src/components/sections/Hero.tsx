
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AnimatedGradient from "@/components/ui/AnimatedGradient";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center py-20 overflow-hidden">
      <AnimatedGradient />
      
      <div className="container mx-auto px-4 sm:px-6 z-10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-block mb-4">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass py-1 px-3 rounded-full text-xs font-medium text-blue-800"
              >
                Introducing DesignCraft
              </motion.span>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6 leading-tight"
            >
              Create <span className="text-gradient">Beautiful</span> Web Experiences
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-600 text-lg mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Build stunning, responsive websites with our intuitive design platform. 
              Transform your vision into reality with pixel-perfect precision.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-medium">
                Get Started
              </Button>
              <Button variant="outline" className="bg-white/80 border-gray-200 text-gray-800 px-6 py-6 text-lg font-medium">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="perspective relative"
          >
            <div className="relative mx-auto w-full max-w-md">
              <motion.div
                animate={{ rotateX: [0, 5, 0], rotateY: [0, 10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
                className="glass-card shadow-xl overflow-hidden aspect-[4/3]"
              >
                <div className="bg-blue-600 h-8 w-full flex items-center px-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-4"></div>
                  <div className="h-20 bg-gray-100 rounded-lg w-full mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-100 rounded-md w-1/3"></div>
                    <div className="h-8 bg-blue-100 rounded-md w-1/3"></div>
                  </div>
                </div>
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60 blur-xl"
              ></motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="absolute -top-6 -left-6 w-20 h-20 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60 blur-xl"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
