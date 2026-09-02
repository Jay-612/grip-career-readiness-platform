import mongoose from 'mongoose';
import ExperiencePost from '../model/ExperiencePost.js';
import User from '../model/User.js';

// ─── Create Experience Post (Alumni only) ─────────────────────────
export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, tags } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const post = await ExperiencePost.create({
      alumniId: userId,
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()) : [],
    });

    const populated = await ExperiencePost.findById(post._id).populate(
      'alumniId',
      'name email'
    );

    res.status(201).json({
      success: true,
      message: 'Experience post created successfully',
      post: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating post',
      error: error.message,
    });
  }
};

// ─── Get All Experience Posts ─────────────────────────────────────
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Optional tag filter
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }

    const [posts, totalItems] = await Promise.all([
      ExperiencePost.find(filter)
        .populate('alumniId', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      ExperiencePost.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      page,
      totalPages,
      totalItems,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts',
      error: error.message,
    });
  }
};

// ─── Get Single Post by ID ───────────────────────────────────────
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await ExperiencePost.findById(id).populate(
      'alumniId',
      'name email'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post',
      error: error.message,
    });
  }
};

// ─── Update Own Post (Alumni only) ───────────────────────────────
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await ExperiencePost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only the author can update
    if (post.alumniId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts',
      });
    }

    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (tags) post.tags = Array.isArray(tags) ? tags.map((t) => t.trim()) : post.tags;

    await post.save();

    const updated = await ExperiencePost.findById(id).populate(
      'alumniId',
      'name email'
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating post',
      error: error.message,
    });
  }
};

// ─── Delete Own Post (Alumni or Admin) ───────────────────────────
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await ExperiencePost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only the author or an admin can delete
    if (post.alumniId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    await ExperiencePost.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post',
      error: error.message,
    });
  }
};
