/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

import type { Root } from 'hast'
import { marked } from 'marked'
import Link, { type LinkProps } from 'next/link'
import React, { memo, useMemo } from 'react'
import { visit } from 'unist-util-visit'

import { cn } from '@/lib/utils'

import CodeBlock from './CodeBlock'

export default function rehypeInlineCodeProperty() {
	return (tree: Root) => {
		visit(tree, 'element', (node, _index, parent) => {
			if (node.tagName === 'code') {
				const parentElement = parent as Element | undefined

				node.properties ||= {}
				node.properties.inline = parentElement?.tagName !== 'pre'
			}
		})
	}
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
	const tokens = marked.lexer(markdown)
	return tokens.map(token => token.raw ?? '').filter(block => block.trim().length > 0)
}

const components: Partial<Components> = {
	code: ({ node, className, children, ...rest }) => {
		const isInline = node?.properties?.inline === true

		return (
			<CodeBlock
				className={className || ''}
				inline={isInline}
				{...rest}
			>
				{children}
			</CodeBlock>
		)
	},
	pre: ({ children }) => <>{children}</>,
	p: ({ children }) => {
		const isOnlyText = React.Children.toArray(children).every(
			child => typeof child === 'string' || typeof child === 'number',
		)

		return isOnlyText ? <p>{children}</p> : <>{children}</>
	},
	a: ({ node, children, ...props }) => {
		return (
			<Link
				rel="noreferrer"
				target="_blank"
				{...(props as LinkProps)}
			>
				{children}
			</Link>
		)
	},
	table: ({ node, children, ...props }) => {
		return (
			<div className="overflow-x-auto">
				<table
					className="min-w-full"
					{...props}
				>
					{children}
				</table>
			</div>
		)
	},
}

const MemoizedMarkdownBlock = memo(
	({ content }: { content: string }) => {
		return (
			<ReactMarkdown
				components={components}
				rehypePlugins={[rehypeKatex, rehypeInlineCodeProperty]}
				remarkPlugins={[remarkGfm, remarkMath]}
			>
				{content}
			</ReactMarkdown>
		)
	},
	(prevProps, nextProps) => {
		if (prevProps.content !== nextProps.content) return false
		return true
	},
)

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock'

export const MemoizedMarkdown = memo(
	({ content, id, className }: { content: string; id: string; className?: string }) => {
		const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content])

		return blocks.map(block => (
			<div
				className={cn('content-styles', className)}
				key={`${id}-block_${block}`}
			>
				<MemoizedMarkdownBlock content={block} />
			</div>
		))
	},
)

MemoizedMarkdown.displayName = 'MemoizedMarkdown'
