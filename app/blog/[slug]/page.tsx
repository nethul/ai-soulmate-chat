import { PortableText } from '@portabletext/react'
import { client } from '@/sanity/lib/client'
import { POST_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await client.fetch(POST_QUERY, { slug })

    if (!post) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <article className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-sm text-slate-400 hover:text-violet-400 transition-colors mb-8"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4 mr-1"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                        Back to Blog
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                        <time dateTime={post.publishedAt}>
                            {new Date(post.publishedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                        {post.author && (
                            <>
                                <span>•</span>
                                <span>{post.author}</span>
                            </>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-8 leading-tight">
                        {post.title}
                    </h1>

                    {post.mainImage && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 border border-slate-800">
                            <Image
                                src={urlFor(post.mainImage).url()}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                </div>

                <div className="prose prose-invert prose-lg max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-violet-400 hover:prose-a:text-violet-300 prose-strong:text-slate-100 prose-code:text-violet-300 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                    <PortableText
                        value={post.body}
                        components={{
                            types: {
                                image: ({ value }) => {
                                    if (!value?.asset?._ref) {
                                        return null
                                    }
                                    return (
                                        <div className="relative w-full aspect-video my-8 rounded-xl overflow-hidden">
                                            <Image
                                                src={urlFor(value).url()}
                                                alt={value.alt || ' '}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )
                                },
                            },
                        }}
                    />
                </div>
            </article>
        </main>
    )
}
