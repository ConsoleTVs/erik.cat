import type { Post } from 'contracts'
import dayjs from 'dayjs'

export function slug(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function orderPostsByDate(first: Post, second: Post) {
  const firstDate = dayjs(first.date)
  const secondDate = dayjs(second.date)

  if (firstDate.isSame(secondDate)) {
    return 0
  }

  return firstDate.isAfter(secondDate) ? -1 : 1
}
