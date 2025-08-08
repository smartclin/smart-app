'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/client'

export function LatestPost() {
  const t = useTranslations('Post')
  const [latestPost] = api.post.getLatest.useSuspenseQuery()

  const utils = api.useUtils()
  const [name, setName] = useState('')
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate()
      setName('')
    },
  })

  return (
    <div className='flex w-full flex-col items-center justify-center'>
      <form
        className='flex flex-col gap-6 text-center'
        onSubmit={(e) => {
          e.preventDefault()
          createPost.mutate({ name })
        }}
      >
        {latestPost ? (
          <p className='truncate'>
            {t('latestPost', { name: latestPost.name })}
          </p>
        ) : (
          <p>{t('noPost')}</p>
        )}
        <Input
          onChange={(e) => setName(e.target.value)}
          placeholder={t('titlePlaceholder')}
          required
          type='text'
          value={name}
        />
        <Button
          disabled={createPost.isPending}
          type='submit'
        >
          {createPost.isPending ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  )
}
