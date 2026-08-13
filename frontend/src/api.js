// API service module for interacting with FastAPI backend (Local & Production ready)

let rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
rawBase = rawBase.replace(/\/+$/, '');
const API_BASE = rawBase;

export async function fetchDashboardStats() {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch dashboard statistics.');
  }
  return await response.json();
}

export async function fetchEmployees(activeOnly = false) {
  const url = `${API_BASE}/employees${activeOnly ? '?active_only=true' : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch employees list.');
  }
  return await response.json();
}

export async function createEmployee(name) {
  const response = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create employee.');
  }
  return await response.json();
}

export async function updateEmployee(employeeId, updateData) {
  const response = await fetch(`${API_BASE}/employees/${employeeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update employee status.');
  }
  return await response.json();
}

export async function submitDailyUpdate(updateData) {
  const response = await fetch(`${API_BASE}/updates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit daily update.');
  }
  return await response.json();
}

export async function fetchDailyUpdates(filters = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.employee_id) {
    queryParams.append('employee_id', filters.employee_id);
  }
  if (filters.date) {
    queryParams.append('date', filters.date);
  }
  if (filters.start_date) {
    queryParams.append('start_date', filters.start_date);
  }
  if (filters.end_date) {
    queryParams.append('end_date', filters.end_date);
  }
  if (filters.search) {
    queryParams.append('search', filters.search);
  }
  if (filters.status && filters.status !== 'All') {
    queryParams.append('status', filters.status);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE}/updates${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch daily updates.');
  }
  return await response.json();
}

export async function loginTL(username, password) {
  const response = await fetch(`${API_BASE}/tl/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid username or password.');
  }

  return await response.json();
}

export async function reviewDailyUpdate(updateId, reviewData) {
  const response = await fetch(`${API_BASE}/updates/${updateId}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update daily update status.');
  }

  return await response.json();
}
