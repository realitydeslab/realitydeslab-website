interface Props {
  children: string | null
  className?: string
  prefix?: string
}

export default function ArticleTitle({ children, className, prefix }: Props) {
  return prefix ? (
    <div className="flex flex-col gap-2">
      <p className="text-28 leading-none lg:text-32">{prefix}</p>
      <h1 className={`text-32 leading-none lg:text-50 ${className}`}>{children}</h1>
    </div>
  ) : (
    <h1 className={`text-32 leading-none lg:text-50 ${className}`}>
      <span className="block">{children}</span>
    </h1>
  )
}
