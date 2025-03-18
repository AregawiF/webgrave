import { Instagram, Facebook, Twitter, Envelope } from 'lucide-react';

export function SocialLinks() {
  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/webgravememorials/', label: 'Instagram' },
    { icon: Facebook, href: 'https://web.facebook.com/webgrave/', label: 'Facebook' },
    { icon: Twitter, href: 'https://x.com/webgrave', label: 'X' },
    { icon: Envelope, href: 'mailto:info@web-grave.com', label: 'Email' },
  ];

  return (
    <div className="flex space-x-6">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-500 transition-colors"
          aria-label={label}
        >
          <Icon size={24} />
        </a>
      ))}
    </div>
  );
}