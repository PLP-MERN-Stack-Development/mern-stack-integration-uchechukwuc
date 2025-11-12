import React, { createContext, useContext, useState, useCallback } from 'react';
import useApi from '../hooks/useApi';
import { postService, categoryService } from '../services/api';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [limit, setLimit] = useState(10);

  const { loading: loadingPosts, error: errorPosts, execute: executeFetchPosts } = useApi(postService, 'getAllPosts');
  const { loading: loadingCategories, error: errorCategories, execute: executeFetchCategories } = useApi(categoryService, 'getAllCategories');
  const { execute: executeCreatePost } = useApi(postService, 'createPost');
  const { execute: executeUpdatePost } = useApi(postService, 'updatePost');
  const { execute: executeDeletePost } = useApi(postService, 'deletePost');
  const { execute: executeFetchPost } = useApi(postService, 'getPost');
  const { execute: executeUploadImage } = useApi(postService, 'uploadImage');
  const { execute: executeAddComment } = useApi(postService, 'addComment');

  const fetchPosts = useCallback(async (page = 1, limitParam = 10, search = null, category = null) => {
    try {
      const result = await executeFetchPosts(page, limitParam, category, search);
      setPosts(result.data || []);
      setTotalPosts(result.total || 0);
      setCurrentPage(result.page || page);
      setLimit(result.limit || limitParam);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [executeFetchPosts]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await executeFetchCategories();
      setCategories(result.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [executeFetchCategories]);

  const fetchPost = useCallback(async (id) => {
    try {
      const result = await executeFetchPost(id);
      const post = result.post || result;
      // Add or update the post in posts
      setPosts(prev => {
        const existingIndex = prev.findIndex(p => p._id === id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = post;
          return updated;
        } else {
          return [post, ...prev];
        }
      });
      return post;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }, [executeFetchPost]);

  const createPost = useCallback(async (postData) => {
    // Optimistic update
    const tempId = Date.now().toString();
    const optimisticPost = { ...postData, _id: tempId, createdAt: new Date().toISOString() };
    setPosts(prev => [optimisticPost, ...prev]);

    try {
      const result = await executeCreatePost(postData);
      // Replace optimistic with real data
      setPosts(prev => prev.map(p => p._id === tempId ? result.post : p));
      return result;
    } catch (error) {
      // Revert optimistic update
      setPosts(prev => prev.filter(p => p._id !== tempId));
      throw error;
    }
  }, [executeCreatePost]);

  const updatePost = useCallback(async (id, postData) => {
    // Optimistic update
    const originalPost = posts.find(p => p._id === id);
    const optimisticPost = { ...originalPost, ...postData };
    setPosts(prev => prev.map(p => p._id === id ? optimisticPost : p));

    try {
      const result = await executeUpdatePost(id, postData);
      // Update with real data
      setPosts(prev => prev.map(p => p._id === id ? result.post : p));
      return result;
    } catch (error) {
      // Revert optimistic update
      setPosts(prev => prev.map(p => p._id === id ? originalPost : p));
      throw error;
    }
  }, [executeUpdatePost, posts]);

  const deletePost = useCallback(async (id) => {
    // Optimistic update
    const postToDelete = posts.find(p => p._id === id);
    setPosts(prev => prev.filter(p => p._id !== id));

    try {
      await executeDeletePost(id);
    } catch (error) {
      // Revert optimistic update
      setPosts(prev => [postToDelete, ...prev]);
      throw error;
    }
  }, [executeDeletePost, posts]);

  const uploadImage = useCallback(async (file) => {
    try {
      const result = await executeUploadImage(file);
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, [executeUploadImage]);

  const addComment = useCallback(async (postId, commentData) => {
    try {
      const result = await executeAddComment(postId, commentData);
      // Update the post in the state with the new comment
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), result.data]
          };
        }
        return p;
      }));
      return result;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, [executeAddComment]);

  const value = {
    posts,
    categories,
    currentPage,
    totalPosts,
    limit,
    loadingPosts,
    loadingCategories,
    errorPosts,
    errorCategories,
    fetchPosts,
    fetchCategories,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    uploadImage,
    addComment,
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};