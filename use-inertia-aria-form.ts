import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useState, useCallback, useRef } from 'react';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

// Route object from Laravel Wayfinder
interface WayfinderRoute {
    url: string;
    method: HttpMethod;
}

type ActionParam = string | WayfinderRoute;

interface UseInertiaAriaFormOptions {
    /** Success callback - called after successful submission */
    onSuccess?: () => void;
    /** Error callback - called after failed submission */
    onError?: (errors: Record<string, string>) => void;
    /** Whether to prevent double submissions */
    preventDoubleSubmit?: boolean;
    /** Whether to automatically clear the form on successful submission */
    clearOnSuccess?: boolean;
    /** Default values to reset form to when clearing */
    defaultValues?: Record<string, any>;
}

export const useInertiaAriaForm = (options: UseInertiaAriaFormOptions = {}) => {
    const {
        onSuccess,
        onError,
        preventDoubleSubmit = true,
        clearOnSuccess = false,
        defaultValues = {}
    } = options;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);
    const { errors } = usePage().props as { errors: Record<string, string> };

    // Clear form function - uses native form reset for React Aria compatibility
    const clearForm = useCallback((form?: HTMLFormElement) => {
        const targetForm = form || formRef.current;
        if (!targetForm) return;

        // Use native form reset - React Aria respects this
        targetForm.reset();

        // Apply default values after reset if provided
        if (Object.keys(defaultValues).length > 0) {
            setTimeout(() => {
                Object.entries(defaultValues).forEach(([name, value]) => {
                    const element = targetForm.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                    if (element) {
                        element.value = String(value);

                        // Trigger events for the default value
                        const inputEvent = new Event('input', { bubbles: true });
                        const changeEvent = new Event('change', { bubbles: true });
                        element.dispatchEvent(inputEvent);
                        element.dispatchEvent(changeEvent);
                    }
                });
            }, 0);
        }
    }, [defaultValues]);

    const submit = useCallback((action: ActionParam, form?: HTMLFormElement) => {
        if (preventDoubleSubmit && isSubmitting) {
            return;
        }

        // Extract URL and method from action parameter
        let url: string;
        let httpMethod: HttpMethod;

        if (typeof action === 'string') {
            url = action;
            httpMethod = 'post'; // Default for string URLs
        } else {
            // Wayfinder route object
            url = action.url;
            httpMethod = action.method;
        }

        // Use provided form or stored form ref
        const targetForm = form || formRef.current;

        if (!targetForm) {
            console.error('No form element available. Use handleSubmit first or pass form element to submit.');
            return;
        }

        setIsSubmitting(true);
        formRef.current = targetForm; // Store form reference
        const formData = Object.fromEntries(new FormData(targetForm));

        router[httpMethod](url, formData, {
            onSuccess: () => {
                setIsSubmitting(false);

                // Clear form if requested
                if (clearOnSuccess) {
                    clearForm(targetForm);
                }

                onSuccess?.();
            },
            onError: (err) => {
                setIsSubmitting(false);
                onError?.(err);
            },
        });
    }, [isSubmitting, onSuccess, onError, preventDoubleSubmit, clearOnSuccess, clearForm]);

    const handleSubmit = useCallback((action: ActionParam) => {
        return (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            formRef.current = e.currentTarget; // Store form ref for later manual calls
            submit(action, e.currentTarget);
        };
    }, [submit]);

    return {
        errors,
        isSubmitting,
        submit,
        handleSubmit,
        clearForm,
        formRef,
    };
};
