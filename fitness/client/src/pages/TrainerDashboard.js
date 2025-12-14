import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PlanCard from '../components/PlanCard';
import PlanModal from '../components/PlanModal';
import { useAuth } from '../context/AuthContext';

const TrainerDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, followersRes] = await Promise.all([
        api.get('/plans/trainer/myplans'),
        api.get('/follows/followers')
      ]);
      setPlans(plansRes.data.data);
      setFollowers(followersRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await api.delete(`/plans/${planId}`);
      setPlans(plans.filter(p => p._id !== planId));
      alert('Plan deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleSubmitPlan = async (planData) => {
    try {
      if (editingPlan) {
        // Update existing plan
        const response = await api.put(`/plans/${editingPlan._id}`, planData);
        setPlans(plans.map(p => p._id === editingPlan._id ? response.data.data : p));
        alert('Plan updated successfully!');
      } else {
        // Create new plan
        const response = await api.post('/plans', planData);
        setPlans([response.data.data, ...plans]);
        alert('Plan created successfully!');
      }
      setShowModal(false);
      setEditingPlan(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save plan');
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Welcome, {user?.name}! </h1>
          <p>Manage your fitness plans and grow your community</p>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{plans.length}</div>
              <div className="stat-label">Total Plans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{plans.filter(p => p.isActive).length}</div>
              <div className="stat-label">Active Plans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{followers.length}</div>
              <div className="stat-label">Followers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <section className="section">
        <div className="container">
          <div className="flex-between mb-20">
            <h2 className="section-title">Your Fitness Plans</h2>
            <button onClick={handleCreatePlan} className="btn btn-primary">
              <i className="fas fa-plus"></i> Create New Plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fas fa-clipboard"></i></div>
              <h3>No plans yet</h3>
              <p>Create your first fitness plan to start helping others achieve their goals!</p>
              <button onClick={handleCreatePlan} className="btn btn-primary mt-20">
                Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {plans.map(plan => (
                <PlanCard
                  key={plan._id}
                  plan={{ ...plan, hasAccess: true }}
                  showActions
                  onEdit={handleEditPlan}
                  onDelete={handleDeletePlan}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Followers Section */}
      <section className="section" style={{ background: '#f1f5f9' }}>
        <div className="container">
          <h2 className="section-title">Your Followers ({followers.length})</h2>
          
          {followers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fas fa-user-group"></i></div>
              <h3>No followers yet</h3>
              <p>Create great content and they will come!</p>
            </div>
          ) : (
            <div className="grid grid-4">
              {followers.map(f => (
                <div key={f._id} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%', 
                      background: '#4f46e5', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      fontWeight: 'bold'
                    }}
                  >
                    {f.follower?.name?.[0]?.toUpperCase()}
                  </div>
                  <h4>{f.follower?.name}</h4>
                  <small style={{ color: '#64748b' }}>{f.follower?.email}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Plan Modal */}
      <PlanModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlan(null);
        }}
        onSubmit={handleSubmitPlan}
        initialData={editingPlan}
      />
    </div>
  );
};

export default TrainerDashboard;
