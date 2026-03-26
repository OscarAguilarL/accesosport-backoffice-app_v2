'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCEPT = 'image/jpeg,image/png,image/webp'

// ── Shared helpers ──────────────────────────────────────────────

function isDragEvent(e: React.DragEvent) {
  return e.dataTransfer.files.length > 0
}

function filesFromDrop(e: React.DragEvent, multiple: boolean): File[] {
  const files = Array.from(e.dataTransfer.files).filter((f) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
  )
  return multiple ? files : files.slice(0, 1)
}

// ── Single ──────────────────────────────────────────────────────

interface SingleDropzoneProps {
  multiple?: false
  preview?: string | null
  onChange: (file: File) => void
  onRemove?: () => void
  disabled?: boolean
  shape?: 'rounded' | 'circle'
  className?: string
}

// ── Multiple ────────────────────────────────────────────────────

interface MultipleDropzoneProps {
  multiple: true
  items: { preview: string }[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
  disabled?: boolean
  className?: string
}

type ImageDropzoneProps = SingleDropzoneProps | MultipleDropzoneProps

// ── Component ───────────────────────────────────────────────────

export function ImageDropzone(props: ImageDropzoneProps) {
  if (props.multiple === true) {
    return <MultipleDropzone {...props} />
  }
  return <SingleDropzone {...(props as SingleDropzoneProps)} />
}

// ── Single implementation ────────────────────────────────────────

function SingleDropzone({
  preview,
  onChange,
  onRemove,
  disabled,
  shape = 'rounded',
  className,
}: SingleDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled || !isDragEvent(e)) return
      const [file] = filesFromDrop(e, false)
      if (file) onChange(file)
    },
    [disabled, onChange]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange(file)
    e.target.value = ''
  }

  const isCircle = shape === 'circle'

  if (isCircle) {
    return (
      <div className={cn('relative', className)}>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-6 transition-colors',
            disabled && 'pointer-events-none opacity-50',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30 bg-muted hover:border-muted-foreground/60'
          )}
        >
          <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-background shadow-sm">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-10 w-10 opacity-40" />
              </div>
            )}
          </div>
          <span className={cn('text-sm font-medium', isDragging ? 'text-primary' : 'text-muted-foreground')}>
            {isDragging ? 'Suelta aquí' : preview ? 'Haz clic o arrastra para cambiar' : 'Arrastra o haz clic para subir'}
          </span>
        </div>

        {preview && onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            disabled={disabled}
            className="mt-1 w-full text-center text-xs text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Eliminar imagen
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !preview && !disabled && inputRef.current?.click()}
        className={cn(
          'relative overflow-hidden border-2 border-dashed transition-colors rounded-lg',
          !preview && !disabled && 'cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : preview
            ? 'border-transparent'
            : 'border-muted-foreground/30 bg-muted hover:border-muted-foreground/60',
          'h-full w-full'
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove() }}
                disabled={disabled}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
            <Upload className={cn('h-8 w-8', isDragging && 'text-primary')} />
            <span className="text-sm font-medium">
              {isDragging ? 'Suelta aquí' : 'Arrastra o haz clic'}
            </span>
            <span className="text-xs">JPEG, PNG o WebP · Máx. 5MB</span>
          </div>
        )}
      </div>

      {preview && onRemove && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="mt-1 w-full text-center text-xs text-muted-foreground underline hover:text-foreground transition-colors"
        >
          Cambiar imagen
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />
    </div>
  )
}

// ── Multiple implementation ──────────────────────────────────────

function MultipleDropzone({ items, onAdd, onRemove, disabled, className }: MultipleDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled || !isDragEvent(e)) return
      const files = filesFromDrop(e, true)
      if (files.length) onAdd(files)
    },
    [disabled, onAdd]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onAdd(files)
    e.target.value = ''
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              <img
                src={item.preview}
                alt={`Imagen ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-muted-foreground/30 bg-muted text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground',
          disabled && 'pointer-events-none opacity-50'
        )}
      >
        <Upload className="h-6 w-6" />
        <span className="text-sm font-medium">
          {isDragging ? 'Suelta aquí' : items.length > 0 ? 'Agregar más imágenes' : 'Arrastra o haz clic'}
        </span>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        JPEG, PNG o WebP · Máx. 5MB por imagen
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />
    </div>
  )
}
