import React from "react";
import { cn } from "../../lib/utils";

export type ButtonVariant = "add" | "remove" | "submit";
export type ButtonSize = "sm" | "md";

interface ButtonProps {
    variant: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    "data-testid"?: string;
}

const Button: React.FC<ButtonProps> = ({
    variant,
    size = "md",
    children,
    className = "",
    ...props
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case "add":
                return "bg-blue-600 hover:bg-blue-700 text-white";
            case "remove":
                return "bg-red-600 hover:bg-red-700 text-white";
            case "submit":
                return "bg-green-600 hover:bg-green-700 text-white";
            default:
                return "bg-gray-600 hover:bg-gray-700 text-white";
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "px-2 py-1 text-xs";
            case "md":
                return "px-3 py-2";
            default:
                return "px-3 py-2";
        }
    };

    const baseClasses = "cursor-pointer rounded border-none";
    const variantClasses = getVariantClasses();
    const sizeClasses = getSizeClasses();

    return (
        <button
            className={cn(baseClasses, variantClasses, sizeClasses, className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
