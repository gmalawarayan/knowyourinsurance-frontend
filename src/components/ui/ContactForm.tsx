
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase, checkSupabaseConnection } from "@/lib/supabase";

const ContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Check Supabase connection on component mount
  useEffect(() => {
    checkSupabaseConnection().then(connected => {
      setIsSupabaseConnected(connected);
      if (!connected) {
        console.warn('Supabase connection not available. Contact form will save data locally.');
      }
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Extract first and last name
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create contact data object
      const contactData = { 
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        message: formData.message,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConnected) {
        // Save to Supabase if connected
        const { error } = await supabase
          .from('contacts')
          .insert([contactData]);

        if (error) {
          throw error;
        }
      } else {
        // Fallback to local storage if Supabase is not connected
        const savedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        savedContacts.push(contactData);
        localStorage.setItem('contacts', JSON.stringify(savedContacts));
        console.log('Contact saved to local storage:', contactData);
      }

      toast.success("Message sent! We'll get back to you as soon as possible.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error saving contact info:", error);
      toast.error("Failed to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="glass-card p-8 w-full max-w-lg mx-auto"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={handleChange}
            className="bg-white/70 border border-gray-200"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="bg-white/70 border border-gray-200"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            placeholder="How can we help you?"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="bg-white/70 border border-gray-200 min-h-[120px]"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </motion.form>
  );
};

export default ContactForm;
