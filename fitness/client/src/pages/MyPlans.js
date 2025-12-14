import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import PlanCard from '../components/PlanCard';

const MyPlans = () => {
  const [subscriptions, setSubscriptions] = useState({ active: [], expired: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.data);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">My Purchased Plans</h1>

        {/* Tabs */}
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
           <i className="fa-solid fa-check"></i> Active ({subscriptions.active?.length || 0})
          </div>
          <div 
            className={`tab ${activeTab === 'expired' ? 'active' : ''}`}
            onClick={() => setActiveTab('expired')}
          >
            <i className="fa-solid fa-alarm-clock"></i> Expired ({subscriptions.expired?.length || 0})
          </div>
        </div>

        {/* Active Plans */}
        {activeTab === 'active' && (
          <>
            {subscriptions.active?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="fa-solid fa-clipboard"></i></div>
                <h3>No active subscriptions</h3>
                <p>Subscribe to fitness plans to access workout details!</p>
                <Link to="/" className="btn btn-primary mt-20">
                  Browse Plans
                </Link>
              </div>
            ) : (
              <div className="grid grid-3">
                {subscriptions.active?.map(sub => (
                  <div key={sub._id}>
                    <PlanCard 
                      plan={{ ...sub.plan, hasAccess: true }}
                    />
                    <div 
                      className="card" 
                      style={{ 
                        marginTop: '-15px', 
                        borderTopLeftRadius: 0, 
                        borderTopRightRadius: 0,
                        padding: '15px',
                        background: '#f0fdf4'
                      }}
                    >
                      <small style={{ color: '#16a34a' }}>
                        <strong>Purchased:</strong> {formatDate(sub.purchaseDate)}
                        <br />
                        <strong>Expires:</strong> {formatDate(sub.expiryDate)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Expired Plans */}
        {activeTab === 'expired' && (
          <>
            {subscriptions.expired?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="fas fa-ban"></i></div>
                <h3>No expired subscriptions</h3>
                <p>All your subscriptions are still active!</p>
              </div>
            ) : (
              <div className="grid grid-3">
                {subscriptions.expired?.map(sub => (
                  <div key={sub._id} style={{ opacity: 0.7 }}>
                    <PlanCard 
                      plan={{ ...sub.plan, hasAccess: false }}
                    />
                    <div 
                      className="card" 
                      style={{ 
                        marginTop: '-15px', 
                        borderTopLeftRadius: 0, 
                        borderTopRightRadius: 0,
                        padding: '15px',
                        background: '#fef2f2'
                      }}
                    >
                      <small style={{ color: '#dc2626' }}>
                        <strong>Expired on:</strong> {formatDate(sub.expiryDate)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPlans;
