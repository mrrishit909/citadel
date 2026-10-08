# Storyboard

| t (wall-clock s) | Frame | Shared element forward |
|---|---|---|
| 0.0 | Overhead, one glyph in an empty concourse, caption "One person in an empty concourse" | the same crowd instanced mesh, one visible instance |
| 1.8-4.8 | `state.t` animates 0 to 2 (doors-open through peak-ingress): the crowd mesh's visible instance count grows via `densityAt` | the same `Crowd` mesh, same density function used post-intro |
| 5.0-8.4 | `live.rise` animates 0 to 1: the camera rises from ground level to the overhead operational view | the same camera, same lookAt target |
| 8.6-11.6 | `state.t` animates 2 to 6 (through emergency): one gate's signage flips from lime to red, nearby density compresses | the same `Gates` and `Crowd` components |
| 13.2 | Caption: "Follow one person through the crowd" | - |
| 15.0 | Light mask expands, revealing the HUD at the peak-ingress stage | the same `--mask` mechanism as every blueprint in this volume |

**Reduced motion** replaces the above with three static captioned frames (Empty concourse, Emergency, Floor plan).
