'use client'

import ResponsiveModal from '../ResponsiveModal'
import ArchivedChatList from './ArchivedChatList'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const ArchivedChatsModal = ({ open, onOpenChange }: Props) => {
	return (
		<ResponsiveModal
			onOpenChange={onOpenChange}
			open={open}
			title="Archived Chats"
		>
			<ArchivedChatList onOpenChange={onOpenChange} />
		</ResponsiveModal>
	)
}

export default ArchivedChatsModal
