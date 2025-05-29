import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { favoriteService, recommendationService, authService, propertyService } from '../services/api';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const PropertyCard = ({ property, isFavorite, onFavoriteToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log('Property:', property);
  console.log('User:', user);
  const [recommendEmail, setRecommendEmail] = useState('');
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [recommendError, setRecommendError] = useState('');
  const [recommendSuccess, setRecommendSuccess] = useState(false);  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const isOwnProperty = user && property.createdBy && property.createdBy.toString() === user._id;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    try {
      onFavoriteToggle(property._id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleEmailSearch = async (email) => {
    setRecommendEmail(email);
    setRecommendError('');
    setSelectedUser(null);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Don't search if email is too short
    if (email.length < 3) {
      setSearchResults([]);
      return;
    }

    // Set new timeout to search
    const timeoutId = setTimeout(async () => {
      try {
        const response = await authService.searchUsers(email);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    }, 300);

    setSearchTimeout(timeoutId);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setRecommendEmail(user.email);
    setSearchResults([]);
  };

  const handleRecommendSubmit = async (e) => {
    e.preventDefault();
    setRecommendError('');
    setRecommendSuccess(false);

    if (!selectedUser) {
      setRecommendError('Please select a registered user from the search results');
      return;
    }

    try {
      await recommendationService.recommendProperty({
        recipientEmail: selectedUser.email,
        propertyId: property._id,
        message: `Check out this ${property.type} in ${property.city}!`
      });
      setRecommendSuccess(true);
      setRecommendEmail('');
      setSelectedUser(null);
      setTimeout(() => {
        setShowRecommendForm(false);
        setRecommendSuccess(false);
      }, 2000);
    } catch (error) {
      setRecommendError(error.response?.data?.error || 'Failed to send recommendation');
    }
  };

  const handleEdit = () => {
    navigate(`/edit-property/${property._id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(property._id);
        // Refresh the properties list by triggering a re-fetch
        window.location.reload();
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };
  return (
    <div className="card group h-full flex flex-col transition-shadow duration-300">
      <div className="relative p-4 rounded-t-lg" style={{ backgroundColor: property.colorTheme }}>
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{property.title}</h3>
        <p className="text-2xl font-bold text-white">₹{property.price.toLocaleString()}</p>        <div className="absolute top-3 right-3 flex gap-2">
          {isOwnProperty && (
            <>
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-full bg-white shadow hover:bg-white/90 transition-colors duration-200"
                title="Edit property"
              >
                <PencilSquareIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-full bg-white shadow hover:bg-white/90 transition-colors duration-200"
                title="Delete property"
              >
                <TrashIcon className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}
          {user && (
            <button
              onClick={handleFavoriteClick}
              className="p-1.5 rounded-full bg-white shadow hover:bg-white/90 transition-colors duration-200"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <HeartSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartOutline className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center text-gray-600 mb-3">
          <svg className="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-xs truncate">{property.city}, {property.state}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full p-3 bg-gray-50 rounded-lg mb-3">
          <span className="flex items-center justify-center flex-col">
            <svg className="h-5 w-5 text-indigo-500 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">{property.bedrooms} Beds</span>
          </span>
          <span className="flex items-center justify-center flex-col">
            <svg className="h-5 w-5 text-indigo-500 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs font-medium">{property.bathrooms} Baths</span>
          </span>
          <span className="flex items-center justify-center flex-col">
            <svg className="h-5 w-5 text-indigo-500 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-xs font-medium">{property.areaSqFt} sqft</span>
          </span>
          <span className="flex items-center justify-center flex-col">
            <svg className="h-5 w-5 text-indigo-500 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-xs font-medium">{property.rating.toFixed(1)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {property.isVerified && (
            <div className="flex items-center bg-green-100 px-2 py-0.5 rounded-full">
              <svg className="h-3 w-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-medium text-green-800">Verified</span>
            </div>
          )}
          <div className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium text-gray-800">
            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {property.amenities && property.amenities.map((amenity, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {amenity}
            </span>
          ))}
          {property.tags && property.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {tag}
            </span>
          ))}
          {property.furnished && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Furnished
            </span>
          )}
        </div>

        <div className="text-xs text-gray-600 mb-3">
          <div className="mb-1">
            <span className="font-medium">Listed by:</span> {property.listedBy}
          </div>
          <div>
            <span className="font-medium">Available from:</span> {formatDate(property.availableFrom)}
          </div>
        </div>

        <div className="mt-auto">
          {showRecommendForm ? (
            <div className="p-4 bg-gray-50 rounded-b-lg">
              <form onSubmit={handleRecommendSubmit} className="space-y-3">
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Search User by Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={recommendEmail}
                    onChange={(e) => handleEmailSearch(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter registered user's email"
                    required
                  />
                  {searchResults.length > 0 && !selectedUser && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <span className="text-gray-900">{user.name}</span>
                          <span className="text-gray-500 text-sm">({user.email})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <p className="text-sm text-green-600">
                    Recommending to: {selectedUser.name} ({selectedUser.email})
                  </p>
                )}
                {recommendError && (
                  <p className="text-sm text-red-600">{recommendError}</p>
                )}
                {recommendSuccess && (
                  <p className="text-sm text-green-600">Recommendation sent successfully!</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 font-medium text-sm"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecommendForm(false);
                      setSelectedUser(null);
                      setRecommendEmail('');
                      setRecommendError('');
                    }}
                    className="py-2 px-3 text-center text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => user ? setShowRecommendForm(true) : window.location.href = '/login'}
              className="block w-full py-2 px-3 text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-b-lg transition-colors duration-200 font-medium text-sm"
            >
              Recommend to a Friend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
