import { SocialLinks } from './SocialLinks';

export default function Footer() {
  return (
    <footer className="bg-primary-800 text-white border-t border-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-base sm:text-xl text-gray-300">
            © {new Date().getFullYear()} WebGrave. All rights reserved.
          </p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
