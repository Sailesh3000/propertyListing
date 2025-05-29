import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');

  const getRandomColor = () => {
    const colors = [
      '#4F46E5',  // indigo
      '#7C3AED',  // violet
      '#EC4899',  // pink
      '#06B6D4',  // cyan
      '#8B5CF6',  // purple
      '#10B981',  // emerald
      '#F59E0B',  // amber
      '#EF4444'   // red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    price: '',
    state: '',
    city: '',
    colorTheme: getRandomColor(),
    areaSqFt: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    furnished: false,
    availableFrom: '',
    listedBy: user?.name || '',
    tags: '',
    listingType: 'rent',
    rating: 0,
    isVerified: false,
    colorTheme: getRandomColor()
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Transform data before sending
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        areaSqFt: parseFloat(formData.areaSqFt),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        amenities: formData.amenities.split(',').map(item => item.trim()),
        tags: formData.tags.split(',').map(item => item.trim()),
        rating: parseFloat(formData.rating),
      };

      await propertyService.createProperty(propertyData);
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create property');
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Please login to create a property listing</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card max-w-3xl mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Property Listing</h2>
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="input-field"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  id="type"
                  name="type"
                  required
                  className="input-field"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    className="input-field pl-7"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <select
                  id="listingType"
                  name="listingType"
                  required
                  className="input-field"
                  value={formData.listingType}
                  onChange={handleChange}
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  className="input-field"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="input-field"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="areaSqFt" className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                <input
                  type="number"
                  id="areaSqFt"
                  name="areaSqFt"
                  required
                  min="0"
                  className="input-field"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  required
                  min="0"
                  className="input-field"
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  required
                  min="0"
                  className="input-field"
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                <input
                  type="date"
                  id="availableFrom"
                  name="availableFrom"
                  required
                  className="input-field"
                  value={formData.availableFrom}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  id="amenities"
                  name="amenities"
                  className="input-field"
                  placeholder="e.g., Swimming Pool, Gym, Parking"
                  value={formData.amenities}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="input-field"
                  placeholder="e.g., Modern, Pet Friendly, Garden"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="furnished"
                    name="furnished"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.furnished}
                    onChange={handleChange}
                  />
                  <label htmlFor="furnished" className="ml-2 block text-sm text-gray-700">
                    Furnished
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Color Theme
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    '#4F46E5',  // indigo
                    '#7C3AED',  // violet
                    '#EC4899',  // pink
                    '#06B6D4',  // cyan
                    '#8B5CF6',  // purple
                    '#10B981',  // emerald
                    '#F59E0B',  // amber
                    '#EF4444'   // red
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorTheme: color })}
                      className={`w-8 h-8 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-500 transition-all ${
                        formData.colorTheme === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select ${color} theme`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/properties')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Create Property
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
