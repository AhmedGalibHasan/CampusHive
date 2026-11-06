import Notification from '../models/Notification.js';

// Helper function to create notifications
export const createNotification = async (userId, type, title, message, relatedId = '', relatedType = '') => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Create notification for post reaction
export const notifyPostReaction = async (postOwnerId, reactorName, isUpvote, postId) => {
  if (!postOwnerId) return;
  
  const title = 'New Post Reaction';
  const message = `${reactorName} ${isUpvote ? 'upvoted' : 'downvoted'} your post`;
  
  return await createNotification(postOwnerId, 'post_reaction', title, message, postId, 'post');
};

// Create notification for approved announcement
export const notifyAnnouncementApproved = async (userId, clubName, clubId) => {
  if (!userId) return;
  
  const title = 'Announcement Approved';
  const message = `Your announcement in ${clubName} has been approved`;
  
  return await createNotification(userId, 'announcement_approved', title, message, clubId, 'club');
};

// Create notification for new message
export const notifyNewMessage = async (receiverId, senderName, messageId) => {
  if (!receiverId) return;
  
  const title = 'New Message';
  const message = `You have a new message from ${senderName}`;
  
  return await createNotification(receiverId, 'new_message', title, message, messageId, 'chat');
};

// Create notification for helpful review flag
export const notifyReviewHelpful = async (reviewerId, flaggerName, reviewId) => {
  if (!reviewerId) return;
  
  const title = 'Review Marked as Helpful';
  const message = `${flaggerName} found your review helpful`;
  
  return await createNotification(reviewerId, 'review_helpful', title, message, reviewId, 'review');
};

// Create notification for user mention in comment
export const notifyUserMention = async (mentionedUserId, commenterName, postId, commentContent) => {
  if (!mentionedUserId) return;
  
  const title = 'You were mentioned';
  const message = `${commenterName} mentioned you in a comment`;
  
  return await createNotification(mentionedUserId, 'user_mention', title, message, postId, 'post');
};

