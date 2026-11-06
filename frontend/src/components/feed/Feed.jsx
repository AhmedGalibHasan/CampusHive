import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import feedService from '../../services/feedService';
import './Feed.css';

// Available tags
const AVAILABLE_TAGS = [
  'Study', 'Entertainment', 'Help', 'Query', 'CSE', 'EEE', 'BBA', 'MIC', 'PHR', 'Important'
];

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterTag, setFilterTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostTags, setEditPostTags] = useState([]);
  const [comments, setComments] = useState({});
  const [users, setUsers] = useState([]);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState({});
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, [sortBy, filterTag, showSaved]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (typeof error.message === 'string') return error.message;
    if (typeof error.error === 'string') return error.error;
    return fallback;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const nextPosts = await feedService.getPosts({ searchQuery, filterTag, sortBy, showSaved });
      setPosts(nextPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const nextUsers = await chatService.getUsers();
      setUsers(nextUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await feedService.createPost({ content, tags: selectedTags });
      setContent('');
      setSelectedTags([]);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(getErrorMessage(error, 'Error creating post'));
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleUpvote = async (postId) => {
    try {
      await feedService.upvote(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      await feedService.downvote(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error downvoting:', error);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      await feedService.save(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post._id);
    setEditPostContent(post.content);
    setEditPostTags(post.tags || []);
  };

  const handleUpdatePost = async (postId) => {
    try {
      await feedService.updatePost(postId, { content: editPostContent, tags: editPostTags });
      setEditingPost(null);
      setEditPostContent('');
      setEditPostTags([]);
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert(getErrorMessage(error, 'Error updating post'));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await feedService.deletePost(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(getErrorMessage(error, 'Error deleting post'));
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    if (!expandedComments[postId]) {
      fetchComments(postId);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const nextComments = await feedService.getComments(postId);
      setComments(prev => ({
        ...prev,
        [postId]: nextComments
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentTexts[postId] || '';
    if (!commentText.trim()) return;

    try {
      await feedService.createComment(postId, { content: commentText });
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment({ [comment._id]: comment.content });
  };

  const handleUpdateComment = async (commentId, postId) => {
    try {
      await feedService.updateComment(commentId, { content: editingComment[commentId] });
      setEditingComment({});
      fetchComments(postId);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(getErrorMessage(error, 'Error updating comment'));
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await feedService.deleteComment(commentId);
      fetchComments(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentTexts(prev => ({ ...prev, [postId]: value }));
    
    // Check for mentions
    const mentionMatch = value.match(/@([^\s@]*)$/);
    if (mentionMatch) {
      const searchTerm = mentionMatch[1].toLowerCase();
      if (searchTerm.length > 0) {
        const filtered = users.filter(user => 
          user.name.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
        setMentionSuggestions(filtered);
        setShowMentions(prev => ({ ...prev, [postId]: true }));
      } else {
        setShowMentions(prev => ({ ...prev, [postId]: false }));
      }
    } else {
      setShowMentions(prev => ({ ...prev, [postId]: false }));
    }
  };

  const insertMention = (postId, userName) => {
    const currentText = commentTexts[postId] || '';
    const mentionMatch = currentText.match(/@([^\s@]*)$/);
    if (mentionMatch) {
      const newText = currentText.replace(/@([^\s@]*)$/, `@${userName} `);
      setCommentTexts(prev => ({ ...prev, [postId]: newText }));
    }
    setShowMentions(prev => ({ ...prev, [postId]: false }));
  };

  const formatCommentContent = (content) => {
    return content.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="feed-mention">{part}</span>;
      }
      return part;
    });
  };

  const formatTime = (date) => {
    const postDate = new Date(date);
    const now = new Date();
    const diff = now - postDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return postDate.toLocaleDateString();
  };

  const isPostOwner = (post) => {
    if (!user || !post.user) return false;
    const userId = user.id || user._id;
    const postUserId = post.user._id || post.user.id;
    return postUserId && (postUserId.toString() === userId?.toString() || postUserId === userId);
  };

  const isCommentOwner = (comment) => {
    if (!user || !comment.user) return false;
    const userId = user.id || user._id;
    const commentUserId = comment.user._id || comment.user.id;
    return commentUserId && (commentUserId.toString() === userId?.toString() || commentUserId === userId);
  };

  const isPostSaved = (post) => {
    if (!user || !post.savedBy) return false;
    const userId = user.id || user._id;
    return post.savedBy.some(id => {
      const savedId = id._id || id;
      return savedId && (savedId.toString() === userId?.toString() || savedId === userId);
    });
  };

  const isUpvoted = (post) => {
    if (!user || !post.upvotes) return false;
    const userId = user.id || user._id;
    return post.upvotes.some(id => {
      const upvoteId = id._id || id;
      return upvoteId && (upvoteId.toString() === userId?.toString() || upvoteId === userId);
    });
  };

  const isDownvoted = (post) => {
    if (!user || !post.downvotes) return false;
    const userId = user.id || user._id;
    return post.downvotes.some(id => {
      const downvoteId = id._id || id;
      return downvoteId && (downvoteId.toString() === userId?.toString() || downvoteId === userId);
    });
  };

  return (
    <div className="feed-page">
      <div className="feed-header">
        <div className="feed-brandWrap">
          <span className="feed-brandIcon">🌿</span>
          <h2 className="feed-brandTitle">Campus Feed</h2>
        </div>
        <button onClick={() => navigate('/dashboard')} className="feed-backBtn">
          ← Dashboard
        </button>
      </div>

      {/* Filters and Sort */}
      <div className="feed-filtersContainer">
        <div className="feed-filterRow">
          <div className="feed-sortContainer">
            <label className="feed-filterLabel">Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="feed-filterSelect">
              <option value="newest">Newest</option>
              <option value="top">Top</option>
              <option value="most_commented">Most Commented</option>
            </select>
          </div>
          <div className="feed-filterContainer">
            <label className="feed-filterLabel">Filter by tag:</label>
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="feed-filterSelect">
              <option value="">All Tags</option>
              {AVAILABLE_TAGS.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className={`feed-savedBtn ${showSaved ? 'feed-savedBtn--active' : ''}`}
          >
            {showSaved ? '📚 Saved Posts' : '💾 View Saved'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="feed-searchContainer">
        <input
          type="text"
          placeholder="Search posts by keyword or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="feed-searchInput"
        />
      </div>

      <div className="feed-createPost">
        <div className="feed-createHeader">
          <span className="feed-createIcon">🍃</span>
          <h3 className="feed-sectionTitle">Share something</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? (events, ideas, questions)"
            className="feed-textarea"
            rows="4"
          />
          <div className="feed-tagsContainer">
            <label className="feed-tagsLabel">Select Tags:</label>
            <div className="feed-tagsList">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`feed-tagBtn ${selectedTags.includes(tag) ? 'feed-tagBtn--active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="feed-actionsRow">
            <button type="submit" className="feed-postBtn">Post 🌱</button>
          </div>
        </form>
      </div>

      <div className="feed-postsContainer">
        <div className="feed-listHeader">
          <span className="feed-listIcon">🌲</span>
          <h3 className="feed-sectionTitle">
            {showSaved ? 'Saved Posts' : sortBy === 'top' ? 'Top Posts' : sortBy === 'most_commented' ? 'Most Commented' : 'All Posts'}
          </h3>
        </div>
        {loading ? (
          <div className="feed-skeletonList">
            <div className="feed-skeletonCard" />
            <div className="feed-skeletonCard" />
            <div className="feed-skeletonCard" />
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-emptyState">
            <span className="feed-emptyIcon">🌱</span>
            <p className="feed-emptyText">
              {showSaved ? 'No saved posts yet' : 'No posts yet — start the conversation!'}
            </p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="feed-post">
              <div className="feed-postHeader">
                <div className="feed-authorRow">
                  <span className="feed-authorAvatar">
                    {(post.user?.name || 'U').slice(0,1).toUpperCase()}
                  </span>
                  <div>
                    <strong className="feed-authorName">{post.user?.name}</strong>
                    <div className="feed-postMeta">
                      <span className="feed-postDate">{formatTime(post.createdAt)}</span>
                      {post.edited && (
                        <span className="feed-editedBadge">✏️ Edited</span>
                      )}
                    </div>
                  </div>
                </div>
                {isPostOwner(post) && (
                  <div className="feed-postActions">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="feed-actionBtn"
                      title="Edit post"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="feed-actionBtn"
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              
              {editingPost === post._id ? (
                <div className="feed-editContainer">
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    className="feed-textarea"
                    rows="4"
                  />
                  <div className="feed-tagsContainer">
                    <label className="feed-tagsLabel">Tags:</label>
                    <div className="feed-tagsList">
                      {AVAILABLE_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setEditPostTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          )}
                          className={`feed-tagBtn ${editPostTags.includes(tag) ? 'feed-tagBtn--active' : ''}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="feed-editActions">
                    <button onClick={() => handleUpdatePost(post._id)} className="feed-saveBtn">
                      Save
                    </button>
                    <button onClick={() => setEditingPost(null)} className="feed-cancelBtn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {post.tags && post.tags.length > 0 && (
                    <div className="feed-postTags">
                      {post.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFilterTag(tag)}
                          className="feed-postTag"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="feed-postContent">{post.content}</p>
                  <div className="feed-voteContainer">
                    <button 
                      onClick={() => handleUpvote(post._id)} 
                      className={`feed-voteBtn feed-voteBtn--upvote ${isUpvoted(post) ? 'feed-voteBtn--upvoted' : ''}`}
                    >
                      👍 {post.upvotes?.length || 0}
                    </button>
                    <button 
                      onClick={() => handleDownvote(post._id)} 
                      className={`feed-voteBtn feed-voteBtn--downvote ${isDownvoted(post) ? 'feed-voteBtn--downvoted' : ''}`}
                    >
                      👎 {post.downvotes?.length || 0}
                    </button>
                    <button 
                      onClick={() => toggleComments(post._id)} 
                      className="feed-voteBtn feed-voteBtn--comment"
                    >
                      💬 Comment {post.commentCount !== undefined ? `(${post.commentCount})` : comments[post._id] ? `(${comments[post._id].length})` : ''}
                    </button>
                    <button
                      onClick={() => handleSavePost(post._id)}
                      className={`feed-voteBtn feed-voteBtn--save ${isPostSaved(post) ? 'feed-voteBtn--saved' : ''}`}
                      title="Save post"
                    >
                      {isPostSaved(post) ? '📚 Saved' : '💾 Save'}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post._id] && (
                    <div className="feed-commentsSection">
                      <div className="feed-commentsHeader">Comments</div>
                      <div className="feed-commentsList">
                        {comments[post._id] && comments[post._id].length > 0 ? (
                          comments[post._id].map(comment => (
                            <div key={comment._id} className="feed-comment">
                              <div className="feed-commentHeader">
                                <span className="feed-commentAvatar">
                                  {(comment.user?.name || 'U').slice(0,1).toUpperCase()}
                                </span>
                                <strong className="feed-commentAuthor">{comment.user?.name}</strong>
                                <span className="feed-commentDate">
                                  {formatTime(comment.createdAt)}
                                </span>
                                {isCommentOwner(comment) && (
                                  <div className="feed-commentActions">
                                    <button
                                      onClick={() => handleEditComment(comment)}
                                      className="feed-commentActionBtn"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment._id, post._id)}
                                      className="feed-commentActionBtn"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>
                              {editingComment[comment._id] !== undefined ? (
                                <div className="feed-editCommentContainer">
                                  <textarea
                                    value={editingComment[comment._id]}
                                    onChange={(e) => setEditingComment({
                                      ...editingComment,
                                      [comment._id]: e.target.value
                                    })}
                                    className="feed-commentInput"
                                    rows="2"
                                  />
                                  <div className="feed-editCommentActions">
                                    <button
                                      onClick={() => handleUpdateComment(comment._id, post._id)}
                                      className="feed-saveBtn"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingComment({})}
                                      className="feed-cancelBtn"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="feed-commentContent">
                                  {formatCommentContent(comment.content)}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="feed-noComments">No comments yet</div>
                        )}
                      </div>
                      <div className="feed-commentInputContainer">
                        <div className="feed-commentInputWrapper">
                          <textarea
                            value={commentTexts[post._id] || ''}
                            onChange={(e) => handleCommentChange(post._id, e.target.value)}
                            placeholder="Write a comment... (use @username to mention)"
                            className="feed-commentInput"
                            rows="2"
                          />
                          {showMentions[post._id] && mentionSuggestions.length > 0 && (
                            <div className="feed-mentionDropdown">
                              {mentionSuggestions.map(user => (
                                <div
                                  key={user._id}
                                  onClick={() => insertMention(post._id, user.name)}
                                  className="feed-mentionItem"
                                >
                                  {user.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleCommentSubmit(post._id)}
                          className="feed-commentSubmitBtn"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
