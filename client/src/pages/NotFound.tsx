
import { Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="mx-auto">
        <div className="text-center">
          <Heart className="mx-auto mb-4 text-9xl text-primary-500" />
          <h1 className="text-6xl font-bold tracking-tight">Oops!</h1>
          <p className="mt-2 text-lg">
            It looks like you are lost. The page you are looking for is not here.
          </p>
          <p className="mt-2 text-lg">
            You can try searching for something else or{' '}
            <Link to="/" className="font-bold text-primary-500">
              go back home
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
