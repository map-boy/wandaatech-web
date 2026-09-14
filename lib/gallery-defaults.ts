/**
 * The photos shipped with the repository.
 *
 * These render when the `gallery` table is empty, so the page is never blank.
 * Anything added in /admin → Gallery is shown instead.
 */
export interface Photo {
  id: string
  src: string
  caption: string
  category: string
}

export const DEFAULT_PHOTOS: Photo[] = [
  { id: 'd1',  src: '/gallery/VAF-UBWENGE-TECH-TEAM.jpg', caption: 'VAF Ubwenge Tech Team',       category: 'Team' },
  { id: 'd2',  src: '/gallery/felix-convention.jpg',      caption: 'Felix at Convention Center',  category: 'Events' },
  { id: 'd3',  src: '/gallery/felix_explanation.jpeg',    caption: 'Felix — Project Explanation', category: 'Projects' },
  { id: 'd4',  src: '/gallery/wandaa-explanation.jpeg',   caption: 'WANDAA — Model Explanation',  category: 'Lab' },
  { id: 'd5',  src: '/gallery/viella-presentation.jpeg',  caption: 'Viella — Presentation',       category: 'Events' },
  { id: 'd6',  src: '/gallery/pakistan-embassy.jpg',      caption: 'Pakistan Embassy Visit',      category: 'Events' },
  { id: 'd7',  src: '/gallery/pakistan--embassy.jpg',     caption: 'Pakistan Embassy — Meeting',  category: 'Events' },
  { id: 'd8',  src: '/gallery/zindi-competition.jpg',     caption: 'Zindi ML Competition',        category: 'Lab' },
  { id: 'd9',  src: '/gallery/zindi-pic.jpg',             caption: 'Zindi Competition Team',      category: 'Lab' },
  { id: 'd10', src: '/gallery/training.jpg',              caption: 'Team Training Session',       category: 'Team' },
  { id: 'd11', src: '/gallery/opening-ceremony.jpg',      caption: 'Opening Ceremony',            category: 'Events' },
  { id: 'd12', src: '/gallery/picture-overview.jpg',      caption: 'Picture of all attendees',    category: 'Projects' },
  { id: 'd13', src: '/gallery/ambassada.jpg',             caption: 'Ambassador Meeting',          category: 'Events' },
  { id: 'd14', src: '/gallery/ambassador.jpg',            caption: 'Ambassador Event',            category: 'Events' },
  { id: 'd15', src: '/gallery/assistan.jpg',              caption: 'Assistant at the embassy',    category: 'Lab' },
  { id: 'd16', src: '/gallery/felix-presentation.jpg',    caption: 'Felix — Live Presentation',   category: 'Projects' },
  { id: 'd17', src: '/gallery/felix-wandaa.jpg',          caption: 'Felix & WANDAA in Zindi',     category: 'Lab' },
  { id: 'd18', src: '/gallery/valentin presentation.jpg', caption: 'Valentin — Presentation',     category: 'Events' },
  { id: 'd19', src: '/gallery/valentin-prese.jpg',        caption: 'Valentin — Stage',            category: 'Events' },
  { id: 'd20', src: '/gallery/wandaa.jpg',                caption: 'WANDAA — Showcase',           category: 'Lab' },
]
