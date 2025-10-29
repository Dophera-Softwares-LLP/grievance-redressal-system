import { api } from '../lib/http';

export const TicketsAPI = {
  create: (payload) => api.post('/tickets', payload).then(r => r.data),
  mine:   (status)  => api.get('/tickets', { params: { status } }).then(r => r.data),
  assigned: ()      => api.get('/tickets/assigned').then(r => r.data)
};