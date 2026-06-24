import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import type { PendingProvider } from '../types/admin';

const ProviderQueue = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await adminService.getPendingProviders();
        setProviders(response.data);
      } catch (error) {
        console.error('Failed to fetch pending providers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/directory')}
          className="text-gray-600 hover:text-gray-800"
        >
          &larr; Back to Directory
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Provider Verification Queue</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800">
          Provider approval is now automatic on profile save.
        </h3>
        <p className="text-yellow-700 mt-1">
          This screen is retained for reference and may be repurposed or removed later.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No pending providers</div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
            >
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                <p className="text-gray-600">@{provider.username}</p>
                <p className="text-gray-500 text-sm">{provider.email}</p>
                {provider.skillTitle && (
                  <p className="text-gray-600 mt-1">{provider.skillTitle}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  Applied: {new Date(provider.providerAppliedAt || provider.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderQueue;
