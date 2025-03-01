interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FormField({
  label,
  name,
  type = 'text',
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="mt-1">
        {children || (
          <input
            type={type}
            id={name}
            name={name}
            required={required}
            className={`
              block w-full rounded-md shadow-sm
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }
            `}
          />
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}