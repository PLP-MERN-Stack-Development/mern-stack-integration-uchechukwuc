import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';

const PostList = () => {
  const { posts, categories, loadingPosts, loadingCategories, errorPosts, errorCategories, fetchPosts, fetchCategories, currentPage, totalPosts, limit } = useBlog();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFetchPosts = (page = 1) => {
    fetchPosts(page, 10, search, selectedCategory || null);
  };

  useEffect(() => {
    handleFetchPosts(1);
  }, [fetchPosts, search, selectedCategory]);

  if (loadingPosts) return <div>Loading posts...</div>;
  if (errorPosts) return <div>Error loading posts: {errorPosts.message}</div>;

  const totalPages = Math.ceil(totalPosts / limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleFetchPosts(newPage);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
      </div>
      <h2>Posts</h2>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              {post.featuredImage && (
                <img
                  src={`http://localhost:5000/uploads/${post.featuredImage}`}
                  alt={post.title}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px' }}
                />
              )}
              <Link to={`/posts/${post._id}`}>
                <h3>{post.title}</h3>
                <p>{post.excerpt || post.content.substring(0, 100)}...</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;