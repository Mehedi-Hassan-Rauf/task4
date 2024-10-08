import axios from 'axios';
import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [action, setAction] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get(`https://task4-server-jxfl.onrender.com/api/users`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => {setUsers(res.data);console.log(res)})
      .catch(err => console.log(err));
  };

  const handleActionChange = (e) => {
    setAction(e.target.value);
  };

  const handleBulkAction = () => {
    if (action === 'block') {
      selectedUsers.forEach(userId => blockUser(userId));
    } else if (action === 'unblock') {
      selectedUsers.forEach(userId => unblockUser(userId));
    } else if (action === 'delete') {
      selectedUsers.forEach(userId => deleteUser(userId));
    }
    setSelectedUsers([]);
    setAction('');
  };

  const blockUser = (userId) => {
    axios.put(`https://task4-server-jxfl.onrender.com/api/block/${userId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => fetchUsers())
    .catch(err => console.error("Error blocking user:", err.response?.data || err.message));
  };

  const unblockUser = (userId) => {
    axios.put(`https://task4-server-jxfl.onrender.com/api/unblock/${userId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => fetchUsers())
    .catch(err => console.error("Error unblocking user:", err.response?.data || err.message));
  };

  const deleteUser = (userId) => {
    axios.delete(`https://task4-server-jxfl.onrender.com/api/delete/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => fetchUsers())
    .catch(err => console.error("Error deleting user:", err.response?.data || err.message));
  };

  const handleSelectUser = (userId) => {
    console.log(userId)
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">User Management</h2>

      <button className="btn btn-danger mb-4" onClick={handleLogout}>Logout</button>

      {/* Bulk Action Select Field */}
      <div className="mb-4">
        <select className="form-select" value={action} onChange={handleActionChange}>
          <option value="">Select Action</option>
          <option value="block">Block</option>
          <option value="unblock">Unblock</option>
          <option value="delete">Delete</option>
        </select>
        <button className="btn btn-primary mt-2" onClick={handleBulkAction} disabled={!action || selectedUsers.length === 0}>
          Apply Action
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>
                <input type="checkbox" className="form-check-input" />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Last Login</th>
              <th>Registration Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user,index) => (
              <tr key={user._id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                  />
                </td>
                <td>{index+1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.last_login_time}</td>
                <td>{user.registration_time}</td>
                <td>
                  <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;
