interface Props {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  reviewCount?: number
}

export default function StarRating({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  reviewCount,
}: Props) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

  return (
    <span className={`inline-flex items-center gap-1 ${sizes[size]}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating)
        const half = !filled && i < rating
        return (
          <span key={i} className={filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-gray-300'}>
            ★
          </span>
        )
      })}
      {showValue && (
        <span className="text-gray-600 ml-1 text-sm">
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </span>
  )
}
