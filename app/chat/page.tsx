import { redirect } from 'next/navigation'

/**
 * Shortcut to the team's WhatsApp.
 *
 * This used to render a full HTML document with a meta-refresh, which nested
 * a second <html> inside the app shell and left a "Redirecting..." page in the
 * index — a content-free page counts against the site when AdSense reviews it.
 * A real redirect sends no body at all.
 */
export default function ChatRedirect() {
  redirect('https://wa.me/250788302465')
}
