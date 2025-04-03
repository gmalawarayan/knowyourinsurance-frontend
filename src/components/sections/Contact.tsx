import React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ui/ContactForm";

const Contact: React.FC = () => {
  const contactDetails = [
    {
      icon: <Mail className="h-5 w-5 text-blue-600" />,
      title: "Email",
      details: "analyseyourpolicy@gmail.com",
      link: "mailto:analyseyourpolicy@gmail.com",
    },
    {
      icon: <Phone className="h-5 w-5 text-blue-600" />,
      title: "Phone",
      details: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: <MapPin className="h-5 w-5 text-blue-600" />,
      title: "Office",
      details: "100 Innovation Drive, San Francisco, CA",
      link: "#",
    },
  ];

  return (
    <section id="contact" className="py-24 bg-gray-50">
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
              Contact
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help. Reach out to our team
            and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          
          <div className="space-y-6">
            {contactDetails.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-full mr-4">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-display mb-1">
                      {item.title}
                    </h3>
                    <a 
                      href={item.link}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {item.details}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
