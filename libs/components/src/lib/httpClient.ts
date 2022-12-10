import axios from 'axios';
export const httpClient = axios.create({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  },
});
