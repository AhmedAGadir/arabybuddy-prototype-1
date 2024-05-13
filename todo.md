# IMPORTANT NOTE TO SELF

- This is for MVP, the project can be worked on infinitely but we dont want to waste time
- Still make it good and provide more value than everything out there, but dont geek out on features
- features should be business driven

## PROJECT START DATE: Sun Mar 31 23:56:39 2024 +0100. PROJECT LAUNCH DATE: 31 May 2024

## Business HAT:

**_ spend some time working ON the business, not IN the business _**

- what problem are we solving?
- are these features enough?
- is this a grand slam offer?
- consider upgrading openAI membership tier, it may reduce latency - but look into this first

## Developer HAT:

### FOR MVP:

### Feature requests (high priority)

- [ ] sync audio streaming to text
- [ ] make database transactions all pass or all fail (atomic)
- [ ] add dictionary feature - mono/biligual, generator or almaany lookup
- [ ] credits: implement credits + payments + transactions
- [ ] credits: implement modal with/without countdown for credits run out
- [ ] its not obvious how to use arabybuddy or what it does - implement guided tour? modal slice-based guide? information button? - copy chat GPT - it has 4 button suggestions and says how can i help you.
- [ ] implement profile page
- [ ] train/fine-tune models for different dialects
- [ ] some viral element - leaderboard, sharing with friends etc
- [ ] instead of regular chat, have a list of different personalities we can pick to talk to (restuarant waiter, talking dog, person in street etc - each has an avatar and a number of different states - later on they can create their own) -

### Feature requests (low priority)

- [ ] set up email support forwarding - did the same thing for azza school
- [ ] use skeleton loaders
- [ ] add scroll to top/bottom buttons on messages
- [ ] use suspense boundaries
- [ ] experiment with optimising ai api calls (speed latency for eleven labs, other stuff for openai whisper/gpt?)
- [ ] add copy word/message feature
- [ ] add share message feature
- [ ] add delete message feature
- [ ] dark mode
- [ ] make panelControls expandable (elipses menu with more options)
- [ ] add hotkeys
- [ ] mute audio option (via messageCard - speaker icon can be crossed out when muted)
- [ ] bar of conversation topics?
- [ ] create ArabyBuddy mascot (5-6 expressions) and can toggle between messageCard and mascot in bottom left of screen (on mobile) and top right (on desktop)
- [ ] autorestart recording
- [ ] migrate from serverless functions to a seperate nodejs render backend, then unsubscribe to vercels pro plan
- [ ] type/edit messages
- [ ] notification for connected/disconnect to internet (like codecademy)
- [ ] take a picture and explain to me what it is
- [ ] translate a PDF
- [ ] checks pronunciation
- [ ] save audio to s3 and use later?
- [ ] download translations with every message (no)
- [ ] word of the day? (no)
- [ ] Show word root etc in dictionary?

### Bug fixes

- [ ] sanitize user input everywhere
- [ ] throw better errors, see communications service (unknown error catch all - maybe wrap useQuery and have some general checks there - it would need to be skippable though)
- [ ] handle aborting properly in fetch api calls (pass it to backend and use correctly)
- [ ] delete empty chats when navigating away
- [ ] add microphone polyfills, make sure microphone volume settings work well (See below)
- [ ] better handle error/loading states
- [ ] delete messages when failing requests? (think more about how we want to deal with failing requests - perhaps deleting everything isnt good UX - database transactions should be atomic)
- [ ] show loading spinner when creating new conversation in sidebar.
      this may cause a big refactor where we return each mutation instead of mutation.mutateAsync so that we can have access to mutation states (isPending etc).
- [ ] close mobile nav after clicking a button
- [ ] open save preferences navigating when navigating away (dirty state with zod?)
- [ ] create lib actions for everything important so that when a user deletes their account we remove their messages, conversations, preferences etc.
- [ ] change images to use webp format and load faster
- [ ] look into adding security headers before launch - (helmet, etc - see codecademy course) - - ask AI how they can be used in my project
- [ ] advanced features - rate limiting, server side cache, preload, etc
- [ ] kill everything when you navigate to another page
- [ ] set maximum lengths for stuff, max token usage etc, response timeouts, retries etc

### Refactor

- [ ] get rid of useServerlessRequest
- [ ] refactor services to use react query? may remove need for active tasks
- [ ] look into preloading and what it is

### Security

- [ ] Add helmet for security headers (11/15 are done automatically), Validation library (express-validation / validation npm package)
- [ ] look into sessions/cookies etc - ask AI how they can be used in my project

### prelaunch

- [ ] README-AI to generate readme
- [ ] pagespeed insights
- [ ] change eslint config file back when done with mobile debugging
- [ ] turn on vercel analytics
- [ ] add in app boilerlate (privacy policy, terms and conditions, refunds etc)
- [ ] add a window mockup (daisy UI) on the homepage showing off the app (mobile and desktop)

### Changelog

- [x] fixed home screen auth buttons
- [x] created protected routes with clerk
- [x] set message index in the query params
- [x] stream openai completions (using async generators and updating react query cache)

"Microphone polyfill notes:

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

## After MVP:

### things to learn

- [ ] UML, Miro, Databases
-

## Marketing HAT:

- [ ] create BETA group? talk to users
- [ ] create quiz for people to test their arabic level
- [ ] think of a way to market to kids
- [ ] think about influencer marketing
- [ ] company list for social proof on homepage, testimonial messages etc, they all help conversions.
- [ ] observe vercel analytics
- [ ] maybe add google analytics
- [ ] kickstarter, producthunt, appsumo, (talk to mohab 16).
