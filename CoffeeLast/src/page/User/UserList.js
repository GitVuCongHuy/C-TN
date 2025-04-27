import React from 'react';
import { Link } from 'react-router-dom';

const UserList = () => {
  const users = [
    { id: 1, name: "Người dùng 1" },
    { id: 2, name: "Người dùng 2" },
    { id: 3, name: "Người dùng 3" },
  ];

  return (
    <div className="container mt-5">
      <h2>List of users</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Function</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>
                <Link to={`/update-user/${user.id}`} className="btn btn-warning">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
