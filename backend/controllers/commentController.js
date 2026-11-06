import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { notifyUserMention } from '../utils/notificationHelper.js';

// Create Comment
export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Extract mentions from content (format: @name or @Name LastName)
    const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)*)/g;
    const mentions = [];
    let match;
    const mentionNames = [];

    while ((match = mentionRegex.exec(content)) !== null) {
      mentionNames.push(match[1].trim());
    }

    // Find users by name (case-insensitive, exact match)
    if (mentionNames.length > 0) {
      const mentionedUsers = await User.find({
        $or: mentionNames.map(name => ({
          name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        }))
      });
      mentions.push(...mentionedUsers.map(u => u._id));
    }

    const comment = new Comment({
      post: postId,
      user: req.userId,
      content,
      mentions
    });

    await comment.save();
    await comment.populate('user', 'name email');
    await comment.populate('mentions', 'name email');

    // Send notifications to mentioned users
    const commenter = await User.findById(req.userId);
    const commenterName = commenter ? commenter.name : 'Someone';

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== req.userId) {
        await notifyUserMention(
          mentionedUserId,
          commenterName,
          postId,
          content
        );
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Comments for a Post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('user', 'name email')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 }); // Oldest first for better thread readability

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('user', 'name email');
    await comment.populate('mentions', 'name email');

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

