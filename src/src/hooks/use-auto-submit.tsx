import { debounce } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import type { FieldValues, UseFormTrigger, UseFormWatch } from 'react-hook-form'

interface AutoSubmitProps<T extends FieldValues> {
	trigger: UseFormTrigger<T>
	watch: UseFormWatch<T>
	onSubmit: () => void
	onValidationFailed?: () => void
	debounceTime?: number
}

/**
 * Automatically submit data when it's changed
 */
export const useAutoSubmit = <T extends FieldValues>({
	trigger,
	watch,
	onSubmit,
	onValidationFailed,
	debounceTime = 300,
}: AutoSubmitProps<T>) => {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const debouncedSubmit = useMemo(() => {
		return debounce((submitFn: () => void) => {
			submitFn()
		}, debounceTime)
	}, [debounceTime])

	useEffect(() => {
		const subscription = watch((_data, info) => {
			if (info?.type !== 'change') return
			setIsSubmitting(true)
			trigger()
				.then(valid => {
					if (valid) debouncedSubmit(onSubmit)
					else onValidationFailed?.()
				})
				.finally(() => setIsSubmitting(false))
		})

		return () => subscription.unsubscribe()
	}, [watch, trigger, onSubmit, onValidationFailed, debouncedSubmit])

	return { isSubmitting }
}

export default useAutoSubmit
