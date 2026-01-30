const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.useMockData = false; 
  }

  async getSessionAnalysis(sessionId) {
    if (this.useMockData) {
      return this._getMockSessionAnalysis();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/analysis`);
      if (!response.ok) throw new Error('Failed to fetch session analysis');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  async getAllSessions(userId = 'current') {
    if (this.useMockData) {
      return this._getMockSessions();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sessions?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getCognitiveFingerprint(userId = 'current') {
    if (this.useMockData) {
      return this._getMockFingerprint();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/fingerprint`);
      if (!response.ok) throw new Error('Failed to fetch cognitive fingerprint');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getLatestSession() {
    if (this.useMockData) {
      return this._getMockSessionAnalysis();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sessions/latest`);
      if (!response.ok) throw new Error('Failed to fetch latest session');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  _getMockSessionAnalysis() {
    const { SAMPLE_SESSION } = require('../data/sampleData');
    return Promise.resolve(SAMPLE_SESSION);
  }

  _getMockSessions() {
    const { SAMPLE_MULTI_SESSION_DATA } = require('../data/sampleData');
    return Promise.resolve(SAMPLE_MULTI_SESSION_DATA);
  }

  _getMockFingerprint() {
    const { SAMPLE_FINGERPRINT } = require('../data/sampleData');
    return Promise.resolve(SAMPLE_FINGERPRINT);
  }
}

export default new ApiService();