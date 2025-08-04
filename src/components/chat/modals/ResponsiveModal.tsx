import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'

interface Props {
	children: React.ReactNode
	open: boolean
	title: string
	onOpenChange: (open: boolean) => void
}

const ResponsiveModal = ({ children, open, title, onOpenChange }: Props) => {
	const isMobile = useIsMobile()

	if (isMobile) {
		return (
			<Drawer
				onOpenChange={onOpenChange}
				open={open}
			>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{title}</DrawerTitle>
					</DrawerHeader>
					{children}
				</DrawerContent>
			</Drawer>
		)
	}

	return (
		<Dialog
			onOpenChange={onOpenChange}
			open={open}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	)
}

export default ResponsiveModal
