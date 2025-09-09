import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './Subscription.css'; // Add custom styles for this page

const Subscription = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user);

  // Check if user is already subscribed
  useEffect(() => {
    if (!user || !user.id) return;
    
    const userId = user.id;
    
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5280/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // 1 means subscribed, 0 means not subscribed
        if (data.subscription_status === 1) {
          setSubscribed(true);
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        setError("Failed to load subscription status");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  const handleSubscribe = async () => {
    if (!subscribed && user && user.id) {
      try {
        setLoading(true);
        setError(null);
        
        // Get auth token
        const token = localStorage.getItem('token') || user.token;
        
        // Try Spring Boot first
        const response = await fetch('http://localhost:8080/user/update-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user.id,
            subscriptionStatus: 1,
            planType: 'premium',
            duration: 'monthly'
          })
        });

        // Fallback to .NET service if Spring Boot fails
        if (!response.ok) {
          const directResponse = await fetch(`http://localhost:5280/api/users/${user.id}?columnName=subscription_status&newValue=1`, {
            method: 'PUT',
          });
          
          if (directResponse.ok) {
            setSubscribed(true);
            alert('You have successfully subscribed!');
          } else {
            throw new Error(`Direct service error! status: ${directResponse.status}`);
          }
        } else {
          const data = await response.json();
          if (data.success) {
            setSubscribed(true);
            alert('You have successfully subscribed!');
          } else {
            throw new Error(data.error || 'Subscription failed');
          }
        }
      } catch (error) {
        console.error("Error subscribing:", error);
        setError('Error subscribing. Please try again later.');
        alert('Error subscribing. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
      <div className="subscription-container">
        <h1>Exclusive Subscription Plan</h1>
        <div className="subscription-card">
          <h3>Premium Access</h3>
          <p className="price">$25/month</p>
          <ul className="features-list">
            <li>Access to all premium features</li>
            <li>Ad-free experience</li>
            <li>Priority customer support</li>
            <li>Exclusive content and offers</li>
          </ul>
          <button 
            onClick={handleSubscribe} 
            className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`}
            disabled={subscribed || loading}
          >
            {loading ? 'Processing...' : subscribed ? 'Subscribed' : 'Subscribe Now'}
          </button>
          {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
        </div>
      </div>
  );
};

export default Subscription;
