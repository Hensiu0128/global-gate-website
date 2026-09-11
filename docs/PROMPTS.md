# How to work with Claude Code on this project

Written for the site owner. You do not need to be a developer to use this — but you do need
to ask well, and to check the answers. This file tells you how.

---

## First: you don't have to explain the project every time

There is a file called [CLAUDE.md](../CLAUDE.md) in the main folder. **Claude Code reads it
automatically at the start of every session**, before you type anything. It already contains:

- what this project is and how it's built
- the seven rules that must never be broken, and why
- the commands, the common mistakes, and which file controls what

So you never need to re-explain the architecture, and you should never need to re-state the
rules. If Claude ever proposes something that breaks one of them, it has drifted — say so
directly: *"That breaks guarantee 1 in CLAUDE.md. Find another way."*

---

## Your very first session

Open a terminal in this folder, run `claude`, and paste this:

```
Read START-HERE.md, CLAUDE.md, and docs/HANDOFF.md.

I'm the business owner and I'm not a developer. I've just taken this project over
from someone else and I want to understand what I actually have before changing
anything.

Give me:
1. What's built and working, in plain language
2. What's missing or unfinished
3. What you'd do first, and why

Don't change any files yet.
```

That last line matters. It gets you an orientation, not a surprise.

---

## Six habits that make a real difference

**1. Say what you want to achieve, not what you think should be typed.**
Claude knows this codebase; you know the business. Play to that.
> ✅ *"I want overseas freight agents to have their own page explaining what we do for them."*
> ❌ *"Create a new .astro file in src/pages/partners/"*

**2. Ask for a plan before the work on anything substantial.**
> *"Before you write any code, show me your plan and what files you'd change."*

Cheap to read, and it's where you catch a misunderstanding — after the code is written, it's
ten times the effort to unwind.

**3. Demand evidence, never take "done" on trust.**
> *"Run the tests and show me the output."*

"I've fixed it" is a claim. Test output is proof. This is the single most valuable habit on
this list.

**4. Tell it when you don't know something.**
If you don't have the IATA number yet, say so. **Never invent a value to unblock a step, and
never let Claude invent one.** The site is deliberately built so missing facts leave a section
hidden rather than showing something false — a fake license number on a freight site is a real
legal and reputational problem, not a placeholder.

**5. One thing at a time.**
A session that sets up analytics *and* writes a blog post *and* fixes the footer does all
three worse. Finish, verify, then start the next.

**6. Ask "what could this break?"**
> *"What else in the site depends on this? What might this break?"*

Especially before touching the quote form, `src/config/site.ts`, or anything in `src/lib/`.

---

## Prompts for the actual work

These follow [docs/HANDOFF.md](HANDOFF.md) in order. Copy them as-is.

### Getting the site live (Handoff Part A)

```
Walk me through Part A of docs/HANDOFF.md — getting this site live — one step at a
time. I haven't set up any accounts yet.

I'm not technical. For each step: tell me exactly what to click, what to copy, and
what I should see when it worked. Stop and wait for me to confirm before moving to
the next step.

Don't create accounts or change DNS on my behalf — I'll do those parts, you guide me.
```

Then, once it's live:

```
The site is live at https://global-gate.us. Walk me through the launch verification
checklist at the end of Part A of docs/HANDOFF.md and tell me if anything failed.
```

### Supplying a fact you finally have (Handoff Part B)

```
I have our FMC license number now: [number]. Add it to the site properly — config,
structured data, and llms.txt — then run the tests and show me the output.
```

Same shape for IATA number, business hours, year founded, social profile URLs, or real
testimonials. One fact per request.

### Search Console, Analytics, and Google Business Profile (Handoff Part D6)

```
I want to set up Google Search Console, Google Analytics 4, and Google Business
Profile, following Part D of docs/HANDOFF.md.

Start with Search Console only. Tell me each click. Don't move on until I confirm
it's verified and the sitemap is submitted.
```

> **A heads-up on Bing.** The handoff recommends Bing Webmaster Tools even though it was
> declined earlier in the project, because ChatGPT's search leans heavily on Bing's index.
> If being found in ChatGPT matters to you, do it — it's a ten-minute one-click import from
> Search Console. §C5 of the handoff explains it.

