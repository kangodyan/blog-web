import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { countListArticleTag } from 'http/services/api'
import { headers } from 'next/headers'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname.split('/')[1]
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

export default async function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const headersList = headers()
  const pathname = headersList.get('referer') || ''
  // 调用 API 查询所有标签对应文章的数量
  const tags = await countListArticleTag()

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div>
        <div className="pb-6 pt-6">
          <h1 className="sm:hidden text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
        </div>
        <div className="flex sm:space-x-24">
          <div className="hidden max-h-screen h-full sm:flex flex-wrap bg-gray-100 dark:bg-zinc-800/50 shadow-lg transition-colors duration-200 pt-5 rounded min-w-[280px] max-w-[280px]">
            <div className="py-4 px-6">
              {pathname.startsWith('/blog') ? (
                <h3 className="text-primary-500 font-bold uppercase">全部文章</h3>
              ) : (
                <Link
                  href={`/blog`}
                  className="font-bold uppercase text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-500"
                >
                  全部文章
                </Link>
              )}
              <ul>
                {tags.map((item) => {
                  return (
                    <li key={item.tag} className="my-3">
                      <div className="w-full mr-10">
                        {pathname.split('/tags/')[1] === slug(item.tag) ? (
                          <h3 className="flex py-2 px-3 uppercase text-sm font-bold text-primary-600/100 dark:text-green-500 p-3 rounded-md bg-zinc-300 dark:bg-white/10 group w-full justify-start cursor-pointer transition ease-in-out">
                            {`${item.tag} (${item.count})`}
                          </h3>
                        ) : (
                          <Link
                            href={`/tags/${slug(item.tag)}`}
                            className="py-2 px-3 uppercase text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-green-500 hover:bg-zinc-200 rounded-md hover:dark:bg-white/10 hover:font-bold group flex p-3 w-full justify-start cursor-pointer transition ease-in-out"
                            aria-label={`View posts tagged ${item.tag}`}
                          >
                            {`${item.tag} (${item.count})`}
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div>
            <ul>
              {displayPosts.map((post) => {
                const { path, date, title, summary, tags } = post
                return (
                  <li key={path} className="py-5 sm:-ml-6">
                    <article className="space-y-2 flex flex-col xl:space-y-0 hover:bg-gray-100 hover:dark:bg-zinc-800/90 p-2 rounded-lg">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                          <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                        </dd>
                      </dl>
                      <div className="space-y-3">
                        <div>
                          <div className="w-full flex flex-row justify-between">
                            <div className="w-full">
                              <Link
                                href={`/${path}`}
                                className="text-gray-900 dark:text-gray-100 hover:dark:text-green-400 text-2xl font-bold leading-8 tracking-tight"
                              >
                                <div>{title}</div>
                              </Link>
                            </div>
                          </div>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => <Tag key={tag} text={tag} />)}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}