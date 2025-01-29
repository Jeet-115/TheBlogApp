import React, { useState, useEffect } from 'react';
import appwriteService from '../../appwrite/config';
import authService from '../../appwrite/auth';  

const PostForm = () => {
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft',
        featuredImage: '',
        slug: ''
    });

    useEffect(() => {
        // Fetch current user on component load
        authService.getCurrentUser().then((user) => {
            if (user) {
                setUserData(user);
            } else {
                console.error("User not logged in.");
            }
        });
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Automatically generate slug when title is updated
        if (name === 'title') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .slice(0, 50); // Limit slug to 50 characters
            setFormData({ ...formData, title: value, slug });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, featuredImage: file });
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData?.$id) {
            console.error("User ID is missing.");
            alert("Please log in to create a post.");
            return;
        }

        try {
            // Upload the featured image
            let fileId = '';
            if (formData.featuredImage) {
                const fileResponse = await appwriteService.uploadFile(formData.featuredImage);
                fileId = fileResponse.$id;
            }

            // Create the post with all form data including slug
            await appwriteService.createPost({
                ...formData,
                featuredImage: fileId,
                userId: userData.$id
            });

            alert("Post created successfully.");
            setFormData({ title: '', content: '', status: 'draft', featuredImage: '', slug: '' });

        } catch (error) {
            console.error("Failed to create post.", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4">
            {/* Title Input */}
            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium">Title</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            {/* Slug Display (Read-only) */}
            <div className="mb-4">
                <label htmlFor="slug" className="block text-sm font-medium">Slug (Auto-generated)</label>
                <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={formData.slug}
                    className="w-full p-2 border rounded bg-gray-100"
                    readOnly
                />
            </div>

            {/* Content Textarea */}
            <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium">Content</label>
                <textarea
                    name="content"
                    id="content"
                    rows="5"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                ></textarea>
            </div>

            {/* Status Dropdown */}
            <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium">Status</label>
                <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Featured Image Upload */}
            <div className="mb-4">
                <label htmlFor="featuredImage" className="block text-sm font-medium">Featured Image</label>
                <input
                    type="file"
                    name="featuredImage"
                    id="featuredImage"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
            >
                Create Post
            </button>
        </form>
    );
};

export default PostForm;
