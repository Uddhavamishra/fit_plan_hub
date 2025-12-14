import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isUser } = useAuth();

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/plans/${id}`);
      setPlan(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/subscriptions/${plan._id}`);
      alert('Successfully subscribed! You now have full access to this plan.');
      fetchPlan();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to subscribe');
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'weight-loss': 'Weight Loss',
      'muscle-gain': 'Muscle Gain',
      'endurance': 'Endurance',
      'flexibility': 'Flexibility',
      'general-fitness': 'General Fitness'
    };
    return labels[category] || category;
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

  return (
    <div className="section">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-20">
          ← Back
        </button>

        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Plan Header */}
          <div className="plan-card-header" style={{ padding: '30px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{plan.title}</h1>
            <p style={{ fontSize: '1.1rem', opacity: '0.9' }}>
              by {plan.trainer?.name}
            </p>
          </div>

          <div className="card-body" style={{ padding: '30px' }}>
            {/* Access Status */}
            {plan.hasAccess ? (
              <div className="alert alert-success mb-20">
                <i className="fa-solid fa-check"></i> You have full access to this plan
              </div>
            ) : (
              <div className="alert alert-info mb-20">
                <i className="fa-solid fa-lock"></i> Subscribe to unlock the full workout details
              </div>
            )}

            {/* Price and Meta */}
            <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div className="plan-card-price" style={{ fontSize: '2.5rem' }}>
                  ₹{(plan.price * 50).toFixed(0)}
                </div>
                <p style={{ color: '#64748b' }}>One-time payment</p>
              </div>

              <div className="plan-card-meta" style={{ fontSize: '1rem' }}>
                <span className="badge badge-info" style={{ padding: '8px 15px', fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-calendar-days"></i> {plan.duration} days
                </span>
                <span className="badge badge-success" style={{ padding: '8px 15px', fontSize: '0.9rem' }}>
                  {plan.difficulty}
                </span>
                <span className="badge badge-primary" style={{ padding: '8px 15px', fontSize: '0.9rem' }}>
                  {getCategoryLabel(plan.category)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-20">
              <h3 style={{ marginBottom: '10px' }}>Description</h3>
              <p style={{ color: '#475569', lineHeight: '1.8' }}>
                {plan.description}
              </p>
            </div>

            {/* Workout Details - Only visible to subscribers */}
            {plan.hasAccess && plan.workoutDetails && (
              <div className="mb-20">
                <h3 style={{ marginBottom: '10px' }}><i className="fa-solid fa-clipboard"></i> Workout Details</h3>
                <div 
                  style={{ 
                    background: '#f8fafc', 
                    padding: '20px', 
                    borderRadius: '10px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8'
                  }}
                >
                  {plan.workoutDetails}
                </div>
              </div>
            )}

            {/* Trainer Info */}
            <div className="mb-20">
              <h3 style={{ marginBottom: '15px' }}>About the Trainer</h3>
              <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {plan.trainer?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4>{plan.trainer?.name}</h4>
                  {plan.trainer?.specialization && (
                    <p style={{ color: '#64748b' }}>{plan.trainer.specialization}</p>
                  )}
                  {plan.trainer?.bio && (
                    <p style={{ marginTop: '5px' }}>{plan.trainer.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Subscribe Button */}
            {isUser && !plan.hasAccess && (
              <button 
                onClick={handleSubscribe} 
                className="btn btn-success btn-lg" 
                style={{ width: '100%' }}
              >
                <i className="fa-solid fa-cart-shopping"></i> Subscribe Now - ₹{(plan.price * 1).toFixed(0)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
