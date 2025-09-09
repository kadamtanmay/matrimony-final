// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// const ProfileView = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   // If no state is passed, redirect back to dashboard
//   if (!state || !state.match) {
//     navigate('/dashboard');
//     return null;
//   }

//   const { name, age, img } = state.match;

//   return (
//     <div className="container mt-5">
//       <div className="card shadow-lg">
//         <div className="card-body text-center">
//           <img
//             src={img}
//             alt={name}
//             className="rounded-circle mb-4"
//             style={{ width: '200px', height: '200px' }}
//           />
//           <h1 className="card-title">{name}</h1>
//           <p className="text-muted">Age: {age}</p>
//           <p className="mt-3">
//             <strong>About:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
//             tincidunt eget enim vel auctor. Nulla facilisi.
//           </p>
//           <button className="btn btn-primary mt-4" onClick={() => navigate('/dashboard')}>
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfileView;
