PROJECT START DATE: Sun Mar 31 23:56:39 2024 +0100
launch date at: 31 May 2024

ArabyBuddy is a voice-based arabic tutor chat app that supports 8 different arabic dialects.

### Features

- personalization - 8 arabic dialects, language level, assistant persona, voice, speaking style and response length.
- familiarity - setting user interests and personality
- voice recording and responses
- regenerating responses
- rephrasing our messages
- replaying a message
- translating a message
- dictionary word look up / definition generation

### 3 AI APIS:

1. Open AI Whisper
   - transcription (speech-to-text)
   - uses serverless functions
2. Open AI GPT Completions
   - completions (text-to-text)
   - was previously done with Open AI GPT Assistant API but it was too slow
   - uses serverless functions
   - streaming with Server-Side Events
     3.ElevenLabs
   - generating audio (text-to-speech)
   - uses websocket connection to a provided websocket connection

### Other tech:

- Next JS App Router
- Tanstack Query - connecting with DB
- TypeScript
- Clerk (Auth)
- Stripe (Payments)
- MongoDB & Mongoose (Database)
- Vercel - hosting and analytics

### some UI libraries used:

- Tailwind
- Flowbite
- ShadCN
- React Hook Form / Zod
- HeroIcons
- Headless UI
- React Spinners

### Paid services:

- Open AI API
- ElevenLabs pro plan
- Vercel pro plan

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# language-buddy
