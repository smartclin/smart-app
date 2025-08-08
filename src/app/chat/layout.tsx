import AuthGate from '@/components/chat/auth/AuthGate';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/sidebar/ChatSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function ChatLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='h-dvh'>
      <AuthGate>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 62)',
              '--header-height': 'calc(var(--spacing) * 12)'
            } as React.CSSProperties
          }
        >
          <ChatSidebar variant='inset' />
          <SidebarInset className='relative flex min-w-0 flex-1 flex-col'>
            <ChatHeader />
            <section className='flex flex-1 flex-col'>{children}</section>
          </SidebarInset>
        </SidebarProvider>
      </AuthGate>
    </main>
  );
}
