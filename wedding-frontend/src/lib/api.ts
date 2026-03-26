import type { Order, TeamMember, PricingItem } from "./types";

const API_BASE = '/api';

export const api = {
  // Orders (Component 01)
  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${API_BASE}/booking`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },
  getLatestOrderNumber: async (): Promise<{ nextOrderNumber: string }> => {
    const res = await fetch(`${API_BASE}/booking/latest-number`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch latest order number');
    return res.json();
  },
  getOrderById: async (id: string): Promise<Order> => {
    const res = await fetch(`${API_BASE}/booking/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },
  getOrderByToken: async (tokenType: string, token: string): Promise<Order> => {
    const res = await fetch(`${API_BASE}/booking/token/${tokenType}/${token}`);
    if (!res.ok) throw new Error('Failed to fetch order by token');
    return res.json();
  },
  createOrder: async (data: Partial<Order>): Promise<Order> => {
    const res = await fetch(`${API_BASE}/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },
  updateOrder: async (id: string, data: Partial<Order>): Promise<Order> => {
    const res = await fetch(`${API_BASE}/booking/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },
  deleteOrder: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/booking/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Failed to delete order');
  },

  // Pricing (Component 01 Member 1)
  getPricingItems: async (): Promise<PricingItem[]> => {
    const res = await fetch(`${API_BASE}/booking/pricing`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch pricing items');
    return res.json();
  },
  createPricingItem: async (data: Partial<PricingItem>): Promise<PricingItem> => {
    const res = await fetch(`${API_BASE}/booking/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create pricing item');
    return res.json();
  },
  updatePricingItem: async (id: string, data: Partial<PricingItem>): Promise<PricingItem> => {
    const res = await fetch(`${API_BASE}/booking/pricing/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update pricing item');
    return res.json();
  },
  deletePricingItem: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/booking/pricing/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Failed to delete pricing item');
  },

  // Team (Component 04)
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const res = await fetch(`${API_BASE}/team-location/team`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch team');
    return res.json();
  },
  createTeamMember: async (data: Partial<TeamMember>): Promise<TeamMember> => {
    const res = await fetch(`${API_BASE}/team-location/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create team member');
    return res.json();
  },
  updateTeamMember: async (id: string, data: Partial<TeamMember>): Promise<TeamMember> => {
    const res = await fetch(`${API_BASE}/team-location/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update team member');
    return res.json();
  },
  deleteTeamMember: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/team-location/team/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Failed to delete team member');
  },

  // Locations (Component 04)
  getLocations: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/team-location/locations`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
  },
  createLocation: async (data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/team-location/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create location');
    return res.json();
  },
  updateLocation: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/team-location/locations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update location');
    return res.json();
  },
  deleteLocation: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/team-location/locations/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Failed to delete location');
  },

  // Availability (Component 04)
  getAvailability: async (date: string): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/team-location/availability?date=${date}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch availability');
    return res.json();
  },

  // Auth
  login: async (username: string, password: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  logout: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error('Logout failed');
  },

  // Agreement (Component 02)
  signAgreement: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/agreement/sign/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to sign agreement');
    return res.json();
  },
  confirmPayment: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/agreement/payment/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to confirm payment');
    return res.json();
  },

  // Events (Component 03)
  getEvents: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/events`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },
  createManualEvent: async (data: { title: string; date: Date | string; description?: string, assignedTeam?: string[] }): Promise<any> => {
    const res = await fetch(`${API_BASE}/events/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to create manual event');
    }
    return res.json();
  },
  deleteManualEvent: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/events/manual/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete manual event');
  }
};
