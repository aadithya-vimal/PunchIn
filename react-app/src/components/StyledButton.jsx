import React from 'react';

const StyledButton = React.forwardRef(({
  children,
  className = '',
  active = false,
  disabled = false,
  icon: Icon,
  description = '',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-3xl font-semibold focus:outline-none transition-transform duration-300';
  const activeClasses = active ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-indigo-600 hover:text-white';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const combinedClassName = `${baseClasses} ${activeClasses} ${disabledClasses} ${className}`.trim();

  return (
    <button
      ref={ref}
      className={combinedClassName}
      aria-label={description}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" aria-hidden="true" />}
      {children}
    </button>
  );
});

export default StyledButton;
