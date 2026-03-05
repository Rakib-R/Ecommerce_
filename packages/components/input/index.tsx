
import React, { forwardRef } from "react";

interface BaseProps {
  label?: string;
  type?: "text" | "number" | "password" | "email" | "textarea";
  className?: string;
}

    type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
    type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

    type Props = InputProps | TextareaProps;

    const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement,Props>(
        ({ label, type = "text", className, ...props }, ref) => {

    return (
    <main>
        {label && (
            <label className="font-semibold">
            {label}
            </label>
        )}

    {type === "textarea" ? (
            <textarea
                ref={ref as React.Ref<HTMLTextAreaElement>}
                className={`w-full p-2 text-white border border-gray-700 bg-transparent outline-none rounded-md ${className}`}
                {...(props as TextareaProps)}
            />
            ) : (
            <input
                type={type}
                ref={ref as React.Ref<HTMLInputElement>}
                className={`w-full p-2 text-white border border-gray-700 bg-transparent outline-none rounded-md ${className ?? ""}`}
                {...(props as InputProps)}
            />
            )}
    </main>
    );
});

Input.displayName = "Input"

export default Input;