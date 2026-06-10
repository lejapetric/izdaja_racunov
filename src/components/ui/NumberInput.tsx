// src/components/ui/NumberInput.tsx
import React from 'react'
import { Input } from './input'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface NumberInputProps {
  value: number | ''
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  className?: string
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  placeholder,
  className = ''
}) => {
  const handleChange = (newValue: number) => {
    if (newValue < min) newValue = min
    if (newValue > max) newValue = max
    onChange(newValue)
  }

  return (
    <div className="relative">
      <Input 
        type="number" 
        step={step}
        min={min}
        max={max}
        value={value} 
        placeholder={placeholder}
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        className={`pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={() => handleChange((parseFloat(String(value)) || 0) + step)}
          className="h-4 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => handleChange((parseFloat(String(value)) || 0) - step)}
          className="h-4 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}