import React from 'react';
import { Heart, Globe, Users, Shield, QrCode } from 'lucide-react';

const AboutUs: React.FC = () => {
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


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Preserving Memories, Honoring Lives
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            WebGrave is more than a platform. It's a digital sanctuary where memories live forever.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To create a compassionate digital space that celebrates life stories, preserves memories, and provides comfort to those grieving.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <Globe className="mx-auto h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Remembrance</h3>
            <p className="text-gray-600">
              Connect with loved ones across the world, share stories, and keep memories alive through our intuitive digital memorial platform.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Support</h3>
            <p className="text-gray-600">
              Build a supportive community around memories, share tributes, and find solace in collective remembrance.
            </p>
          </div>
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


        <div className="mt-16 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Shield className="h-12 w-12 text-primary-600 mr-4" />
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Our Commitment to Privacy</h3>
                <p className="mt-2 text-gray-600">
                  We understand the sensitivity of memories. Your data is protected with state-of-the-art security measures, ensuring privacy and respect.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <blockquote className="text-2xl italic text-gray-600 max-w-3xl mx-auto">
            "In the tapestry of life, memories are the golden threads that connect us across time and space."
          </blockquote>
          <p className="mt-4 text-gray-500">- WebGrave Team</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
