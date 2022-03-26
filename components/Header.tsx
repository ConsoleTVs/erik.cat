import { FC, useMemo } from 'react'
import dayjs from 'dayjs'
import { Post } from 'contracts'
import Link from 'next/link'
import { slug } from 'lib/utils'

interface Props {
  post: Post
}

const Header: FC<Props> = ({ post }) => {
  const formattedDate = useMemo(() => dayjs(post.date).format('MMM D, YYYY'), [post.date])
  const dateTimeDate = useMemo(() => dayjs(post.date).format('YYYY-MM-DD'), [post.date])

  return (
    <header className="flex flex-col my-12 space-y-6 text-center not-prose">
      <h1 className="text-4xl italic leading-relaxed tracking-wide font-serif2">{post.title}</h1>
      <div className="text-xs">
        <time dateTime={dateTimeDate}>{formattedDate}</time>
        &nbsp; &mdash; &nbsp; {post.author}
      </div>
      <div className="flex items-center justify-center text-xs text-gray-500">
        {post.tags.map((tag, i) => (
          <div key={i}>
            {tag}
            {i !== post.tags.length - 1 && <>&nbsp; &middot; &nbsp;</>}
          </div>
        ))}
      </div>
    </header>
  )
}

export const SmallHeader: FC<Props> = ({ post }) => {
  const formattedDate = useMemo(() => dayjs(post.date).format('MMM D, YYYY'), [post.date])

  const dateTimeDate = useMemo(() => dayjs(post.date).format('YYYY-MM-DD'), [post.date])

  return (
    <header className="flex flex-col space-y-3 text-center not-prose">
      <Link href={`/post/${slug(post)}`}>
        <a>
          <h1 className="text-2xl italic leading-relaxed tracking-wide font-serif2">
            {post.title}
          </h1>
        </a>
      </Link>
      <div className="text-xs">
        <time dateTime={dateTimeDate}>{formattedDate}</time>
        &nbsp; &mdash; &nbsp; {post.author}
      </div>
      <div className="flex items-center justify-center text-xs text-gray-500">
        {post.tags.map((tag, i) => (
          <div key={i}>
            {tag}
            {i !== post.tags.length - 1 && <>&nbsp; &middot; &nbsp;</>}
          </div>
        ))}
      </div>
    </header>
  )
}

export default Header
