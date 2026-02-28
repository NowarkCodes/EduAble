'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    options: (DropdownOption | string)[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    id?: string;
}

export default function Dropdown({
    options,
    value,
    onChange,
    className = '',
    style,
    placeholder = 'Select an option',
    id,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const normalizedOptions: DropdownOption[] = options.map(opt =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                id={id}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-card border border-border text-sm font-semibold text-card-foreground px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors cursor-pointer min-h-[3rem] ${className}`}
                style={style}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <ul
                    role="listbox"
                    style={{ ...style }}
                    className="absolute z-[100] w-full mt-2 bg-popover/95 backdrop-blur-md border md:border-2 border-border rounded-xl shadow-2xl max-h-60 overflow-auto focus:outline-none text-popover-foreground isolate"
                >
                    {normalizedOptions.map((option) => (
                        <li
                            key={option.value}
                            role="option"
                            aria-selected={value === option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-3 text-sm cursor-pointer transition-colors relative z-10 ${value === option.value
                                ? 'bg-primary text-primary-foreground font-bold'
                                : 'text-popover-foreground hover:bg-muted/80 hover:text-foreground'
                                }`}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
