/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { z } from 'zod';

export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormError {
  [key: string]: string | undefined;
}

export interface FormTouched {
  [key: string]: boolean;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormError>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (name: string, value: unknown): string | undefined => {
      if (!validationSchema) return undefined;

      try {
        // For object schemas, try to get the field schema
        if ('shape' in validationSchema && validationSchema.shape) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fieldSchema = (validationSchema.shape as Record<string, any>)[name];
          if (fieldSchema && typeof fieldSchema === 'object' && 'parse' in fieldSchema) {
            (fieldSchema as z.ZodSchema).parse(value);
          } else {
            // Validate entire object if can't extract field schema
            validationSchema.parse({ ...values, [name]: value });
          }
        } else {
          // Validate entire object for non-object schemas
          validationSchema.parse({ ...values, [name]: value });
        }
        return undefined;
      } catch (error: unknown) {
        if (
          error &&
          typeof error === 'object' &&
          'errors' in error &&
          Array.isArray((error as any).errors)
        ) {
          return ((error as any).errors[0]?.message as string) || 'Invalid value';
        }
        return 'Validation error';
      }
    },
    [validationSchema, values],
  );

  // Validate all fields
  const validate = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        Array.isArray((error as any).errors)
      ) {
        const newErrors: FormError = {};
        ((error as any).errors as any[]).forEach((err: any) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  }, [validationSchema, values]);

  // Handle field change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({ ...prev, [name]: newValue }));
      setIsDirty(true);

      if (validateOnChange) {
        const error = validateField(name, newValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField, validateOnChange],
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const error = validateField(name, values[name as keyof T]);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField, validateOnBlur, values],
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setIsDirty(true);

      if (validateOnChange && touched[name as string]) {
        const error = validateField(name as string, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField, validateOnChange, touched],
  );

  // Set field error programmatically
  const setFieldError = useCallback((name: string, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback(
    (name: string, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));

      if (isTouched && validateOnBlur) {
        const error = validateField(name, values[name as keyof T]);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField, validateOnBlur, values],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      // Touch all fields
      const allTouched: FormTouched = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate
      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setIsDirty(false);
      } catch (error) {
        // Error handling is done in onSubmit
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit, values],
  );

  // Reset form
  const reset = useCallback(
    (newValues?: Partial<T>) => {
      setValues(newValues ? { ...initialValues, ...newValues } : initialValues);
      setErrors({});
      setTouched({});
      setIsDirty(false);
      setIsSubmitting(false);
    },
    [initialValues],
  );

  // Get field props
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: String(name),
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': !!errors[String(name)],
      'aria-describedby': errors[String(name)] ? `${String(name)}-error` : undefined,
    }),
    [values, handleChange, handleBlur, errors],
  );

  // Check if field has error and is touched
  const getFieldError = useCallback(
    (name: string) => {
      return touched[name] && errors[name] ? errors[name] : undefined;
    },
    [touched, errors],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    reset,
    validate,
    validateField,
    getFieldProps,
    getFieldError,
  };
}
