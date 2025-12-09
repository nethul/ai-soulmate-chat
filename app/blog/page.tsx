import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { POSTS_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function BlogPage() {
    const posts = await client.fetch(POSTS_QUERY)

    return (
        <main className="min-h-screen bg-stone-950 text-stone-200 py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-6">
                        Latest Updates
                    </h1>
                    <p className="text-stone-400 text-lg max-w-2xl mx-auto">
                        Insights, tutorials, and news about AI tools and technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map((post: any) => (
                            <Link
                                key={post._id}
                                href={`/blog/${post.slug.current}`}
                                className="group flex flex-col bg-stone-900/50 border border-stone-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1"
                            >
                                {post.mainImage && (
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image
                                            src={urlFor(post.mainImage).url()}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-xs text-orange-400 mb-3">
                                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                        {post.author && (
                                            <>
                                                <span>•</span>
                                                <span>{post.author}</span>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-stone-100 mb-3 group-hover:text-orange-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-stone-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center text-orange-400 text-sm font-medium mt-auto">
                                        <span>Read more</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-stone-500">
                            <p>No posts found. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
