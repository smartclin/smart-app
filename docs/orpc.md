## MUTATION ###

import { orpc } from '~/lib/orpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function CreatePlanetMutationForm() {
  const queryClient = useQueryClient()

  const { mutate } = useMutation(
    orpc.planet.create.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: orpc.planet.key(),
        })
      },
      onError(error) {
        console.error(error)
        alert(error.message)
      },
    }),
  )

  return (
    <div>
      <h2>oRPC and Tanstack Query | Create Planet example</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.target as HTMLFormElement)

          const name = form.get('name') as string
          const description
            = (form.get('description') as string | null) ?? undefined
          const image = form.get('image') as File

          mutate({
            name,
            description,
            image: image.size > 0 ? image : undefined,
          })
        }}
      >
        <label>
          Name
          <input type="text" name="name" required />
        </label>
        <label>
          Description
          <textarea name="description" />
        </label>
        <label>
          Image
          <input type="file" name="image" accept="image/*" />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

## QUERY ##
import { orpc } from '~/lib/orpc'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'

export function ListPlanetsQuery() {
  const { data, refetch, fetchNextPage, hasNextPage, status } = useSuspenseInfiniteQuery(
    orpc.planet.list.infiniteOptions({
      input: cursor => ({ cursor, limit: 10 }),
      getNextPageParam: lastPage => lastPage.length === 10 ? lastPage.at(-1)?.id : null,
      initialPageParam: 0,
    }),
  )

  if (status === 'error') {
    return (
      <p>
        Something went wrong.
      </p>
    )
  }

  return (
    <div>
      <h2>oRPC and Tanstack Query | List Planets example</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {data.pages.flatMap((page, i) =>
            page.map(planet => (
              <tr key={`${planet.id}-${i}`}>
                <td>{planet.id}</td>
                <td>{planet.name}</td>
                <td>{planet.description}</td>
                <td>{planet.imageUrl}</td>
              </tr>
            )),
          )}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={4}>
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage}
              >
                Load more
              </button>

              <button type="button" onClick={() => refetch()}>
                Refresh
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

  )
}

## STREEM ###
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/lib/orpc'

export function EventIteratorQueries() {
  const streamed = useQuery(orpc.sse.experimental_streamedOptions({ queryFnOptions: { maxChunks: 3 } }))

  return (
    <div>
      <h2>oRPC and Tanstack Query | Event Iterator example</h2>
      <pre>
        {JSON.stringify(streamed.data, null, 2)}
      </pre>
    </div>
  )
}
