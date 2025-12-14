import React from 'react';
import { Link } from 'react-router-dom';

const TrainerCard = ({ trainer, isFollowing, onFollow, onUnfollow }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="trainer-card">
      <div className="trainer-avatar">
        {getInitials(trainer.name)}
      </div>
      
      <h3 className="trainer-name">{trainer.name}</h3>
      
      {trainer.specialization && (
        <p className="trainer-specialization">{trainer.specialization}</p>
      )}
      
      <div className="trainer-stats">
        <div className="trainer-stat">
          <div className="trainer-stat-value">{trainer.planCount || 0}</div>
          <div className="trainer-stat-label">Plans</div>
        </div>
        <div className="trainer-stat">
          <div className="trainer-stat-value">{trainer.followerCount || 0}</div>
          <div className="trainer-stat-label">Followers</div>
        </div>
      </div>
      
      <div className="flex gap-10" style={{ justifyContent: 'center' }}>
        <Link to={`/trainers/${trainer._id}`} className="btn btn-outline btn-sm">
          View Profile
        </Link>
        
        {isFollowing !== undefined && (
          isFollowing ? (
            <button 
              onClick={() => onUnfollow(trainer._id)} 
              className="btn btn-secondary btn-sm"
            >
              Unfollow
            </button>
          ) : (
            <button 
              onClick={() => onFollow(trainer._id)} 
              className="btn btn-primary btn-sm"
            >
              Follow
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default TrainerCard;
