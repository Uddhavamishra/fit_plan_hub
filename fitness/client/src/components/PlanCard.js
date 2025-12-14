import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PlanCard = ({ plan, onSubscribe, showActions = false, onEdit, onDelete }) => {
  const { isAuthenticated, isUser } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onSubscribe && onSubscribe(plan);
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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'badge-success',
      intermediate: 'badge-warning',
      advanced: 'badge-primary'
    };
    return colors[difficulty] || 'badge-info';
  };

  return (
    <div className="plan-card">
      <div className="plan-card-header">
        <h3 className="plan-card-title">{plan.title}</h3>
        <p className="plan-card-trainer">
          by {plan.trainer?.name || 'Unknown Trainer'}
        </p>
      </div>
      
      <div className="plan-card-body">
        <div className="plan-card-price">
          ₹{(plan.price * 50).toFixed(0)}
        </div>
        
        <div className="plan-card-meta">
          <span><i className="fa-solid fa-calendar"></i> {plan.duration} days</span>
          <span className={`badge ${getDifficultyColor(plan.difficulty)}`}>
            {plan.difficulty}
          </span>
          <span className="badge badge-info">
            {getCategoryLabel(plan.category)}
          </span>
        </div>
        
        <p className="plan-card-description">
          {plan.description}
        </p>
        
        {plan.hasAccess && (
          <div className="alert alert-success" style={{ marginBottom: '15px' }}>
            <i className="fa-solid fa-check"></i> You have access to this plan
          </div>
        )}
        
        <div className="flex gap-10">
          <Link to={`/plans/${plan._id}`} className="btn btn-outline btn-sm">
            View Details
          </Link>
          
          {isUser && !plan.hasAccess && (
            <button onClick={handleSubscribe} className="btn btn-success btn-sm">
              Subscribe - ₹{(plan.price * 50).toFixed(0)}
            </button>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-10 mt-20">
            <button onClick={() => onEdit(plan)} className="btn btn-primary btn-sm">
              <i className="fa-solid fa-pencil"></i> Edit
            </button>
            <button onClick={() => onDelete(plan._id)} className="btn btn-danger btn-sm">
              <i className="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard;
