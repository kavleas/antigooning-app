import React, { useState, useEffect } from 'react';

const getUsersFromStorage = () => {
  return JSON.parse(localStorage.getItem('users')) || [];
};

const saveUsersToStorage = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export default function AntiGooningApp() {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(getUsersFromStorage());

  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  const handleLogin = () => {
    const existing = users.find(u => u.name === username);
    if (existing) {
      setCurrentUser(existing);
    } else {
      const newUser = { name: username, streak: 0, failed: false };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
    }
  };

  const handleCheckIn = (didGoon) => {
    const updatedUsers = users.map(user => {
      if (user.name === currentUser.name) {
        if (user.failed) return user;
        if (didGoon) {
          return { ...user, failed: true };
        } else {
          return { ...user, streak: user.streak + 1 };
        }
      }
      return user;
    });
    setUsers(updatedUsers);
    setCurrentUser(updatedUsers.find(u => u.name === currentUser.name));
  };

  const sortedUsers = [...users].sort((a, b) => b.streak - a.streak);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Anti-Gooning Challenge</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded border"
        />
        <button
          onClick={handleLogin}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Welcome, {currentUser.name}</h1>
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={() => handleCheckIn(false)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          ✅ I DID NOT goon today
        </button>
        <button
          onClick={() => handleCheckIn(true)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          ❌ I gooned today
        </button>
      </div>
      <h2 className="text-xl font-bold mt-6 mb-2">🏆 Leaderboard</h2>
      <ul className="space-y-1">
        {sortedUsers.map((user, index) => (
          <li key={index} className="p-2 border rounded flex justify-between items-center">
            <span>{user.name}</span>
            <span>{user.streak} days {user.failed && <span className="ml-2 text-sm text-red-600">🔥 Gooner</span>}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
