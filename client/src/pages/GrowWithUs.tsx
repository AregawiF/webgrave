import React from 'react';
import { Briefcase, Users, Globe, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GrowWithUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center">
            <Users className="mr-3 h-10 w-10 text-primary-600" />
            Grow With Us
          </h1>
          <p className="text-gray-600 mt-4">
            WebGrave is more than just a platform — it's a community. We're building a space where innovation meets compassion, and we’re looking for talented, driven individuals who want to help shape the future of digital memorials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 border rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-2">
              <Briefcase className="mr-2 h-5 w-5 text-primary-500" />
              IT Engineers
            </h3>
            <p className="text-gray-600 text-sm">
              Passionate about secure, scalable systems and innovative tech? Let's talk.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-2">
              <Globe className="mr-2 h-5 w-5 text-primary-500" />
              Marketers
            </h3>
            <p className="text-gray-600 text-sm">
              Have a knack for storytelling and digital growth? We need your voice.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-2">
              <Users className="mr-2 h-5 w-5 text-primary-500" />
              Sales Professionals
            </h3>
            <p className="text-gray-600 text-sm">
              Believe in relationships and purpose-driven work? Join us on our mission.
            </p>
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Affiliate Opportunities</h4>
          <p className="text-gray-600 text-sm">
            We’ve partnered with affiliate platforms so you can help others create meaningful digital memorials — while building income through impact.
          </p>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Location & Flexibility</h4>
          <p className="text-gray-600 text-sm">
            Remote-friendly for most roles. Some positions may require location-specific availability — include your location when applying.
          </p>
        </div>

        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Ready to Apply?
          </h4>
          <p className="text-gray-600 mb-6">
            Send your CV, portfolio (if applicable), and a short intro to <a href="mailto:info@web-grave.com" className="text-primary-600 underline">info@web-grave.com</a> or reach us on our contact page.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Mail className="mr-2 h-5 w-5" />
            Go to Contact Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrowWithUs;
