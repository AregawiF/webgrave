import React from 'react';
import { Building2, Mail, Phone, MapPin, Heart, QrCode, Users, Shield } from 'lucide-react';

export function AboutUs() {
  const benefits = [
    {
      icon: Heart,
      title: "Preserve Memories Forever",
      description: "Create lasting digital memorials that can be accessed by future generations, ensuring your loved ones' stories are never forgotten."
    },
    {
      icon: QrCode,
      title: "Bridge Physical & Digital",
      description: "Unique QR codes connect physical memorial sites to rich digital content, allowing visitors to learn more about your loved ones."
    },
    {
      icon: Users,
      title: "Connect Families",
      description: "Our family connection feature helps preserve genealogical information and connects related memorials automatically."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Advanced privacy controls ensure sensitive information is only visible to authorized family members."
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create an Account",
      description: "Sign up and verify your email to get started."
    },
    {
      step: 2,
      title: "Enter Memorial Information",
      description: "Provide details about your loved one, including photos, stories, and family connections."
    },
    {
      step: 3,
      title: "Generate QR Code",
      description: "Receive a unique QR code that can be added to physical memorials or shared with family."
    },
    {
      step: 4,
      title: "Share & Connect",
      description: "Invite family members to contribute memories and connect related memorials."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="space-y-16">
          {/* Company Info */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">About WebGrave</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Dedicated to preserving memories and connecting generations through digital memorials.
            </p>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Choose WebGrave?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <benefit.icon className="h-8 w-8 text-primary-600 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-center">
                    <span className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 text-center mt-4 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">WebGrave Corporation</p>
                      <p className="text-gray-600">Digital Memorial Services</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <p className="text-gray-600">123 Memory Lane</p>
                      <p className="text-gray-600">Serenity Valley, CA 90210</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary-600 mr-3" />
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary-600 mr-3" />
                    <p className="text-gray-600">contact@webgrave.com</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 5:00 PM PST</p>
                  <p>Saturday: 10:00 AM - 2:00 PM PST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}