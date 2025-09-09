import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const ViewProfile = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const match = location.state?.match;

  const [profileImage, setProfileImage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalEmoji, setModalEmoji] = useState('');

  useEffect(() => {
    if (match) {
      const fetchProfileImage = async () => {
        try {
          const response = await axios.get('http://localhost:8080/profile-picture', { params: { userId: match.id } });
          setProfileImage(response.data); // Set profile image URL for the match
        } catch (error) {
          console.error("Error fetching profile image", error);
          setProfileImage('https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg?s=612x612&w=0&k=20&c=qFrzn8TqONiSfwevvkYhys1z80NAmDfw3o-HRdwX0d8=');
        }
      };

      fetchProfileImage();
    }
  }, [match]);

  if (!match || match.firstName !== name) {
    return (
      <div className="container-fluid p-4">
        <h2 className="text-center text-danger">Profile not found</h2>
      </div>
    );
  }

  const handleButtonClick = (action) => {
    if (action === 'send') {
      setModalMessage('Redirecting to message screen...');
      setModalEmoji('😊');
      setIsModalOpen(true);

      setTimeout(() => {
        navigate(`/messages/${match.id}`);
      }, 1500);
    } else if (action === 'report') {
      setModalMessage('Profile has been reported!');
      setModalEmoji('😞');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const defaultImage =
    'https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg?s=612x612&w=0&k=20&c=qFrzn8TqONiSfwevvkYhys1z80NAmDfw3o-HRdwX0d8=';

  return (
    <>
      <div className="container-fluid p-4 text-center">
        <div className="card shadow-lg p-4 rounded-lg">
          {/* Display the profile image */}
          <img
            src={profileImage || defaultImage}
            alt={match.firstName}
            className="rounded-circle mb-3 border border-5 border-light"
            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
          />
          <h1 className="display-4 text-dark font-weight-bold mb-3">
            {match.firstName} {match.lastName}
          </h1>
          <p className="text-muted lead">{match.bio || 'Bio not available'}</p>

          <div className="row mt-4">
            <div className="col-md-6 text-left">
              <p className="text-muted"><strong>Address:</strong> {match.address || 'Not Available'}</p>
              <p className="text-muted"><strong>Date of Birth:</strong> {match.dateOfBirth || 'Not Available'}</p>
              <p className="text-muted"><strong>Email:</strong> {match.email || 'Not Available'}</p>
              <p className="text-muted"><strong>Phone:</strong> {match.phone || 'Not Available'}</p>
              <p className="text-muted"><strong>Religion:</strong> {match.religion || 'Not Available'}</p>
              <p className="text-muted"><strong>Location:</strong> {match.location || 'Not Available'}</p>
            </div>

            <div className="col-md-6 text-left">
              <p className="text-muted"><strong>Annual Income:</strong> {match.annualIncome || 'Not Available'}</p>
              <p className="text-muted"><strong>Caste:</strong> {match.caste || 'Not Available'}</p>
              <p className="text-muted"><strong>Marital Status:</strong> {match.maritalStatus || 'Not Available'}</p>
              <p className="text-muted"><strong>Mother Tongue:</strong> {match.motherTongue || 'Not Available'}</p>
              <p className="text-muted"><strong>Education:</strong> {match.education || 'Not Available'}</p>
              <p className="text-muted"><strong>Gender:</strong> {match.gender || 'Not Available'}</p>
              <p className="text-muted"><strong>Hobbies:</strong> {match.hobbies || 'Not Available'}</p>
              <p className="text-muted"><strong>Profession:</strong> {match.profession || 'Not Available'}</p>
            </div>
          </div>

          <div className="mt-4">
            <button
              className="btn btn-primary btn-lg mx-2"
              onClick={() => handleButtonClick('send')}
            >
              Send Message
            </button>
            <button
              className="btn btn-danger btn-lg mx-2"
              onClick={() => handleButtonClick('report')}
            >
              Report Profile
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Action Confirmation"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="text-center">
          <h3 className="mb-3">{modalMessage}</h3>
          <h1 className="emoji">{modalEmoji}</h1>
          <button className="btn btn-secondary mt-3" onClick={closeModal}>
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ViewProfile;
