'use client'

import React, { useEffect, useRef } from 'react'
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
    const [existingTags, setExistingTags] = React.useState<string[]>([]);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(0);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Fetch existing tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags');
                if (response.ok) {
                    const data = await response.json();
                    setExistingTags(data.map((tag: { name: string }) => tag.name));
                }
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        fetchTags();
    }, []);

    // Update suggestions when tagInput changes
    useEffect(() => {
        if (tagInput.trim()) {
            const filtered = existingTags
                .filter(tag =>
                    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !tags.includes(tag)
                )
                .slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
            setSelectedSuggestionIndex(0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [tagInput, existingTags, tags]);

    const handleAddTag = (tagToAdd?: string) => {
        const newTag = (tagToAdd || tagInput).trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
        setShowSuggestions(false);
        setSelectedSuggestionIndex(0);
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                handleAddTag(suggestions[selectedSuggestionIndex]);
            } else {
                handleAddTag();
            }
        } else if (e.key === 'ArrowDown' && showSuggestions) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp' && showSuggestions) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
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
                                onFocus={() => tagInput.trim() && setSuggestions(suggestions)}
                                placeholder="Add tag..."
                                className={styles.tagInput}
                                disabled={disabled}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div ref={suggestionsRef} className={styles.suggestions}>
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={suggestion}
                                            className={`${styles.suggestionItem} ${index === selectedSuggestionIndex ? styles.suggestionItemActive : ''
                                                }`}
                                            onClick={() => handleAddTag(suggestion)}
                                            onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                        >
                                            <Tag size={12} />
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
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
