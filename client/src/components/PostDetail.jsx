import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { posts, fetchPost, addComment } = useBlog();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const post = posts.find(p => p._id === id);

  useEffect(() => {
    if (id && !post) {
      setLoading(true);
      setError(null);
      fetchPost(id)
        .catch(err => setError(err))
        .finally(() => setLoading(false));
    }
  }, [id, post, fetchPost]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(id, { content: commentContent.trim() });
      setCommentContent('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error loading post: {error.message}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div>
      <h2>{post.title}</h2>
      {post.featuredImage && (
        <img
          src={`http://localhost:5000/uploads/${post.featuredImage}`}
          alt={post.title}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )}
      <p>By {post.author?.name || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}</p>
      <div>{post.content}</div>
      {post.category && <p>Category: {post.category.name}</p>}

      {/* Comments Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Comments ({post.comments?.length || 0})</h3>

        {/* Display existing comments */}
        {post.comments && post.comments.length > 0 ? (
          <div style={{ marginBottom: '2rem' }}>
            {post.comments.map((comment, index) => (
              <div key={index} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>{comment.user?.name || 'Anonymous'}</strong>
                  <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                </div>
                <p style={{ margin: 0 }}>{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        {/* Comment form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} style={{ marginTop: '2rem' }}>
            <h4>Add a Comment</h4>
            <div style={{ marginBottom: '1rem' }}>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your comment here..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: submittingComment ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submittingComment ? 'not-allowed' : 'pointer'
              }}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p style={{ marginTop: '2rem', color: '#666' }}>
            Please <a href="/login">login</a> to add a comment.
          </p>
        )}
      </div>
    </div>
  );
};

export default PostDetail;