import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { notifyPostReaction } from '../utils/notificationHelper.js';

// Create Post
export const createPost = async (req, res) => {
  try {
    const { content, tags } = req.body;
    
    const post = new Post({
      user: req.userId,
      content,
      tags: tags || []
    });

    await post.save();
    await post.populate('user', 'name email');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Posts
export const getPosts = async (req, res) => {
  try {
    const { search, tags } = req.query;
    let query = {};

    // Search by keyword in content
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Don't show deleted posts
    query.deleted = { $ne: true };

    let sortOption = { createdAt: -1 }; // Default: newest first
    
    // Sort options
    const { sort } = req.query;
    if (sort === 'top') {
      // Sort by upvotes - downvotes (score)
      sortOption = { createdAt: -1 }; // We'll calculate score in application
    } else if (sort === 'hot') {
      // Sort by recent activity (upvotes + comments in last 24h)
      sortOption = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('user', 'name email')
      .sort(sortOption)
      .lean();
    
    // Get comment counts for each post
    const postIds = posts.map(p => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);
    
    const countMap = {};
    commentCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });
    
    // Add comment counts and calculate scores
    const postsWithCounts = posts.map(post => {
      const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
      return {
        ...post,
        commentCount: countMap[post._id.toString()] || 0,
        score
      };
    });

    // Apply sorting based on sort parameter
    if (req.query.sort === 'top') {
      postsWithCounts.sort((a, b) => b.score - a.score);
    } else if (req.query.sort === 'most_commented') {
      postsWithCounts.sort((a, b) => b.commentCount - a.commentCount);
    }
    
    res.json(postsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upvote Post
export const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get reactor's name
    const reactor = await User.findById(req.userId);
    const reactorName = reactor ? reactor.name : 'Someone';

    // Check if already upvoted
    const wasUpvoted = post.upvotes.some(id => id.toString() === req.userId);

    // Remove from downvotes if exists
    post.downvotes = post.downvotes.filter(id => id.toString() !== req.userId);

    // Toggle upvote
    const upvoteIndex = post.upvotes.findIndex(id => id.toString() === req.userId);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(req.userId);
      // Create notification only if newly upvoted and not own post
      if (post.user._id.toString() !== req.userId) {
        await notifyPostReaction(post.user._id, reactorName, true, post._id.toString());
      }
    }

    await post.save();
    await post.populate('user', 'name email');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Downvote Post
export const downvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get reactor's name
    const reactor = await User.findById(req.userId);
    const reactorName = reactor ? reactor.name : 'Someone';

    // Remove from upvotes if exists
    post.upvotes = post.upvotes.filter(id => id.toString() !== req.userId);

    // Toggle downvote
    const downvoteIndex = post.downvotes.findIndex(id => id.toString() === req.userId);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      post.downvotes.push(req.userId);
      // Create notification only if newly downvoted and not own post
      if (post.user._id.toString() !== req.userId) {
        await notifyPostReaction(post.user._id, reactorName, false, post._id.toString());
      }
    }

    await post.save();
    await post.populate('user', 'name email');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Post
export const updatePost = async (req, res) => {
  try {
    const { content, tags } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    post.content = content;
    post.tags = tags || post.tags;
    post.edited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate('user', 'name email');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.deleted = true;
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save/Unsave Post
export const toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const savedIndex = post.savedBy.findIndex(id => id.toString() === req.userId);
    
    if (savedIndex > -1) {
      post.savedBy.splice(savedIndex, 1);
    } else {
      post.savedBy.push(req.userId);
    }

    await post.save();
    await post.populate('user', 'name email');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Saved Posts
export const getSavedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      savedBy: req.userId,
      deleted: { $ne: true }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get comment counts
    const postIds = posts.map(p => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    commentCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    const postsWithCounts = posts.map(post => ({
      ...post,
      commentCount: countMap[post._id.toString()] || 0,
      score: (post.upvotes?.length || 0) - (post.downvotes?.length || 0)
    }));

    res.json(postsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};