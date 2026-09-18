import type { Metadata } from 'next'
import { ConverterClient } from './ConverterClient'
import { ToolExplainer } from '@/components/tool-explainer'
import { Footer } from '@/components/site-footer'
import { AdSlot } from '@/components/ads/ad-slot'

export const metadata: Metadata = {
  title: 'Free File Converter — PDF, DOCX, HTML, CSV and Images',
  description:
    'Convert DOCX, HTML, CSV and text files to PDF, pull text out of a PDF, turn images into PNG or JPEG, and compress files — free, in your browser.',
  alternates: { canonical: '/converter' },
}

export default function ConverterPage() {
  return (
    <>
      <ConverterClient />

      <ToolExplainer
        lead="A free file converter that runs in your browser. It handles the conversions people actually need day to day — getting a document into PDF so it opens the same way everywhere, pulling text back out of a PDF, and flattening images into a format a form will accept."
        sections={[
          {
            heading: 'What it converts',
            bullets: [
              { term: 'DOCX → PDF', description: 'Word documents to PDF, so formatting holds on any device.' },
              { term: 'HTML → PDF', description: 'a saved web page or HTML export into a single PDF.' },
              { term: 'CSV → PDF', description: 'a spreadsheet export laid out as a readable table.' },
              { term: 'TXT → PDF', description: 'plain text into a paginated document.' },
              { term: 'PDF → TXT', description: 'extract the text content from a PDF for editing or searching.' },
              { term: 'PDF → image', description: 'render PDF pages out as images.' },
              { term: 'Image → PNG / JPEG / PDF', description: 'convert between image formats, or collect images into a PDF.' },
              { term: 'Compress', description: 'reduce file size, with a quality setting you choose.' },
            ],
          },
          {
            heading: 'Why we built it',
            paragraphs: [
              'Most free converters online ask you to upload your file to someone else’s server, wait in a queue, and then watch an advert before you can download the result. For anything with a name, an address or an invoice number in it, that is a poor trade.',
              'This one does the work locally where the format allows it, which also means it keeps working on a slow connection — the file never has to make a round trip.',
            ],
          },
          {
            heading: 'Practical notes',
            paragraphs: [
              'PDF text extraction only recovers text that is really text. A PDF produced by scanning or photographing a page is a picture of words, and nothing can be pulled out of it without optical character recognition, which this tool does not do.',
              'Complex Word layouts — multi-column spreads, embedded fonts, tracked changes — can shift when converted. For anything going to a printer, check the output before you send it.',
            ],
          },
        ]}
      />

      <div className="container mx-auto max-w-3xl px-6">
        <AdSlot placement="article-bottom" minHeight={120} />
      </div>

      <Footer />
    </>
  )
}
