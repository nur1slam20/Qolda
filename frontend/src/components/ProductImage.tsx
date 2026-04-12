import { useState } from 'react'
import { Package } from 'lucide-react'

interface Props {
  src?: string | null
  alt: string
  className?: string
  iconSize?: number
}

export default function ProductImage({ src, alt, className = '', iconSize = 40 }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <Package size={iconSize} strokeWidth={1.5} />
        <span className="text-xs mt-1">Сурет жоқ</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
