import { Scan, User, UserPlus, LogIn, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// interface Props {
//   onSignupClick: () => void;
//   onLoginClick: () => void;
// }

export default function Home() {
  const navigate = useNavigate();

  const onViewClick = () => {
    // Handle signup click
    navigate('/find-memorials');
  };
  const onScanClick = () => {
    // Handle login click
    navigate('/scan-code');
  }

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
  <div className='relative overflow-hidden bg-primary-50/50'>
    <div className="relative bg-white overflow-hidden ">
      <div className="absolute inset-0 bg-primary-50/50" />
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-surface-900 sm:text-5xl md:text-6xl">
                <span className="block">Memories Made Eternal,</span>
                <span className="block text-primary-600">One Scan Away</span>
              </h1>
              <p className="mt-3 mr-3 text-base text-surface-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Honor your loved ones with digital memorials that connect the physical world with cherished memories. Create lasting tributes accessible through unique QR codes.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
              <button 
                  onClick={onViewClick}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Heart className="h-5 w-5" />
                  View Memorials
                </button>
                <button 
                  onClick={onScanClick}
                  className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 mt-3 sm:mt-0"
                >
                  <Scan className="h-5 w-5" />
                  Scan Code
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="relative h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 via-white/0 to-transparent z-10 lg:block" />
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1501446529957-6226bd447c46?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80"
            alt="Peaceful sunset landscape"
          />
        </div>
      </div>
    </div>
    {/* How It Works */}
    <div className=" rounded-xl p-8 py-28 shadow-sm">
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
  </div>
  );
}