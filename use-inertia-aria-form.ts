import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useState, useCallback } from 'react';

interface UseInertiaAriaFormOptions {
    /** Success callback - called after successful submission */
    onSuccess?: () => void;
    /** Error callback - called after failed submission */
    onError?: (errors: Record<string, string>) => void;
    /** Whether to prevent double submissions */
    preventDoubleSubmit?: boolean;
}

export const useInertiaAriaForm = (options: UseInertiaAriaFormOptions = {}) => {
    const { onSuccess, onError, preventDoubleSubmit = true } = options;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { errors } = usePage().props as { errors: Record<string, string> };

    const submit = useCallback((action: string, form: HTMLFormElement) => {
        if (preventDoubleSubmit && isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        const formData = Object.fromEntries(new FormData(form));

        router.post(action, formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                onSuccess?.();
            },
            onError: (err) => {
                setIsSubmitting(false);
                onError?.(err);
            },
        });
    }, [isSubmitting, onSuccess, onError, preventDoubleSubmit]);

    const handleSubmit = useCallback((action: string) => {
        return (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            submit(action, e.currentTarget);
        };
    }, [submit]);

    return {
        errors,
        isSubmitting,
        submit,
        handleSubmit,
    };
};