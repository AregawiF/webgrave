import { useState, useEffect } from 'react';
import { 
  Trash2, Edit, Eye, DollarSign, AlertTriangle, 
  Flower2, Users, CreditCard, Database, Grid, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

interface Tribute {
  _id: string;
  sender: User;
  receiver: User;
  amount: number;
  transactionId: string;
  createdAt: Date;
}

interface Memorial {
  _id: string;
  fullName: string;
  totalTributes: number;
  createdAt: Date;
}

interface Stats {
  totalMemorials: number;
  memorialRevenue: number;
  flowerRevenue: number;
  totalRevenue: number;
  totalUsers: number;
  recentMemorials: Memorial[];
  recentTributes: {
    amount: number;
    createdAt: Date;
  }[];
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [numberOfTributes, setNumberOfTributes] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [tributePage, setTributePage] = useState(1);
  const [usersPerPage] = useState(10);
  const [tributesPerPage] = useState(10);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalTributePages, setTotalTributePages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState('desc');
  const [tributeSortBy, setTributeSortBy] = useState('createdAt');
  const [tributeSortOrder, setTributeSortOrder] = useState('desc');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(
        `https://webgrave.onrender.com/api/admin/users?page=${userPage}&limit=${usersPerPage}&search=${userSearch}&sortBy=${userSortBy}&sortOrder=${userSortOrder}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          method: 'GET',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching users:', errorData);
        setError(errorData.message || 'Failed to fetch users');
        return;
      }
      
      const data = await response.json();
      console.log('users', data);
      setUsers(data.users);
      setTotalUserPages(data.totalPages);
      setNumberOfTributes(data.total);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setError('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTributes = async (currentPage = tributePage, currentSortBy = tributeSortBy, currentSortOrder = tributeSortOrder) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(
        `https://webgrave.onrender.com/api/admin/tributes?page=${currentPage}&limit=${tributesPerPage}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          method: 'GET',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching tributes:', errorData);
        setError(errorData.message || 'Failed to fetch tributes');
        return;
      }
      
      const data = await response.json();
      console.log('tributes', data);
      setTributes(data.tributes);
      setTotalTributePages(data.totalPages);
      setNumberOfTributes(data.total);
    } catch (error) {
      console.error('Error in fetchAllTributes:', error);
      setError('An error occurred while fetching tributes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalUserPages) {
      setUserPage(newPage);
      fetchUsers();
    }
  };

  const handleTributePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalTributePages) {
      setTributePage(newPage);
      fetchAllTributes();
    }
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearch(e.target.value);
    setUserPage(1);
    fetchUsers();
  };

  const handleUserSort = (sortBy: string) => {
    setUserSortBy(sortBy);
    setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    setUserPage(1);
    fetchUsers();
  };

  const handleTributeSort = (sortBy: string) => {
    setTributeSortBy(sortBy);
    setTributeSortOrder(tributeSortOrder === 'asc' ? 'desc' : 'asc');
    setTributePage(1);
    fetchAllTributes();
  };

  useEffect(() => {
    fetchUsers();
    fetchAllTributes();
  }, [userPage, tributePage, userSearch, userSortBy, userSortOrder, tributeSortBy, tributeSortOrder]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log("No auth token found");
        setError("Authentication required. Please log in.");
        navigate('/login');
        return;
      }

      // Check if user has admin role from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            setIsAdmin(true);

            // Fetch stats
            const statsResponse = await fetch('https://webgrave.onrender.com/api/admin/dashboard', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              method: 'GET',
            });
            
            if (!statsResponse.ok) {
              const errorData = await statsResponse.json();
              console.log('error fetching stats', errorData);
              setError('Failed to fetch stats');
              return;
            }
            
            const statsData = await statsResponse.json();
            setStats(statsData);
          } else {
            setError("You need admin privileges to access this page.");
            navigate('/');
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          setError("Error checking admin status.");
        }
      } else {
        setError("User session data missing.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Admin check error:", error);
      setError("Something went wrong while checking admin access.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/"
              className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="mt-4 bg-white rounded-lg shadow p-6">
            <p>Loading admin dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteUser = async (userId: string) => {
    const token = localStorage.getItem('authToken');
    
    const isConfirmed = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.');
    if (!isConfirmed) return;
    try {
        const response = await fetch(`https://webgrave.onrender.com/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete profile');
        }
        fetchUsers();
    } catch (error:any) {
        setError(error.message);
    }
  }

  const handleDeleteTribute = async (flowerId: string) => { 
      const isConfirmed = window.confirm('Are you sure you want to delete this tribute? This action cannot be undone.');
      if (!isConfirmed) return;
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`https://webgrave.onrender.com/api/admin/tributes/${flowerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete tribute');
        }
        fetchAllTributes();
      } catch (error:any) {
        setError(error.message);
      }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-500">Manage your platform and track metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">${stats.totalRevenue}</p>
            <p className="mt-1 text-sm text-gray-500">Combined from all sources</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Memorial Revenue</h3>
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">${stats.memorialRevenue}</p>
            <p className="mt-1 text-sm text-gray-500">From memorial creations</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Flower Revenue</h3>
              <Flower2 className="h-5 w-5 text-pink-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">${stats.flowerRevenue}</p>
            <p className="mt-1 text-sm text-gray-500">From flower tributes</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Total Memorials</h3>
              <Grid className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalMemorials}</p>
            <p className="mt-1 text-sm text-gray-500">Active memorials</p>
          </div>
        </div>

        {/* Simple dashboard info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Users Section */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="space-y-4">
                {users.map(user => (
                  user &&
                  <div key={user._id} className="bg-gray-50 p-4 rounded-lg shadow">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                      <div>
                        <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-500 text-white px-4 py-2 mt-2 md:mt-0 rounded-md font-medium hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalUserPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <nav className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleUserPageChange(userPage - 1)}
                      disabled={userPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="px-4 py-2">
                      Page {userPage} of {totalUserPages}
                    </span>
                    <button
                      onClick={() => handleUserPageChange(userPage + 1)}
                      disabled={userPage === totalUserPages}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>

            {/* Tributes Section */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Tributes</h2>
              <p className="text-lg font-medium">Number of Flowers: {numberOfTributes}</p>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-3 text-left">Sender</th>
                      <th className="px-6 py-3 text-left">Receiver</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tributes.map((tribute) => (
                      <tr key={tribute._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{tribute.sender?.firstName} {tribute.sender?.lastName}</td>
                        <td className="px-6 py-4">{tribute.receiver?.firstName} {tribute.receiver?.lastName}</td>
                        <td className="px-6 py-4">${tribute.amount}</td>
                        <td className="px-6 py-4">{new Date(tribute.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteTribute(tribute._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalTributePages > 1 && (
                <div className="mt-6 flex justify-center">
                  <nav className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleTributePageChange(tributePage - 1)}
                      disabled={tributePage === 1}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="px-4 py-2">
                      Page {tributePage} of {totalTributePages}
                    </span>
                    <button
                      onClick={() => handleTributePageChange(tributePage + 1)}
                      disabled={tributePage === totalTributePages}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;