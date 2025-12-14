import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TrainerCard from '../components/TrainerCard';
import { useAuth } from '../context/AuthContext';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const trainersRes = await api.get('/trainers');
      setTrainers(trainersRes.data.data);
      
      if (isAuthenticated) {
        const followingRes = await api.get('/follows/following');
        setFollowing(followingRes.data.data.map(f => f.trainer._id));
      }
    } catch (err) {
      console.error('Failed to load trainers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (trainerId) => {
    if (!isAuthenticated) {
      alert('Please login to follow trainers');
      return;
    }
    
    try {
      await api.post(`/follows/${trainerId}`);
      setFollowing([...following, trainerId]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async (trainerId) => {
    try {
      await api.delete(`/follows/${trainerId}`);
      setFollowing(following.filter(id => id !== trainerId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unfollow');
    }
  };

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(search.toLowerCase()) ||
    trainer.specialization?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <h1 className="section-title" style={{ margin: 0 }}>
            Our Trainers <i className="fas fa-user-tie"></i>
          </h1>
          
          <input
            type="text"
            placeholder="Search trainers..."
            className="form-input"
            style={{ maxWidth: '300px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredTrainers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No trainers found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-4">
            {filteredTrainers.map(trainer => (
              <TrainerCard
                key={trainer._id}
                trainer={trainer}
                isFollowing={isAuthenticated ? following.includes(trainer._id) : undefined}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trainers;
