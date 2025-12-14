import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import PlanCard from '../components/PlanCard';
import TrainerCard from '../components/TrainerCard';
import { useAuth } from '../context/AuthContext';

const UserFeed = () => {
  const [feed, setFeed] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedRes, followingRes] = await Promise.all([
        api.get('/feed'),
        api.get('/follows/following')
      ]);
      setFeed(feedRes.data.data);
      setFollowing(followingRes.data.data);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      await api.post(`/subscriptions/${plan._id}`);
      alert('Successfully subscribed!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to subscribe');
    }
  };

  const handleUnfollow = async (trainerId) => {
    try {
      await api.delete(`/follows/${trainerId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unfollow');
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
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Welcome back, {user?.name}! <i className="fas fa-dumbbell"></i></h1>
          <p>Your personalized fitness feed</p>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{following.length}</div>
              <div className="stat-label">Following</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{feed.filter(p => p.isSubscribed).length}</div>
              <div className="stat-label">Subscribed Plans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{feed.length}</div>
              <div className="stat-label">Plans in Feed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section">
        <div className="container">
          {/* Tabs */}
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <i className="fas fa-rss"></i> My Feed
            </div>
            <div 
              className={`tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              <i className="fas fa-user-group"></i> Following ({following.length})
            </div>
          </div>

          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <>
              {following.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3>Your feed is empty</h3>
                  <p>Start following trainers to see their fitness plans here!</p>
                  <Link to="/trainers" className="btn btn-primary mt-20">
                    Discover Trainers
                  </Link>
                </div>
              ) : feed.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><i className="fas fa-clipboard"></i></div>
                  <h3>No plans yet</h3>
                  <p>The trainers you follow haven't created any plans yet.</p>
                </div>
              ) : (
                <div className="grid grid-3">
                  {feed.map(plan => (
                    <PlanCard
                      key={plan._id}
                      plan={plan}
                      onSubscribe={handleSubscribe}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <>
              {following.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><i className="fas fa-user-group"></i></div>
                  <h3>You're not following anyone yet</h3>
                  <p>Follow trainers to get their latest fitness plans in your feed.</p>
                  <Link to="/trainers" className="btn btn-primary mt-20">
                    Find Trainers to Follow
                  </Link>
                </div>
              ) : (
                <div className="grid grid-4">
                  {following.map(f => (
                    <TrainerCard
                      key={f._id}
                      trainer={f.trainer}
                      isFollowing={true}
                      onUnfollow={handleUnfollow}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserFeed;
