import {
	IconAdjustmentsHorizontal,
	IconAlertCircle,
	IconAlertTriangle,
	IconArrowRight,
	IconBell,
	IconBold,
	IconBox,
	IconBrightness,
	IconCalendar,
	IconCheck,
	IconChecks,
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsDown,
	IconChevronsLeft,
	IconChevronsRight,
	IconChevronUp,
	IconCircle,
	IconCircleCheck,
	IconCirclePlus,
	IconCircleX,
	IconClipboardText,
	IconClock,
	IconCode,
	IconCommand,
	IconCreditCard,
	IconCrown,
	IconDeviceLaptop,
	IconDots,
	IconDotsVertical,
	IconEdit,
	IconExternalLink,
	IconEyeOff,
	IconFile,
	IconFileText,
	IconFileTypeDoc,
	IconFileTypePdf,
	IconFileTypeXls,
	IconFileZip,
	IconFolder,
	IconGripVertical,
	IconHelpCircle,
	IconInfoCircle,
	IconItalic,
	IconLayoutDashboard,
	IconLayoutKanban,
	IconLayoutSidebar,
	IconLoader2,
	IconLock,
	IconLogin,
	IconLogout,
	IconMessage,
	IconMinus,
	IconMoon,
	IconMusic,
	IconPalette,
	IconPaperclip,
	IconPhone,
	IconPhoto,
	IconPizza,
	IconPlus,
	IconRosetteDiscountCheck,
	IconSearch,
	IconSelector,
	IconSend,
	IconSettings,
	IconShare,
	IconSlash,
	IconSparkles,
	IconStack2,
	IconStar,
	IconSun,
	IconTrash,
	IconTrendingDown,
	IconTrendingUp,
	IconTypography,
	IconUnderline,
	IconUpload,
	IconUser,
	IconUserCircle,
	IconUserEdit,
	IconUsers,
	IconUserX,
	IconVideo,
	IconX
} from "@tabler/icons-react";
import { ChartAreaIcon } from "lucide-react";
import { useId } from "react";

type IconProps = React.HTMLAttributes<SVGElement>;

const iconStyles = "text-muted-foreground hover:text-foreground transition-colors duration-300";

export type Icon = React.ComponentType<IconProps>;