### Building the tracking (Handoff Part D — the biggest piece)

```
Build the analytics tracking described in Part D of docs/HANDOFF.md.

Important, from the handoff:
- The conversion event fires on the /quote/sent page, NOT in the form's submit
  handler (section D2 explains why — getting this wrong breaks every number)
- The privacy policy and its test must be updated in the same commit (guarantee 5)
- No personal data in analytics, ever (guarantee 7)

Show me your plan before writing any code. Then do it test-first, and confirm at
the end that the site still works with JavaScript turned off.
```

### Writing content that AI engines will cite (Handoff Part C)

```
Write the article "How long does customs clearance take at JFK?" following the
writing rules in section C6 of docs/HANDOFF.md.

Every section must open with a sentence that stands alone and could be quoted
without the paragraph around it. Use real timelines and real document names.

Where you need a fact about our specific operation that you can't verify, stop and
ask me instead of guessing.
```

That last paragraph is the important one. Reuse it on every content request.

### Everyday content changes

```
Change our phone number to [new number] everywhere it appears, run the tests, and
show me the output.
```

```
The description on the ocean freight service page is out of date. Here's what it
should say instead: [...]. Update it and show me what changed.
```

### When something looks wrong

```
On my phone, the quote form on the contact page looks broken — the fields overlap.

Reproduce it first and tell me the actual cause before you change anything. Don't
guess at a fix.
```

Insisting on diagnosis before fix is worth the extra minute. A guessed fix that happens to
hide the symptom leaves the real bug in place.

### The review that was never finished

```
The final whole-branch code review was never run before this project was handed to
me — it's noted in section D of the handoff appendix.

Review all the commits on this branch as one piece of work. I'm specifically
worried about problems that span multiple files, since the worst bug found during
the build was exactly that kind.

Also triage the 20 deferred minor issues in the build ledger and tell me which
actually matter.
```

Worth doing before you rely on the site for real leads.

### Your monthly review (once analytics is running)

```
Go through the monthly analysis questions in section D7 of docs/HANDOFF.md using
our current GA4 and Search Console data.

I care most about: which pages produce actual quote requests, and which search
terms we rank 8-20 for. Tell me what to do about what you find.
```

---

## When Claude says it's done

Three questions, every time:

1. **"Show me the test output."** — Not a summary of it. The actual output.
2. **"Does the site still work with JavaScript disabled?"** — This is guarantee 1, and it's
   the whole basis of being found by AI search. It's also easy to break without noticing.
3. **"What did you change, and why?"** — If the explanation doesn't make sense to you, it's
   not necessarily wrong, but it's worth one more question.

---

## Push back when you see these

| What you see | Say this |
|---|---|
| A license number, certification, statistic, or testimonial you never supplied | *"Where did that come from? I never gave you that. Remove it."* |
| "This should work now" with no test run | *"Run the tests and show me."* |
| A fix that makes the symptom disappear without explaining the cause | *"What was actually causing it?"* |
| A big refactor you didn't ask for | *"That's out of scope. Just do the thing I asked."* |
| Content that reads like filler — "in today's fast-paced world" | *"Rewrite it with real facts and specifics. That's the only kind of content AI engines cite."* |
| A claim about your operations you can't personally verify | *"I can't confirm that. Take it out."* |

The first row is the one that matters most. The site was deliberately built so that unknown
facts stay hidden rather than getting filled in with something plausible — if a value appears
that you never supplied, that protection has been bypassed.

---

## Things to be careful about

- **Deploying, DNS, and account creation.** Have Claude guide you; do these yourself. A wrong
  DNS record can take the site and your email down together.
- **`src/config/site.ts`.** One file feeds the whole site. Always run the tests after touching it.
- **The quote form and `src/pages/api/quote.ts`.** This is how leads reach you. After any
  change here, send yourself a real test quote and confirm the email arrives.
- **Anything that adds JavaScript.** Ask directly: *"Does the page still show all its content
  with JavaScript off?"*

---

## If you get lost

```
Read CLAUDE.md and docs/HANDOFF.md, then check the current state of this project
against them. Tell me what's done, what's left, and what you'd suggest doing next.
```

That works in any session, at any point.
