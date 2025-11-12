import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider } from './contexts/BlogContext';
import Layout from './components/Layout';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BlogProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<PostList />} />
              <Route path="posts/:id" element={<PostDetail />} />
              <Route path="create" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
              <Route path="edit/:id" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Router>
      </BlogProvider>
    </AuthProvider>
  );
}

export default App;