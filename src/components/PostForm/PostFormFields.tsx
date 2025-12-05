'use client'

import React from 'react'
import { Tag, X } from 'lucide-react'
import styles from './PostFormFields.module.css'

interface PostFormFieldsProps {
    title: string
    setTitle: (value: string) => void
    tags: string[]
    setTags: (tags: string[]) => void
    published: boolean
    setPublished: (value: boolean) => void
    disabled?: boolean
}

export default function PostFormFields({
    title,
    setTitle,
    tags,
    setTags,
    published,
    setPublished,
    disabled = false
}: PostFormFieldsProps) {
    const [tagInput, setTagInput] = React.useState('');

    const handleAddTag = () => {
        const newTag = tagInput.trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    return (
        <div className={styles.container}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post Title"
                className={styles.titleInput}
                disabled={disabled}
                required
            />
            <div className={styles.metaControls}>
                <div className={styles.tagsWrapper}>
                    <Tag size={16} color="var(--secondary-foreground)" />
                    <div className={styles.tagsList}>
                        {tags.map(tag => (
                            <span key={tag} className={styles.tag}>
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className={styles.removeTagBtn}
                                    disabled={disabled}
                                    type="button"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        <div className={styles.tagInputWrapper}>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                placeholder="Add tag..."
                                className={styles.tagInput}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </div>
                <label className={styles.publishedLabel}>
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        disabled={disabled}
                    />
                    Published
                </label>
            </div>
        </div>
    )
}