export const Icons = {
	discord: (props: IconProps) => {
		const iconId = useId();

		return (
			<svg
				aria-labelledby={iconId}
				className={iconStyles}
				viewBox='0 0 126.644 96'
				xmlns='http://www.w3.org/2000/svg'
				{...props}
			>
				<title id={iconId}>Discord</title>
				<path d='M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505Z' />
			</svg>
		);
	},

	instagram: (props: IconProps) => {
		const iconId = useId();

		return (
			<svg
				aria-labelledby={iconId}
				className={iconStyles}
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				viewBox='0 0 24 24'
				xmlns='http://www.w3.org/2000/svg'
				{...props}
			>
				<title id={iconId}>Instagram</title>
				<rect
					height='20'
					rx='5'
					ry='5'
					width='20'
					x='2'
					y='2'
				/>
				<path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
				<line
					x1='17.5'
					x2='17.51'
					y1='6.5'
					y2='6.5'
				/>
			</svg>
		);
	},

	github: (props: IconProps) => {
		const iconId = useId();

		return (
			<svg
				aria-labelledby={iconId}
				className={iconStyles}
				fill='currentColor'
				viewBox='0 0 24 24'
				xmlns='http://www.w3.org/2000/svg'
				{...props}
			>
				<title id={iconId}>GitHub</title>
				<path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.243 2.873.12 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z' />
			</svg>
		);
	},

	twitter: (props: IconProps) => {
		const iconId = useId();

		return (
			<svg
				aria-labelledby={iconId}
				className={iconStyles}
				fill='currentColor'
				viewBox='0 0 24 24'
				xmlns='http://www.w3.org/2000/svg'
				{...props}
			>
				<title id={iconId}>Twitter (X)</title>
				<path d='M18.244 2H21l-6.52 7.455L22 22h-6.172l-4.833-6.307L5.47 22H2.714l6.976-7.97L2 2h6.328l4.37 5.684L18.244 2Zm-1.082 18h1.72L7.43 3.93H5.59l11.572 16.07Z' />
			</svg>
		);
	},

	facebook: (props: IconProps) => {
		const iconId = useId();

		return (
			<svg
				aria-labelledby={iconId}
				className={iconStyles}
				fill='currentColor'
				viewBox='0 0 24 24'
				xmlns='http://www.w3.org/2000/svg'
				{...props}
			>
				<title id={iconId}>Facebook</title>
				<path d='M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.464.099 2.796.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z' />
			</svg>
		);
	},

	youtube: (props: IconProps) => {
		const iconId = useId();

		return (
			<svg
				aria-labelledby={iconId}
				className={iconStyles}
				fill='currentColor'
				viewBox='0 0 24 24'
				xmlns='http://www.w3.org/2000/svg'
				{...props}
			>
				<title id={iconId}>YouTube</title>
				<path d='M23.498 6.186a2.996 2.996 0 0 0-2.112-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.521a2.996 2.996 0 0 0-2.112 2.12C0 8.07 0 12 0 12s0 3.93.502 5.814a2.996 2.996 0 0 0 2.112 2.12c1.881.521 9.386.521 9.386.521s7.505 0 9.386-.521a2.996 2.996 0 0 0 2.112-2.12C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z' />
			</svg>
		);
	},
	// General
	alertCircle: IconAlertCircle,
	warning: IconAlertTriangle,
	arrowRight: IconArrowRight,
	check: IconCheck,
	checks: IconChecks,
	circleCheck: IconCircleCheck,
	close: IconX,
	clock: IconClock,
	charts: ChartAreaIcon,
	code: IconCode,
	dots: IconDots,
	ellipsis: IconDotsVertical,
	externalLink: IconExternalLink,
	help: IconHelpCircle,
	info: IconInfoCircle,
	spinner: IconLoader2,
	search: IconSearch,
	settings: IconSettings,
	trash: IconTrash,

	// Navigation / Chevrons
	chevronDown: IconChevronDown,
	chevronLeft: IconChevronLeft,
	chevronRight: IconChevronRight,
	chevronUp: IconChevronUp,
	chevronsDown: IconChevronsDown,
	chevronsLeft: IconChevronsLeft,
	chevronsRight: IconChevronsRight,
	chevronsUpDown: IconSelector,

	// Layout
	dashboard: IconLayoutDashboard,
	kanban: IconLayoutKanban,
	panelLeft: IconLayoutSidebar,

	// User
	user: IconUser,
	user2: IconUserCircle,
	account: IconUserCircle,
	profile: IconUser,
	employee: IconUserX,
	userPen: IconUserEdit,
	teams: IconUsers,

	// Brand

	logo: IconCommand,

	// Communication
	chat: IconMessage,
	notification: IconBell,
	phone: IconPhone,
	video: IconVideo,
	send: IconSend,
	paperclip: IconPaperclip,

	// Files
	page: IconFile,
	post: IconFileText,
	fileTypePdf: IconFileTypePdf,
	fileTypeDoc: IconFileTypeDoc,
	fileTypeXls: IconFileTypeXls,
	fileZip: IconFileZip,
	media: IconPhoto,
	music: IconMusic,

	// Actions
	add: IconPlus,
	edit: IconEdit,
	upload: IconUpload,
	share: IconShare,
	login: IconLogin,
	logout: IconLogout,
	gripVertical: IconGripVertical,

	// Shapes / Indicators
	circle: IconCircle,
	circleX: IconCircleX,
	plusCircle: IconCirclePlus,
	xCircle: IconCircleX,
	minus: IconMinus,

	// Theme
	sun: IconSun,
	moon: IconMoon,
	brightness: IconBrightness,
	laptop: IconDeviceLaptop,
	palette: IconPalette,

	// Commerce / Plans
	billing: IconCreditCard,
	creditCard: IconCreditCard,
	product: IconBox,
	pro: IconCrown,
	exclusive: IconStar,
	sparkles: IconSparkles,
	badgeCheck: IconRosetteDiscountCheck,
	lock: IconLock,

	// Data / Charts
	trendingDown: IconTrendingDown,
	trendingUp: IconTrendingUp,
	eyeOff: IconEyeOff,
	adjustments: IconAdjustmentsHorizontal,

	// Text formatting
	bold: IconBold,
	italic: IconItalic,
	underline: IconUnderline,
	text: IconTypography,

	// Toast
	toastSuccess: IconCircleCheck,
	toastInfo: IconInfoCircle,
	toastWarning: IconAlertTriangle,
	toastError: IconCircleX,
	toastLoading: IconLoader2,

	// Misc
	pizza: IconPizza,
	workspace: IconFolder,
	forms: IconClipboardText,
	slash: IconSlash,
	calendar: IconCalendar,
	galleryVerticalEnd: IconStack2,
	moreHorizontal: IconDots
};
