# Motion bible

## Easing and durations
- Camera: exponential smoothing (`1 - exp(-dt * 2.4)`).
- Intro: `power1.inOut` for most beats, linear for the crowd-count ramp (reads as a steady arrival rate rather than an eased animation).

## Camera rules
- The intro's rise and the post-intro overhead view share the same vertical axis and look-at target (the concourse center), so skipping the intro never produces a visibly different camera model.

## Scroll mapping
- Wheel over the stage steps one event-timeline stage per gesture (rate-limited 700ms).
- The Timeline slider in the panel is the one continuous drag surface.

## Reduced-motion equivalents
- Intro: three static captioned frames.
- Post-intro: camera lerp becomes an instant snap; crowd instance scaling (appearing/thinning) is a function of `state.t`, not continuous real time, so it stays motion-safe under `pauseMotion` by construction.

## Purpose audit
Every animated value maps to the event timeline (gate flow, density, closed state) or direct interaction feedback. No decorative-only animation exists.
