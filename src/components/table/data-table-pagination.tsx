import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { IconButton } from "#/components/ui/icon-button";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
	return (
		<div className='flex items-center gap-1'>
			<IconButton
				aria-label='Go to first page'
				isDisabled={!table.getCanPreviousPage()}
				onPress={() => table.firstPage()}
			>
				<ChevronsLeft size={16} />
			</IconButton>
			<IconButton
				aria-label='Go to previous page'
				isDisabled={!table.getCanPreviousPage()}
				onPress={() => table.previousPage()}
			>
				<ChevronLeft size={16} />
			</IconButton>

			<span className='px-2 font-semibold text-sm tabular-nums'>
				{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
			</span>

			<IconButton
				aria-label='Go to next page'
				isDisabled={!table.getCanNextPage()}
				onPress={() => table.nextPage()}
			>
				<ChevronRight size={16} />
			</IconButton>
			<IconButton
				aria-label='Go to last page'
				isDisabled={!table.getCanNextPage()}
				onPress={() => table.lastPage()}
			>
				<ChevronsRight size={16} />
			</IconButton>
		</div>
	);
}
