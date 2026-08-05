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
  if (file) {
    formData.append('cv_file', file);
  }
  
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

/**
 * Generates an ATS CV (DOCX format) from the Master Profile based on a job description.
 * Triggers a file download in the browser.
 * 
 * @param {string} jobDescription - The job description text to tailor the CV.
 * @throws {Error} If the API request fails.
 */
export const generateCV = async (jobDescription) => {
  const formData = new FormData();
  if (jobDescription) {
    formData.append('job_description', jobDescription);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/generate/docx`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // Important for downloading files
    });
    
    // Create a blob from the response
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    // Create a link element, use it to download the file, then remove it
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from Content-Disposition header if available
    let fileName = 'Tailored_CV.docx';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating CV:', error);
    
    // For blob responses, we need to convert the error blob to text to read the detail
    if (error.response && error.response.data && error.response.data instanceof Blob) {
       try {
           const text = await error.response.data.text();
           const errData = JSON.parse(text);
           throw new Error(errData.detail || 'Failed to generate CV.');
       } catch (e) {
           throw new Error('Failed to generate CV.');
       }
    }
    throw new Error('Failed to connect to the server or generate the CV.');
  }
};

/**
 * Generates an ATS CV Preview (JSON) from the Master Profile based on a job description.
 * 
 * @param {string} jobDescription - The job description text to tailor the CV.
 * @param {string} language - The target language for the CV (e.g. 'English', 'Indonesian').
 * @returns {Promise<Object>} The structured CV data.
 * @throws {Error} If the API request fails.
 */
export const generatePreview = async (jobDescription, language = 'English') => {
  const formData = new FormData();
  if (jobDescription) {
    formData.append('job_description', jobDescription);
  }
  if (language) {
    formData.append('language', language);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/generate/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error generating CV preview:', error);
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to generate CV preview.');
  }
};

/**
 * Generates an ATS CV (DOCX format) from a StructuredCV JSON object.
 * Triggers a file download in the browser.
 * 
 * @param {Object} structuredCV - The structured CV data.
 * @throws {Error} If the API request fails.
 */
export const downloadCVFromJson = async (structuredCV) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate/docx/from-json`, structuredCV, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    let fileName = 'Tailored_CV.docx';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error downloading CV from JSON:', error);
    if (error.response && error.response.data && error.response.data instanceof Blob) {
       try {
           const text = await error.response.data.text();
           const errData = JSON.parse(text);
           throw new Error(errData.detail || 'Failed to download CV.');
       } catch (e) {
           throw new Error('Failed to download CV.');
       }
    }
    throw new Error('Failed to download the CV.');
  }
};

/**
 * Generates an ATS CV (PDF format) from a StructuredCV JSON object.
 * Triggers a file download in the browser.
 * 
 * @param {Object} structuredCV - The structured CV data.
 * @throws {Error} If the API request fails.
 */
export const downloadCVPdfFromJson = async (structuredCV) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate/pdf/from-json`, structuredCV, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    let fileName = 'Tailored_CV.pdf';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error downloading CV PDF from JSON:', error);
    if (error.response && error.response.data && error.response.data instanceof Blob) {
       try {
           const text = await error.response.data.text();
           const errData = JSON.parse(text);
           throw new Error(errData.detail || 'Failed to download CV PDF.');
       } catch (e) {
           throw new Error('Failed to download CV PDF.');
       }
    }
    throw new Error('Failed to download the CV PDF.');
  }
};
