# UX laws applied to GlowMax

| Law | Where it shows up |
|---|---|
| Hick's law (fewer choices = faster decisions) | Today shows up to 3 actions. Plan filters are opt-in. The tab bar has 5 items. Known debt: the "Style & body" setup step still has 7 required questions. |
| Fitts's law (big, close targets are easier to hit) | The Check-in button is raised in the thumb zone. Every small control has an invisible 44 px hit area (`.hit`). Primary buttons are full-width on mobile. |
| Jakob's law (people expect your app to work like the apps they already use) | Home far left, create in the middle, profile far right, settings inside the profile, edge-swipe back (see `NAVIGATION.md`). |
| Law of proximity (things placed close together read as related) | Each recommendation's chips, steps and feedback sit inside one card. Price and renewal terms sit next to the button they describe. |
| Miller's law (people can hold only a few items in mind at once) | Plans are chunked into Today / This week / This month / Later. The top 3 come first. |
| Doherty threshold (respond in under 400 ms so people stay engaged) | Every tap answers in under 120 ms (press state), and XP lands within 600 ms. Pages after the landing page load on demand. |
| Von Restorff effect (the item that looks different gets noticed) | One solid primary button per screen. The ivory Check-in button is the only filled tab. |
| Serial position effect (people remember the first and last items best) | The most important items sit first and last: Today first, You last. On the landing page the hero states the offer and the final section repeats the call to action. |
| Peak-end rule (people judge an experience by its best moment and its ending) | Day complete, Level up and Check-in saved are designed endings. The session ends on a win, never on an error. |
| Zeigarnik effect (unfinished tasks stick in the mind) | Progress rings, "0/9 today" and the 90-day dial keep unfinished work visible without nagging. |
| Law of Prägnanz (people read complex shapes as the simplest form) | One motif, the ring, for loading, progress, levels and the journey. |
| Law of similarity (things that look alike are read as related) | Each area keeps one colour and one sign everywhere. |
| Uniform connectedness (visually connected items are read as a group) | Rows are separated by rules; related controls share one surface. |
| Tesler's law (some complexity can't be removed, only moved) | The engine takes on the complexity (cut, routine, budget) so the user answers plain questions. |
| Postel's law (accept varied input, give consistent output) | Any photo is accepted (it's downscaled on device). Unsure answers ("Not sure") are allowed. |
| Parkinson's law (a task expands to fill the time it's given) | Every setup step states its time ("about 1 min"). |
| Goal-gradient effect (people speed up as they near a goal) | The photo step opens with "Your answers, your plan" and "One photo left". |
