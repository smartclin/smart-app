import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import {
	Button as AriaButton,
	SearchField as AriaSearchField,
	type SearchFieldProps as AriaSearchFieldProps,
	type ValidationResult as AriaValidationResult,
	Text
} from "react-aria-components";

import { FieldError, FieldGroup } from "./field";
import { Input } from "./input";
import { Label } from "./label";
export interface SearchFieldProps extends AriaSearchFieldProps {
	description?: string;
	errorMessage?: string | ((validation: AriaValidationResult) => string);
	label?: string;
}

export function SearchField({ description, errorMessage, label, ...props }: SearchFieldProps) {
	return (
		<AriaSearchField
			{...props}
			className='group flex min-w-10 flex-col gap-1'
		>
			{label ? <Label>{label}</Label> : null}
			<FieldGroup>
				<MagnifyingGlassIcon
					aria-hidden
					className='ml-2 size-4 fill-muted-foreground group-disabled:fill-muted-foreground/50'
				/>
				<Input
					className='w-full outline-none [&::-webkit-search-cancel-button]:hidden'
					placeholder='Search...'
				/>
				<AriaButton className='mr-1 w-6 group-empty:invisible'>
					<XIcon aria-hidden />
				</AriaButton>
			</FieldGroup>
			{description ? (
				<Text
					className='text-muted-foreground text-sm'
					slot='description'
				>
					{description}
				</Text>
			) : null}
			<FieldError>{errorMessage as any}</FieldError>
		</AriaSearchField>
	);
}
