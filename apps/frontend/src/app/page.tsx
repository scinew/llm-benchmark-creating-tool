'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  }, [API_URL]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchHealth();
    fetchUsers();
  }, [fetchHealth, fetchUsers]);

  const addUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (response.ok) {
        e.currentTarget.reset();
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Full Stack Monorepo</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Next.js 14 (App Router) + Express + SQLite
        </p>
      </div>

      {health && (
        <div className="mb-8 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Backend Status</h2>
          <p>
            Status: <span className="font-mono">{health.status}</span>
          </p>
          <p>
            Database: <span className="font-mono">{health.database}</span>
          </p>
        </div>
      )}

      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Add User</h2>
        <form onSubmit={addUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add User
          </button>
        </form>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="p-4 border rounded-lg dark:border-gray-700">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
