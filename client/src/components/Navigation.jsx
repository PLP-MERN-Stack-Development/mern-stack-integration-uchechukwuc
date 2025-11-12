import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { categories, fetchCategories } = useBlog();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {isAuthenticated && (
          <li>
            <Link to="/create">Create Post</Link>
          </li>
        )}
        {categories.map((cat) => (
          <li key={cat._id}>
            <Link to={`/category/${cat._id}`}>{cat.name}</Link>
          </li>
        ))}
        {isAuthenticated ? (
          <>
            <li>Welcome, {user?.username}</li>
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;