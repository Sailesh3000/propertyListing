import { useState, useEffect } from 'react';
import { propertyService, favoriteService } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]); // Store all properties
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    type: '',
    state: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    furnished: '',
    listingType: '',
    minArea: '',
    maxArea: '',
    rating: '',
    isVerified: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchProperties();
        if (user) {
          await fetchFavorites();
        } else {
          setFavorites(new Set());
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]); // Add user as a dependency to reload data when user logs in/out

  const fetchProperties = async () => {
    try {
      const response = await propertyService.getProperties(filters);
      setAllProperties(response.data); // Store all properties
      setProperties(response.data); // Initial display of all properties
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setProperties(allProperties); // Show all properties when search is empty
    } else {
      const filtered = allProperties.filter(property => 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProperties(filtered);
    }
  }, [searchTerm, allProperties]);

  const fetchFavorites = async () => {
    try {
      const response = await favoriteService.getFavorites();
      // Handle both possible response structures
      const favorites = response.data.map(fav => fav._id || fav.property._id);
      setFavorites(new Set(favorites));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.elements.search.value;
    setSearchTerm(value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProperties(); // This will now only fetch when filter buttons are clicked
  };

  const handleFavoriteToggle = async (propertyId) => {
    if (!user) return;
    
    try {
      if (favorites.has(propertyId)) {
        await favoriteService.removeFavorite(propertyId);
      } else {
        await favoriteService.addFavorite(propertyId);
      }
      // Fetch updated favorites after successful toggle
      await fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="page-container">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by property title..."
            defaultValue={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Add instant search
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="card mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Property</h2>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className="input-field">
                <option value="">Any</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
              </select>
            </div>

            <div>
              <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
              <select id="listingType" name="listingType" value={filters.listingType} onChange={handleFilterChange} className="input-field">
                <option value="">Any</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input type="number" id="minPrice" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} className="input-field pl-7" placeholder="0" />
              </div>
            </div>

            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input type="number" id="maxPrice" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} className="input-field pl-7" placeholder="No limit" />
              </div>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" id="state" name="state" value={filters.state} onChange={handleFilterChange} className="input-field" placeholder="Enter state" />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" id="city" name="city" value={filters.city} onChange={handleFilterChange} className="input-field" placeholder="Enter city" />
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select id="bedrooms" name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="input-field">
                <option value="">Any</option>
                <option value="1">1+ bed</option>
                <option value="2">2+ beds</option>
                <option value="3">3+ beds</option>
                <option value="4">4+ beds</option>
                <option value="5">5+ beds</option>
              </select>
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <select id="bathrooms" name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange} className="input-field">
                <option value="">Any</option>
                <option value="1">1+ bath</option>
                <option value="2">2+ baths</option>
                <option value="3">3+ baths</option>
                <option value="4">4+ baths</option>
              </select>
            </div>

            <div>
              <label htmlFor="furnished" className="block text-sm font-medium text-gray-700 mb-1">Furnished</label>
              <select id="furnished" name="furnished" value={filters.furnished} onChange={handleFilterChange} className="input-field">
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label htmlFor="minArea" className="block text-sm font-medium text-gray-700 mb-1">Min Area (sq ft)</label>
              <input type="number" id="minArea" name="minArea" value={filters.minArea} onChange={handleFilterChange} className="input-field" placeholder="0" />
            </div>

            <div>
              <label htmlFor="maxArea" className="block text-sm font-medium text-gray-700 mb-1">Max Area (sq ft)</label>
              <input type="number" id="maxArea" name="maxArea" value={filters.maxArea} onChange={handleFilterChange} className="input-field" placeholder="No limit" />
            </div>

            <div>
              <label htmlFor="isVerified" className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
              <select id="isVerified" name="isVerified" value={filters.isVerified} onChange={handleFilterChange} className="input-field">
                <option value="">Any</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <button type="submit" className="btn-primary w-full flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Properties
              </button>
            </div>
          </form>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Properties Found</h3>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your search filters to find more properties.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              isFavorite={favorites.has(property._id)}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
