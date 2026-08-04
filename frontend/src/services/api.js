import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Sends the CV file and job description to the backend API for analysis.
 * 
 * @param {File} file - The PDF file of the CV.
 * @param {string} [jobDescription=""] - Optional job description for tailoring.
 * @returns {Promise<Object>} The analysis result from the AI.
 * @throws {Error} If the API request fails or returns an error.
 */
export const analyzeCV = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append('cv_file', file);
  
  if (jobDescription) {
    formData.append('job_description', jobDescription);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing CV:', error);
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to connect to the server or analyze the CV.');
  }
};

/**
 * Fetches the user's Master Profile from the backend.
 * 
 * @returns {Promise<Object>} The master profile data.
 * @throws {Error} If the API request fails.
 */
export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch Master Profile.');
  }
};

/**
 * Updates the user's Master Profile in the backend.
 * 
 * @param {Object} profile - The master profile data to save.
 * @returns {Promise<Object>} Success message from the backend.
 * @throws {Error} If the API request fails.
 */
export const updateProfile = async (profile) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/profile`, profile, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update Master Profile.');
  }
};

/**
 * Extracts profile data from a CV (PDF) using the backend AI service.
 * 
 * @param {File} file - The PDF file to extract from.
 * @returns {Promise<Object>} The extracted master profile data.
 * @throws {Error} If the API request fails.
 */
export const extractProfileFromCV = async (file) => {
  const formData = new FormData();
  formData.append('cv_file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/profile/extract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error extracting profile:', error);
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to extract profile from CV.');
  }
};
