import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Form from './Components/Form';
import FeedbackDetails from './Components/FeedbackDetails';
import Admin from './Components/Admin';
import AdminLogin from './Components/AdminLogin';
import ProtectedRoute from './Components/ProtectedRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/all" element={<FeedbackDetails />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute component={Admin} />} />
        <Route path="/form/:id" element={<Form />} />  {/* New dynamic form route */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
