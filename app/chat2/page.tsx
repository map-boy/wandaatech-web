import { redirect } from 'next/navigation'

/** Second WhatsApp shortcut. See app/chat/page.tsx. */
export default function ChatRedirect2() {
  redirect('https://wa.me/250788302465')
}
