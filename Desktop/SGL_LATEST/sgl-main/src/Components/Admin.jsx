import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import FeedbackDetails from './FeedbackDetails';
import { MdDeleteOutline } from "react-icons/md";
import Form from './Form';
import axios from 'axios';

const Admin = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('view');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [individualsList, setIndividualsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState(null);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);
  const [newsletterOptions, setNewsletterOptions] = useState([]);
  const [formData, setFormData] = useState({ customResponses: {} });
  const [errors, setErrors] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [clientType, setClientType] = useState('Individual');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await axios.get('http://localhost:8083/api/lists');
        const data = response.data || {};
        setIndividualsList(data.individualsList || []);
        setServicesList(data.servicesList || []);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, []);

  useEffect(() => {
    const fetchDefaultSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8083/api/admin/form-defaults', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data || {};
        console.log('Fetched Default Settings:', data);
        setDefaultSettings({
          email: data.email || '',
          companyEmail: data.companyEmail || '',
          companyName: data.companyName || '',
          companyPhoneNumber: data.companyPhoneNumber || '',
          organizationName: data.organizationName || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          feedbackQuestions: data.feedbackQuestions || [],
          titleOptions: data.titleOptions || [],
          newsletterOptions: data.newsletterOptions || [],
        });
        setCustomQuestions(data.feedbackQuestions || []);
        setTitleOptions(data.titleOptions || []);
        setNewsletterOptions(data.newsletterOptions || []);
        setFormData({
          customResponses: (data.feedbackQuestions || []).reduce((acc, question) => {
            acc[question] = '';
            return acc;
          }, {}),
          title: data.titleOptions && data.titleOptions.length > 0 ? data.titleOptions[0] : '',
          email: data.email || '',
          companyEmail: data.companyEmail || '',
          companyName: data.companyName || '',
          companyPhoneNumber: data.companyPhoneNumber || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          organizationName: data.organizationName || '',
        });
        console.log('Initialized formData:', formData);
      } catch (error) {
        console.error('Error fetching default settings:', error);
        if (error.response && error.response.status === 403) {
          Swal.fire({
            title: 'Access Denied',
            text: 'You do not have permission to access this resource.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    };

    fetchDefaultSettings();
  }, []);

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  const handleUpdateIndividualsList = async (updatedList) => {
    setIndividualsList(updatedList);
  };

  const handleUpdateServicesList = async (updatedList) => {
    setServicesList(updatedList);
  };

  const handleSaveUpdates = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.all([
        axios.post('http://localhost:8083/api/lists/individuals', { updatedList: individualsList }),
        axios.post('http://localhost:8083/api/lists/services', { updatedList: servicesList }),
        axios.post('http://localhost:8083/api/admin/form-defaults', {
          ...defaultSettings,
          feedbackQuestions: customQuestions,
          titleOptions,
          newsletterOptions
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);
      console.log('Saved Updates:', { individualsList, servicesList, defaultSettings, customQuestions, titleOptions, newsletterOptions });
      Swal.fire({
        title: 'Success',
        text: 'All updates saved successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save updates',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleOpenForm = async () => {
    const uniqueId = Date.now();
    const formUrl = `http://localhost:8081/form/${uniqueId}`;
    
    try {
      await axios.post('http://localhost:8083/api/notify-open', { formUrl });
      console.log('Opening Form:', formUrl);
      navigate(`/form/${uniqueId}`);
    } catch (error) {
      console.error('Error opening form:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to open form',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleAddQuestion = () => {
    setCustomQuestions([...customQuestions, '']);
  };

  const handleUpdateQuestion = (index, value) => {
    const updatedQuestions = [...customQuestions];
    updatedQuestions[index] = value;
    setCustomQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = customQuestions.filter((_, i) => i !== index);
    setCustomQuestions(updatedQuestions);
  };

  const handleCustomResponseChange = (question, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customResponses: {
        ...prevFormData.customResponses,
        [question]: value,
      },
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8083/api/admin/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      Swal.fire({
        title: 'Success',
        text: 'Password changed successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to change password',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const toggleCurrentPasswordVisibility = () => {
    setCurrentPasswordVisible(!currentPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 object-cover w-full h-full"
      >
        <source src="https://res.cloudinary.com/defsu5bfc/video/upload/v1721895303/lawyer-2_p11u9h.mp4" type="video/mp4" />
      </video>

      <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} relative z-10 flex flex-col items-center justify-center p-8 bg-black bg-opacity-50 min-h-screen`}>
        <header className="flex justify-between items-center mb-8 w-full max-w-4xl">
          <a href="/">
            <img
              src="https://somireddylaw.com/wp-content/uploads/2022/10/slg-logo-_2_.webp"
              alt="Somireddy Law Group"
              className="w-48 transition-transform duration-300 ease-in-out transform hover:scale-110"
            />
          </a>
        </header>

        <h1 className="text-2xl font-bold mb-8 text-white">Admin Dashboard</h1>
        <div className="flex space-x-4 mb-8 relative">
          <button
            onClick={() => setViewMode('view')}
            className={`bg-blue-500 text-white px-4 py-2 rounded-md ${viewMode === 'view' ? 'bg-blue-700' : ''}`}
          >
            View Feedback
          </button>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <button
              onClick={() => setViewMode('edit-form')}
              className={`bg-blue-500 text-white px-4 py-2 rounded-md ${viewMode === 'edit-form' ? 'bg-blue-700' : ''}`}
            >
              Edit Form
            </button>
          </div>
          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>

        <div className="w-full max-w-4xl">
          {viewMode === 'view' && <FeedbackDetails />}
          {viewMode === 'edit-form' && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-4 rounded shadow-md h-[60vh] w-[60vw] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-black">Client Details</h2>

                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setClientType('Individual')}
                    className={`px-4 py-2 rounded-md ${clientType === 'Individual' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setClientType('Corporate')}
                    className={`px-4 py-2 rounded-md ${clientType === 'Corporate' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Corporate
                  </button>
                </div>

                {clientType === 'Individual' && (
                  <>
                    <div className="mb-8">
                      <div className="flex flex-wrap -mx-2">
                        <div className="mb-4 w-full px-2">
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="text"
                            value={defaultSettings?.email || ''}
                            onChange={(e) => setDefaultSettings({ ...defaultSettings, email: e.target.value })}
                            className="flex-1 p-2 text-black border border-gray-300 rounded"
                            placeholder='Enter Email'
                          />
                        </div>
                        <div className="mb-4 w-full px-2">
                          <div className="flex space-x-8">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Title</label>
                              <input
                                type="text"
                                value={defaultSettings?.title || ''}
                                onChange={(e) => setDefaultSettings({ ...defaultSettings, title: e.target.value })}
                                className="flex-1 p-2 text-black border border-gray-300 rounded"
                                placeholder='Add a title'
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">First Name</label>
                              <input
                                type="text"
                                value={defaultSettings?.firstName || ''}
                                onChange={(e) => setDefaultSettings({ ...defaultSettings, firstName: e.target.value })}
                                className="flex-1 p-2 text-black border border-gray-300 rounded"
                                placeholder='Enter First Name'
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Last Name</label>
                              <input
                                type="text"
                                value={defaultSettings?.lastName || ''}
                                onChange={(e) => setDefaultSettings({ ...defaultSettings, lastName: e.target.value })}
                                className="flex-1 p-2 text-black border border-gray-300 rounded"
                                placeholder='Enter Last Name'
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-4 w-full px-2">
                          <label className="block text-sm font-medium text-gray-700">Phone Number with Country Code</label>
                          <input
                            type="text"
                            value={defaultSettings?.phoneNumber || ''}
                            onChange={(e) => setDefaultSettings({ ...defaultSettings, phoneNumber: e.target.value })}
                            className="flex-1 p-2 text-black border border-gray-300 rounded"
                            placeholder='Enter Phone Number'
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {clientType === 'Corporate' && (
                  <>
                    <div className="mb-8">
                      <div className="flex flex-wrap -mx-2">
                        <div className="mb-4 w-full px-2">
                          <label className="block text-sm font-medium text-gray-700">Company Email</label>
                          <input
                            type="text"
                            value={defaultSettings?.companyEmail || ''}
                            onChange={(e) => setDefaultSettings({ ...defaultSettings, companyEmail: e.target.value })}
                            className="flex-1 p-2 text-black border border-gray-300 rounded"
                            placeholder='Enter Company Email'
                          />
                        </div>
                        <div className="mb-4 w-full px-2">
                          <label className="block text-sm font-medium text-gray-700">Company Name</label>
                          <input
                            type="text"
                            value={defaultSettings?.companyName || ''}
                            onChange={(e) => setDefaultSettings({ ...defaultSettings, companyName: e.target.value })}
                            className="flex-1 p-2 text-black border border-gray-300 rounded mt-2"
                            placeholder='Add Company Name'
                          />
                        </div>
                        <div className="mb-4 w-full px-2">
                          <label className="block text-sm font-medium text-gray-700">Company Phone Number with Country Code</label>
                          <input
                            type="text"
                            value={defaultSettings?.companyPhoneNumber || ''}
                            onChange={(e) => setDefaultSettings({ ...defaultSettings, companyPhoneNumber: e.target.value })}
                            className="flex-1 p-2 text-black border border-gray-300 rounded"
                            placeholder='Enter Company Phone Number'
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <h2 className="text-xl font-bold mb-4 text-black">Office & Employee Details</h2>
                <div className="mb-8">
                  <div className="flex flex-wrap -mx-2">
                    <div className="mb-4 w-full px-2">
                      <label className="block text-sm font-medium text-gray-700">Office Name</label>
                      <input
                        type="text"
                        value={defaultSettings?.organizationName || ''}
                        onChange={(e) => setDefaultSettings({ ...defaultSettings, organizationName: e.target.value })}
                        className="flex-1 p-2 text-black border border-gray-300 rounded mt-2"
                        placeholder='Add Office Name'
                      />
                    </div>
                    <div className="mb-4 w-full px-2">
                      <label className="block text-sm font-medium text-gray-700">Services Provided</label>
                      {servicesList.map((service, index) => (
                        <div key={index} className="flex items-center mb-2 mt-2">
                          <input
                            type="text"
                            value={service}
                            onChange={(e) => {
                              const updatedList = [...servicesList];
                              updatedList[index] = e.target.value;
                              setServicesList(updatedList);
                            }}
                            className="flex-2 text-black mr-2 p-2 border border-gray-300 rounded"
                            placeholder='Add a Service'
                          />
                          <button
                            onClick={() => {
                              const updatedList = servicesList.filter((_, i) => i !== index);
                              setServicesList(updatedList);
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            <MdDeleteOutline />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setServicesList([...servicesList, '']);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                      >
                        Add Service
                      </button>
                    </div>
                    <div className="mb-4 w-full px-2">
                      <label className="block text-sm font-medium text-gray-700">Employee Name and Designation</label>
                      {individualsList.map((individual, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <div>
                            <input
                              type="text"
                              value={individual.name}
                              onChange={(e) => {
                                const updatedList = [...individualsList];
                                updatedList[index].name = e.target.value;
                                setIndividualsList(updatedList);
                              }}
                              className="flex-1 p-2 text-black border border-gray-300 rounded mt-2"
                              placeholder='Employee Name'
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={individual.designation}
                              onChange={(e) => {
                                const updatedList = [...individualsList];
                                updatedList[index].designation = e.target.value;
                                setIndividualsList(updatedList);
                              }}
                              className="flex-1 p-2 text-black border border-gray-300 rounded mt-2"
                              placeholder='Employee Designation'
                            />
                          </div>
                          <button
                            onClick={() => {
                              const updatedList = individualsList.filter((_, i) => i !== index);
                              setIndividualsList(updatedList);
                            }}
                            className="bg-red-500 text-white px-2 rounded h-8 relative top-3"
                          >
                            <MdDeleteOutline />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setIndividualsList([...individualsList, { name: '', designation: '' }]);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                      >
                        Add Employee
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-black">Edit Custom Questions</h3>
                  {customQuestions.map((question, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => handleUpdateQuestion(index, e.target.value)}
                        className="flex-1 mr-2 p-2 text-black border border-gray-300 rounded"
                        placeholder='Add a Custom Field'
                      />
                      <button
                        onClick={() => handleDeleteQuestion(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        <MdDeleteOutline />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddQuestion}
                    className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                  >
                    Add Question
                  </button>
                </div>

                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={handleSaveUpdates}
                    className="bg-blue-500 text-white px-4 py-2 rounded transform hover:scale-110 transition duration-500 ease-in-out"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="bg-gray-500 text-white px-4 py-2 rounded transform hover:scale-110 transition duration-500 ease-in-out"
                  >
                    Preview Form
                  </button>
                  <button
                    onClick={handleOpenForm}
                    className="bg-green-500 text-white px-4 rounded-md transform hover:scale-110 transition duration-500 ease-in-out"
                  >
                    Submit Form
                  </button>
                  <button
                    onClick={() => setViewMode('view')}
                    className="bg-white text-center w-48 rounded-2xl h-14 relative font-sans text-black text-xl font-semibold group"
                  >
                    <div
                      className="bg-red-500 rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500"
                    >
                      <svg
                        width="25px"
                        height="25px"
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="#ffffff"
                          d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                        ></path>
                        <path
                          fill="#ffffff"
                          d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showChangePassword && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-md w-1/3">
              <h2 className="text-xl font-bold mb-4 text-black">Change Password</h2>
              <form onSubmit={handleChangePasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <div className="relative">
                    <input
                      type={currentPasswordVisible ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full p-2 border text-black border-gray-300 rounded"
                      required
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={toggleCurrentPasswordVisibility}
                    >
                      {currentPasswordVisible ? <FaEyeSlash className="text-black" /> : <FaEye className="text-black" />}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <input
                      type={newPasswordVisible ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full p-2 border text-black border-gray-300 rounded"
                      required
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={toggleNewPasswordVisibility}
                    >
                      {newPasswordVisible ? <FaEyeSlash className="text-black" /> : <FaEye className="text-black" />}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

{showPreviewModal && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-4 rounded shadow-md w-2/3 h-2/3 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-black">Preview Form</h2>
      <Form
        clientType={clientType} 
        formData={formData}              // Pass formData from Admin.jsx
        setFormData={setFormData}        // Pass setFormData function to allow editing
        errors={errors}                  // Pass validation errors
        setErrors={setErrors}            // Pass setErrors function
        individualsList={individualsList} // Pass individualsList as a prop
        servicesList={servicesList}       // Pass servicesList as a prop
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowPreviewModal(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default Admin;
