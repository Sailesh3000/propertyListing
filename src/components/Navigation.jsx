import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-indigo-600">PropertyListing</span>
            </Link>
            <div className="hidden md:flex md:items-center md:ml-8 space-x-6">
              <Link to="/properties" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Properties
              </Link>
              {user && (
                <>
                  <Link to="/create-property" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Create Property
                  </Link>
                  <Link to="/favorites" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Favorites
                  </Link>
                  <Link to="/recommendations" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Recommendations
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:inline text-gray-700 font-medium">Welcome, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 shadow-sm hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
