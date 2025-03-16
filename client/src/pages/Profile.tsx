import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


interface Memorial {
  _id: string;
  fullName: string;
  mainPicture: string;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState<User | null>(null);
    const [memorials, setMemorials] = useState<Memorial[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch profile');
                }
                setUser(data.user);
                setMemorials(data.memorials);
                setLoading(false);
            } catch (error:any) {
                setError(error.message);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);


    const handleDeleteProfile = async () => {
        const isConfirmed = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.');
        if (!isConfirmed) return;
        try {
            const response = await fetch('http://localhost:5000/api/auth/delete-profile', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete profile');
            }
            localStorage.removeItem('authToken');
            navigate('/signup');
        } catch (error:any) {
            setError(error.message);
        }
    };

    if (loading){
        return <div className="text-center text-gray-600">Loading...</div>;
    }

    if (!user || error) {
        return <div className="text-center text-gray-600">Something went wrong please refresh the page</div>;
    }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">Profile</h2>
        <div className="bg-gray-200 p-4 rounded-lg mb-6 flex justify-between">
            <div className=" ">
                <h3 className="text-xl font-medium text-gray-700">{user.firstName} {user.lastName}</h3>
                <p className="text-gray-600">{user.email}</p>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => handleDeleteProfile()}>Delete Profile</button>
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Memorials Created</h3>
        {memorials.length === 0 ? (
          <p className="text-gray-600">No memorials created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memorials.map((memorial, index) => (
              <div key={index} className="bg-gray-50 p-4 shadow-md rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/memorial/${memorial._id}`)}>
                <img
                  src={memorial.mainPicture}
                  alt={memorial.fullName}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
                <h4 className="text-lg font-semibold text-gray-800">{memorial.fullName}</h4>
                <p className="text-gray-600 text-sm">Created on: {new Date(memorial.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;