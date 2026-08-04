import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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
