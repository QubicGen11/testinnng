import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoon, FaSun } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import StarRatings from 'react-star-ratings';

const API_URL = 'http://localhost:8083/api';

const FeedbackDetails = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchOrganization, setSearchOrganization] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [shortView, setShortView] = useState(true);
  const [showEmailFilter, setShowEmailFilter] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showNameFilter, setShowNameFilter] = useState(false);
  const [showOrganizationFilter, setShowOrganizationFilter] = useState(false);
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage] = useState(4);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${API_URL}/feedback`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        let response;
        if (searchEmail) {
          response = await axios.get(`${API_URL}/feedback/suggestions`, { params: { email: searchEmail } });
        } else if (searchName) {
          response = await axios.get(`${API_URL}/feedback/suggestions`, { params: { name: searchName } });
        } else if (searchOrganization) {
          response = await axios.get(`${API_URL}/feedback/suggestions`, { params: { organizationName: searchOrganization } });
        } else {
          setSuggestions([]);
          return;
        }
        console.log('Suggestions fetched:', response.data);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [searchEmail, searchName, searchOrganization]);

  const handleSearchChange = (e) => {
    setSearchEmail(e.target.value);
    setSearchName('');
    setSearchOrganization('');
  };

  const handleSearchNameChange = (e) => {
    setSearchName(e.target.value);
    setSearchEmail('');
    setSearchOrganization('');
  };

  const handleSearchOrganizationChange = (e) => {
    setSearchOrganization(e.target.value);
    setSearchEmail('');
    setSearchName('');
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setShortView(true);
    setShowAllFeedbacks(false);
    try {
      const response = await axios.get(`${API_URL}/feedback`, { params: { email: searchEmail } });
      console.log('Feedback fetched for email:', response.data);
      setSelectedFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch feedback details',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleSearchNameSubmit = async (e) => {
    e.preventDefault();
    setSelectedFeedback(null);
    setShortView(true);
    setShowAllFeedbacks(false);
    try {
      const response = await axios.get(`${API_URL}/feedback`, { params: { name: searchName } });
      console.log('Feedback fetched for name:', response.data);
      if (response.data.length > 0) {
        setSelectedFeedback(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch feedback details',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleSearchOrganizationSubmit = async (e) => {
    e.preventDefault();
    setSelectedFeedback(null);
    setShortView(true);
    setShowAllFeedbacks(false);
    try {
      const response = await axios.get(`${API_URL}/feedback`, { params: { organizationName: searchOrganization } });
      console.log('Feedback fetched for organization:', response.data);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch feedback details',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    let params = {};
  
    if (searchEmail) {
      setSearchEmail(suggestion);
      params = { email: suggestion };
    } else if (searchName) {
      setSearchName(suggestion);
      params = { name: suggestion };
    } else if (searchOrganization) {
      setSearchOrganization(suggestion);
      params = { organizationName: suggestion };
    }
  
    setSuggestions([]);
    setSelectedFeedback(null);
    setShortView(true);
    setShowAllFeedbacks(false);
  
    try {
      const response = await axios.get(`${API_URL}/feedback`, { params });
      console.log('Feedback fetched for suggestion:', response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSelectedFeedback(response.data[0]);
      } else {
        setSelectedFeedback(response.data);
      }
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch feedback details',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };
  

  const handleDateFilterSubmit = async (e) => {
    e.preventDefault();
    setSelectedFeedback(null);
    setShowAllFeedbacks(false);
    try {
      const response = await axios.get(`${API_URL}/feedback/date-range`, { params: { startDate, endDate } });
      console.log('Feedbacks fetched for date range:', response.data);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks within date range:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch feedbacks',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleViewMore = () => {
    setShortView(false);
  };

  const toggleFilter = (filterType) => {
    if (filterType === 'email') {
      setShowEmailFilter(!showEmailFilter);
      setShowDateFilter(false);
      setShowNameFilter(false);
      setShowOrganizationFilter(false);
    } else if (filterType === 'date') {
      setShowDateFilter(!showDateFilter);
      setShowEmailFilter(false);
      setShowNameFilter(false);
      setShowOrganizationFilter(false);
    } else if (filterType === 'name') {
      setShowNameFilter(!showNameFilter);
      setShowEmailFilter(false);
      setShowDateFilter(false);
      setShowOrganizationFilter(false);
    } else if (filterType === 'organization') {
      setShowOrganizationFilter(!showOrganizationFilter);
      setShowEmailFilter(false);
      setShowDateFilter(false);
      setShowNameFilter(false);
    }
  };

  const handleViewAllFeedbacks = () => {
    setShowAllFeedbacks(true);
    setSelectedFeedback(null);
  };

  const formatRatings = (ratings) => {
    return Object.entries(ratings).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join(', ');
  };

  const handleRowSelect = (e, feedback) => {
    if (e.target.checked) {
      setSelectedRows([...selectedRows, feedback]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row !== feedback));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(feedbacks);
      setSelectAll(true);
    } else {
      setSelectedRows([]);
      setSelectAll(false);
    }
  };

  const exportAllToPDF = () => {
    const dataToExport = selectedRows.length > 0 ? selectedRows : feedbacks;
    const doc = new jsPDF();
    doc.text('Feedback Details', 20, 10);
    const tableData = dataToExport.map(feedback => ([
      feedback.email,
      feedback.firstName,
      feedback.lastName,
      feedback.phoneNumber,
      feedback.organizationName,
      feedback.services ? feedback.services.join(', ') : '',
      feedback.individuals ? feedback.individuals.join(', ') : '',
      formatRatings(feedback.professionalism),
      formatRatings(feedback.responseTime),
      formatRatings(feedback.overallServices),
      feedback.feedback,
      feedback.recommend,
      feedback.newsletterSubscribe ? 'Yes' : 'No', // Including the newsletter subscription
    ]));
    doc.autoTable({
      startY: 20,
      head: [['Email', 'First Name', 'Last Name', 'Phone Number', 'Organization', 'Services', 'Individuals', 'Professionalism Ratings', 'Response Time Ratings', 'Overall Services Ratings', 'Feedback', 'Recommend', 'Newsletter']],
      body: tableData,
    });
    doc.save('selected-feedback-details.pdf');
  };

  const exportAllToExcel = () => {
    const dataToExport = selectedRows.length > 0 ? selectedRows : feedbacks;
    const feedbackData = dataToExport.map(feedback => ({
      Email: feedback.email,
      FirstName: feedback.firstName,
      LastName: feedback.lastName,
      PhoneNumber: feedback.phoneNumber,
      Organization: feedback.organizationName,
      Services: feedback.services ? feedback.services.join(', ') : '',
      Individuals: feedback.individuals ? feedback.individuals.join(', ') : '',
      ProfessionalismRatings: formatRatings(feedback.professionalism),
      ResponseTimeRatings: formatRatings(feedback.responseTime),
      OverallServicesRatings: formatRatings(feedback.overallServices),
      Feedback: feedback.feedback,
      Recommend: feedback.recommend,
      Newsletter: feedback.newsletterSubscribe ? 'Yes' : 'No', // Including the newsletter subscription
    }));
    const worksheet = XLSX.utils.json_to_sheet(feedbackData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FeedbackDetails');
    XLSX.writeFile(workbook, 'selected-feedback-details.xlsx');
  };

  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const clearSearchEmail = () => setSearchEmail('');
  const clearSearchName = () => setSearchName('');
  const clearSearchOrganization = () => setSearchOrganization('');

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-[rgba(255,255,255,0)] text-gray-900'} min-h-screen p-8 transition-all duration-300`}>
      <motion.div
        className={`${darkMode ? 'bg-gray-800' : 'bg-[rgba(255,255,255,0.1)]'} backdrop-blur-3xl max-w-4xl mx-auto p-8 rounded-lg shadow-lg`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ backdropFilter: "blur('20px)" }}
      >
        <h2 className="text-center text-2xl font-bold mb-4 text-white">Feedback Details</h2>
        <div className="flex justify-between mb-4">
          <button onClick={() => toggleFilter('email')} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">Search by Email</button>
          <button onClick={() => toggleFilter('date')} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">Filter by Date</button>
          <button onClick={() => toggleFilter('name')} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">Search by Name</button>
          <button onClick={() => toggleFilter('organization')} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">Search by Organization</button>
          <button onClick={handleViewAllFeedbacks} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">View All Feedbacks</button>
        </div>

        {showEmailFilter && (
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <label className="block text-sm font-medium text-white">Search by Email</label>
            <div className="relative flex">
              <div className="relative w-5/12 ">
                <div>
                  <input
                    type="text"
                    value={searchEmail}
                    onChange={handleSearchChange}
                    placeholder="Enter email"
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-300 bg-white text-black"
                  />
                  {searchEmail && (
                    <button
                      type="button"
                      onClick={clearSearchEmail}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black px-2 py-1 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105"
                    >
                      X
                    </button>
                  )}
                </div>
              </div>
              <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">
                Search
              </button>

              {suggestions.length > 0 && (
                <ul className="absolute left-0 top-10 right-0 mt-2 bg-white shadow-lg border border-gray-300">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-2 cursor-pointer text-black hover:bg-gray-200"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        )}

        {showNameFilter && (
          <form onSubmit={handleSearchNameSubmit} className="mb-4">
            <label className="block text-sm font-medium text-white">Search by Name</label>
            <div className="relative flex">
              <div className="relative w-5/12 ">
                <div>
                  <input
                    type="text"
                    value={searchName}
                    onChange={handleSearchNameChange}
                    placeholder="Enter first name + last name"
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-300 bg-white text-black"
                  />
                  {searchName && (
                    <button
                      type="button"
                      onClick={clearSearchName}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black px-2 py-1 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105"
                    >
                      X
                    </button>
                  )}
                </div>
              </div>
              <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">
                Search
              </button>
              {suggestions.length > 0 && (
                <ul className="absolute left-0 top-10 right-0 mt-2 bg-white shadow-lg border border-gray-300">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-2 cursor-pointer text-black hover:bg-gray-200"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        )}

        {showOrganizationFilter && (
          <form onSubmit={handleSearchOrganizationSubmit} className="mb-4">
            <label className="block text-sm font-medium text-white">Search by Office</label>
            <div className="relative flex">
              <div className="relative w-5/12 ">
                <div>
                  <input
                    type="text"
                    value={searchOrganization}
                    onChange={handleSearchOrganizationChange}
                    placeholder="Enter organization name"
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-300 bg-white text-black"
                  />
                  {searchOrganization && (
                    <button
                      type="button"
                      onClick={clearSearchOrganization}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black px-2 py-1 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105"
                    >
                      X
                    </button>
                  )}
                </div>
              </div>
              <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">
                Search
              </button>
              {suggestions.length > 0 && (
                <ul className="absolute left-0 top-10 right-0 mt-2 bg-white shadow-lg border border-gray-300">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-2 cursor-pointer text-black hover:bg-gray-200"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        )}

        {showDateFilter && (
          <form onSubmit={handleDateFilterSubmit} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Filter by Date</label>
            <div className="flex">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-1/2 p-2 border border-gray-300 bg-white text-black"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-1/2 p-2 border border-gray-300 bg-white text-black"
              />
              <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">Filter</button>
            </div>
          </form>
        )}

        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="min-w-full bg-[rgba(255,255,255,0.1)] shadow-md rounded my-6">
            <thead className='bg-[rgba(255,255,255,0.1)]'>
              <tr className='bg-[rgba(255,255,255,0.1)]'>
                <th className="py-3 px-6 bg-[rgba(255,255,255,0.1)] text-white font-bold uppercase text-sm text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-3 px-6 bg-[rgba(255,255,255,0.1)] text-white font-bold uppercase text-sm text-left">Email</th>
                <th className="py-3 px-6 bg-[rgba(255,255,255,0.1)] text-white font-bold uppercase text-sm text-left">First Name</th>
                <th className="py-3 px-6 bg-[rgba(255,255,255,0.1)] text-white font-bold uppercase text-sm text-left">Last Name</th>
                <th className="py-3 px-6 bg-[rgba(255,255,255,0.1)] text-white font-bold uppercase text-sm text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {showAllFeedbacks ? (
                currentFeedbacks.map((feedback, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-6 text-white">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(feedback)}
                        onChange={(e) => handleRowSelect(e, feedback)}
                      />
                    </td>
                    <td className="py-3 px-6 text-white">{feedback.email}</td>
                    <td className="py-3 px-6 text-white">{feedback.firstName}</td>
                    <td className="py-3 px-6 text-white">{feedback.lastName}</td>
                    <td className="py-3 px-6 text-white">
                      <button onClick={() => setSelectedFeedback(feedback)} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">View More</button>
                    </td>
                  </tr>
                ))
              ) : (
                feedbacks.slice(0, 3).map((feedback, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-6 text-white">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(feedback)}
                        onChange={(e) => handleRowSelect(e, feedback)}
                      />
                    </td>
                    <td className="py-3 px-6 text-white">{feedback.email}</td>
                    <td className="py-3 px-6 text-white">{feedback.firstName}</td>
                    <td className="py-3 px-6 text-white">{feedback.lastName}</td>
                    <td className="py-3 px-6 text-white">
                      <button onClick={() => setSelectedFeedback(feedback)} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105">View More</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <nav className="flex justify-center mt-4">
            <ul className="flex pl-0 rounded list-none flex-wrap">
              {Array.from({ length: Math.ceil(feedbacks.length / feedbacksPerPage) }, (_, index) => (
                <li key={index} className="relative block mx-1">
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`${
                      currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-blue-500'
                    } relative block py-1 px-3 leading-tight rounded-full transition-colors duration-300 hover:bg-blue-400 hover:text-white`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={exportAllToExcel} className="bg-green-500 text-white px-4 py-2 rounded-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105 hover:brightness-105 hover:animate-pulse active:animate-bounce">Export to Excel</button>
        </div>

        {selectedFeedback && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <motion.div
              className="bg-white p-4 rounded shadow-md w-1/2 relative"
              style={{ maxHeight: '80vh', overflowY: 'scroll' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">Feedback Details</h3>
                <button onClick={() => setSelectedFeedback(null)} className="absolute top-2 right-2 text-black text-3xl">&times;</button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={selectedFeedback.email}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={selectedFeedback.firstName}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={selectedFeedback.lastName}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={selectedFeedback.phoneNumber}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Organization</label>
                <input
                  type="text"
                  value={selectedFeedback.organizationName}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Services</label>
                <input
                  type="text"
                  value={selectedFeedback.services ? selectedFeedback.services.join(', ') : ''}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Individuals</label>
                <input
                  type="text"
                  value={selectedFeedback.individuals ? selectedFeedback.individuals.join(', ') : ''}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>

              {/* Render custom feedback questions once */}
              {selectedFeedback.customResponses && Object.keys(selectedFeedback.customResponses).map((question, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">{question}</label>
                  <StarRatings
                    rating={parseInt(selectedFeedback.customResponses[question]) || 0}
                    starRatedColor="gold"
                    numberOfStars={5}
                    starDimension="24px"
                    starSpacing="2px"
                  />
                </div>
              ))}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Feedback</label>
                <textarea
                  value={selectedFeedback.feedback}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Recommend</label>
                <input
                  type="text"
                  value={selectedFeedback.recommend}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Newsletter Subscribe</label>
                <input
                  type="text"
                  value={selectedFeedback.newsletterSubscribe ? 'Yes' : 'No'}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white text-black"
                />
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FeedbackDetails;
