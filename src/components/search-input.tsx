'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useCallback, useEffect, useState } from 'react'

interface SearchInputProps {
  defaultValue?: string
}

const SearchInput: React.FC<SearchInputProps> = ({ defaultValue = '' }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState(defaultValue)

  // Sync state if defaultValue prop changes (optional, useful if search params change externally)
  useEffect(() => {
    setSearchValue(defaultValue)
  }, [defaultValue])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams],
  )

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    router.push(`${pathname}?${createQueryString('q', searchValue)}`)
  }

  return (
    <form onSubmit={handleSearch}>
      <div className='hidden items-center rounded-md border border-gray-300 px-2 py-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-300 xl:flex'>
        <Search
          className='text-gray-400'
          size={18}
        />
        <input
          className='px-2 text-sm outline-hidden'
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder='Search...'
          type='search'
          value={searchValue}
        />
      </div>
    </form>
  )
}

export default SearchInput
