import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PlanCard from '../components/PlanCard';
import { useAuth } from '../context/AuthContext';

const TrainerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ trainer: null, plans: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isUser } = useAuth();

  useEffect(() => {
    fetchTrainer();
  }, [id]);

  const fetchTrainer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trainers/${id}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trainer');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/follows/${id}`);
      setData(prev => ({
        ...prev,
        trainer: { ...prev.trainer, isFollowing: true, followerCount: prev.trainer.followerCount + 1 }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.delete(`/follows/${id}`);
      setData(prev => ({
        ...prev,
        trainer: { ...prev.trainer, isFollowing: false, followerCount: prev.trainer.followerCount - 1 }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unfollow');
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/subscriptions/${plan._id}`);
      alert('Successfully subscribed!');
      fetchTrainer();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to subscribe');
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section">
        <div className="alert alert-error">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  const { trainer, plans } = data;

  return (
    <div>
      {/* Profile Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="flex" style={{ alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <div 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold'
              }}
            >
              {trainer?.name?.[0]?.toUpperCase()}
            </div>
            
            <div>
              <h1 style={{ marginBottom: '5px' }}>{trainer?.name}</h1>
              {trainer?.specialization && (
                <p style={{ opacity: 0.9, marginBottom: '10px' }}>{trainer.specialization}</p>
              )}
              {trainer?.bio && (
                <p style={{ opacity: 0.8, maxWidth: '500px' }}>{trainer.bio}</p>
              )}
            </div>
          </div>

          <div className="dashboard-stats" style={{ marginTop: '30px' }}>
            <div className="stat-card">
              <div className="stat-value">{trainer?.planCount || 0}</div>
              <div className="stat-label">Plans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{trainer?.followerCount || 0}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {trainer?.isFollowing ? (
                <button onClick={handleUnfollow} className="btn btn-secondary">
                  Unfollow
                </button>
              ) : (
                <button onClick={handleFollow} className="btn" style={{ background: 'white', color: '#4f46e5' }}>
                  Follow
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Fitness Plans by {trainer?.name}</h2>
          
          {plans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fa-solid fa-cart-clipboard"></i></div>
              <h3>No plans yet</h3>
              <p>This trainer hasn't created any plans yet.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {plans.map(plan => (
                <PlanCard
                  key={plan._id}
                  plan={{ ...plan, trainer }}
                  onSubscribe={isUser ? handleSubscribe : null}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TrainerProfile;
