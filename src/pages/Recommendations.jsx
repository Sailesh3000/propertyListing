import { useState, useEffect } from 'react';
import { recommendationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Recommendations = () => {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          recommendationService.getReceivedRecommendations(),
          recommendationService.getSentRecommendations()
        ]);
        console.log('Received recommendations:', receivedRes.data);
        console.log('Sent recommendations:', sentRes.data);
        setReceived(receivedRes.data || []);
        setSent(sentRes.data || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderPropertyInfo = (property) => {
    if (!property) {
      console.log('Property is null or undefined');
      return null;
    }
    
    return (
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {property.title}
          </h3>
          <div className="flex flex-col gap-1">
            {property.type && (
              <p className="text-sm text-gray-500">{property.type}</p>
            )}
            {property.city && (
              <p className="text-sm text-gray-500">{property.city}</p>
            )}
            {property.description && (
              <p className="text-sm text-gray-600 mt-1">{property.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          {property.price && (
            <p className="text-lg font-bold text-gray-900">
              ₹{property.price.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Please login to view your recommendations</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Property Recommendations</h2>
        
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('received')}
            >
              Received
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </nav>
        </div>

        {activeTab === 'received' ? (
          received.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Recommendations Received</h3>
              <p className="mt-2 text-sm text-gray-500">When someone recommends a property to you, it will appear here.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6">
              {received.map((rec, index) => (
                <div key={rec._id || `received-${index}`} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      Recommended by: <span className="font-medium">{rec.from?.name || 'A User'}</span>
                      {rec.from?.email && ` (${rec.from.email})`}
                    </p>
                    <p className="text-sm text-gray-500">
                      On: {formatDate(rec.recommendedAt)}
                    </p>
                    {rec.message && (
                      <p className="mt-2 text-sm text-gray-600 italic">"{rec.message}"</p>
                    )}
                  </div>
                  {renderPropertyInfo(rec.property)}
                </div>
              ))}
            </div>
          )
        ) : (
          sent.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Recommendations Sent</h3>
              <p className="mt-2 text-sm text-gray-500">When you recommend properties to others, they will appear here.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6">
              {sent.map((rec, index) => {
                console.log('Rendering sent recommendation:', rec);
                return (
                  <div key={rec._id || `sent-${index}`} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>                          <p className="text-sm text-gray-500">
                            <span className="font-medium">To:</span> {rec.recipientName} ({rec.recipientEmail})
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Status:</span> {rec.status || 'Unread'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(rec.recommendedAt)}
                        </p>
                      </div>
                      {rec.message && (
                        <p className="mt-2 text-sm text-gray-600 italic">"{rec.message}"</p>
                      )}
                    </div>
                    {renderPropertyInfo(rec.property)}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Recommendations;
