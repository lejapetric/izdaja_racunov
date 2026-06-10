// src/components/ui/CustomDateInput.tsx
import React from 'react'
import { Input } from './input'
import { Calendar, X } from 'lucide-react'

interface CustomDateInputProps {
  value?: string
  onClick?: () => void
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
}

export const CustomDateInput = React.forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onClick, placeholder, onChange, onClear }, ref) => (
    <div className="relative">
      <Input 
        ref={ref}
        value={value} 
        onClick={onClick}
        onChange={onChange}
        readOnly
        placeholder={placeholder}
        className="cursor-pointer bg-white pr-16"
      />
      <Calendar className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      {value && onClear && (
        <X 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
        />
      )}
    </div>
  )
)

CustomDateInput.displayName = 'CustomDateInput'