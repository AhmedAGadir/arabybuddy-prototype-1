## immediate

- quiz to see level,
- add a window mockup from daisy UI on the homepage showing off the app

- market to kids

countdown after credits run out until credits reload

mute audio options ??

- company list for social proof on homepage, testimonial messages etc, they all help conversions.

- see list of phone and consolidate all of this

- refactor services to use react query?? will this remove the need for active tasks?

- [ ] use react suspense boundaries and skeleton loaders to render fallback button for anything that takes long, e.g:

  - authentication buttons on home screen
  - messages on existing conversations
  - conversation list
  - preferences (long so probably not)

- [ ] create lib/actions files for conversations, messages etc so that when a user deletes their account we remove their messages from our DB

- [ ] streaming?
- [ ] set up email support forwarding - did the same thing for azza school
- [ ] bar of conversation topics
- [ ] mascot with 5-6 different expressions
- [ ] pagespeed insights - google performance before launch

- [ ] https://stackoverflow.com/questions/78030722/how-to-resolve-task-timed-out-after-10-01-seconds-in-a-next-js-application-dep
- [ ] https://vercel.com/changelog/serverless-functions-can-now-run-up-to-5-minutes
- [ ] auto start recording toggle
- [ ] stream text to speech
- [ ] webhooks?
- [ ] topics of conversation and voices settings
- [ ] automatically starting recording after response plays
- [ ] moving instructions to fade in ontop of the record button
- [ ] look up words in almaany
- [ ] react query - loading / error state
- [ ] pause/cancel requests
- [ ] monitor input for being NSFW
- [ ] advanced features - rate limiting, server side cache, etc - just learn
- [ ] continue conversation when first loading, or start new
- [ ] dark mode
- [ ] check for no content in the recording, and if not, then just turn off the mic
- [ ] change eslint config file back when done with mobile debugging
- [ ] language support, dialect support - if not then diasble options on home page
- [ ] toggle between previous and next messages
- [ ] rephrase a message
- [ ] migrate from serverless functions to a seperate nodejs render backend, then unsubscribe to vercels pro plan

# Features for MVP

- [ ] only chat
- [ ] dialects (Start)
- [ ] 2 voices
- [ ] rephrase mode
- [ ] looking up words in almaany
- [ ] databases, authentication and payments
- [ ] some viral element - leaderboard, sharing with friends etc
- [ ] analytics
- [ ] adds, kickstarter, tiktok sponsors (talk to mohab 16), product hunt etc
- [ ] notification for connected/disconnect to internet (like codecademy)
- [ ] option for type a response back instead?

# Features

- pages

  - chat (voice)
  - chat (text)
  - settings

  - monolingual vs bilingual mode

  - translate a PDF
  - translate a PDF and read it to me
  - camera - picture mode (what is that ? ma hatha)
  - repeat after me mode (checks)

# Tech

## Tech Stack

- README-AI to generate readme
- fetching data (react query)
- AI - elevenlabs and openai (GPT4 and Whisper)
- database (mongo)
- auth (clerk)
- payments (stripe)
- React query vs server components?
  https://tkdodo.eu/blog/you-might-not-need-react-query
- websockets for streaming data?

# ToDo

- [ ] set up analytics (google analytics is good but events-based product is better (mix panel?). Pick 5-10 metrics).
- [ ] reduce latency
- [ ] build in authentication and payments
- [ ] add all boilerplate-ish pages and components (privacy policy, refunds,header, footer, sidebar etc etc)

### Todo (Microphone)

- [ ] add polyfills for supporting diff browsers MediaRecorder
      (already implemented but doesn't really work so its commented out - see useMediaRecorderPolyfill) https://www.npmjs.com/package/opus-media-recorder
      https://www.npmjs.com/package/audio-recorder-polyfill
- [ ] add fallbacks for supported audio types across different browsers/OS's
- [x] find out how to not have to ask for microphone permission every time on iOS
      see https://restream.io/tools/mic-test
      contact restream CEO on linkedin/other channels
      help reddit: https://www.reddit.com/r/AskProgramming/comments/1bxn68l/mediarecorder_api_call_requestdata_multiple_times/
      help stackoverflow: https://stackoverflow.com/questions/78285997/mediarecorder-api-call-requestdata-multiple-times-to-create-multiple-audio-bl
      help freecodecamp: https://forum.freecodecamp.org/t/how-to-record-audio-without-repeatedly-asking-for-permission-to-use-microphone/684057
