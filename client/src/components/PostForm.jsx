import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, categories, fetchCategories, createPost, updatePost, fetchPost, uploadImage } = useBlog();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    featuredImage: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (id) {
      const post = posts.find(p => p._id === id);
      if (post) {
        setFormData({
          title: post.title || '',
          content: post.content || '',
          category: post.category?._id || '',
          featuredImage: post.featuredImage || '',
        });
      } else {
        fetchPost(id);
      }
    }
  }, [id, posts, fetchCategories, fetchPost]);

  useEffect(() => {
    if (id) {
      const post = posts.find(p => p._id === id);
      if (post) {
        setFormData({
          title: post.title || '',
          content: post.content || '',
          category: post.category?._id || '',
          featuredImage: post.featuredImage || '',
        });
      }
    }
  }, [posts, id]);

  const validate = () => {
    const newErrors = {};
    if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long.';
    }
    if (formData.content.trim().length === 0) {
      newErrors.content = 'Content is required.';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error on change
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      try {
        const result = await uploadImage(file);
        setFormData({
          ...formData,
          featuredImage: result.data.filename,
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrors({
          ...errors,
          image: 'Failed to upload image',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitLoading(true);
    try {
      if (id) {
        await updatePost(id, formData);
      } else {
        await createPost(formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving post:', error);
      // Error is handled in context with revert
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit Post' : 'Create New Post'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          {errors.title && <span style={{ color: 'red' }}>{errors.title}</span>}
        </div>
        <div>
          <label>Content:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
          />
          {errors.content && <span style={{ color: 'red' }}>{errors.content}</span>}
        </div>
        <div>
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <span style={{ color: 'red' }}>{errors.category}</span>}
        </div>
        <div>
          <label>Featured Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {formData.featuredImage && (
            <div>
              <img
                src={`http://localhost:5000/uploads/${formData.featuredImage}`}
                alt="Featured"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </div>
          )}
          {errors.image && <span style={{ color: 'red' }}>{errors.image}</span>}
        </div>
        <button type="submit" disabled={submitLoading}>
          {submitLoading ? 'Saving...' : (id ? 'Update' : 'Create')}
        </button>
      </form>
    </div>
  );
};

export default PostForm;