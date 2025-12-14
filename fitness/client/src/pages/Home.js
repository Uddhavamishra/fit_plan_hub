import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import PlanCard from '../components/PlanCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ category: '', difficulty: '' });
  const { isAuthenticated, isUser } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, [filter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      
      const response = await api.get(`/plans?${params}`);
      setPlans(response.data.data);
    } catch (err) {
      setError('Failed to load plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      await api.post(`/subscriptions/${plan._id}`);
      alert('Successfully subscribed! You now have full access to this plan.');
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to subscribe');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1><i className="fas fa-dumbbell"></i> Transform Your Fitness Journey</h1>
          <p>
            Connect with certified trainers, access personalized fitness plans, 
            and achieve your health goals with FitPlanHub.
          </p>
          
          {!isAuthenticated && (
            <div className="flex gap-20" style={{ justifyContent: 'center' }}>
              <Link to="/signup" className="btn btn-lg" style={{ background: 'white', color: '#4f46e5' }}>
                Get Started Free
              </Link>
              <Link to="/trainers" className="btn btn-lg btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                Browse Trainers
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Plans Section */}
      <section className="section">
        <div className="container">
          <div className="flex-between mb-20">
            <h2 className="section-title">Available Fitness Plans</h2>
            
            <div className="flex gap-10">
              <select 
                className="form-select" 
                style={{ width: 'auto' }}
                value={filter.category}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">All Categories</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
                <option value="general-fitness">General Fitness</option>
              </select>
              
              <select 
                className="form-select" 
                style={{ width: 'auto' }}
                value={filter.difficulty}
                onChange={(e) => setFilter(prev => ({ ...prev, difficulty: e.target.value }))}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : plans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fas fa-clipboard"></i></div>
              <h3>No plans found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {plans.map(plan => (
                <PlanCard 
                  key={plan._id} 
                  plan={plan} 
                  onSubscribe={isUser ? handleSubscribe : null}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: '#f1f5f9' }}>
        <div className="container">
          <h2 className="section-title text-center">Why Choose FitPlanHub?</h2>
          
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}><i className="fas fa-user-tie"></i></div>
              <h3>Certified Trainers</h3>
              <p style={{ color: '#64748b' }}>
                Learn from experienced fitness professionals with proven track records.
              </p>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}><i className="fas fa-chart-line"></i></div>
              <h3>Personalized Plans</h3>
              <p style={{ color: '#64748b' }}>
                Find plans tailored to your fitness level and goals.
              </p>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}><i className="fas fa-hand-fist"></i></div>
              <h3>Real Results</h3>
              <p style={{ color: '#64748b' }}>
                Follow structured programs designed for measurable progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
