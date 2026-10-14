# ReelRoom performance and failure handling

## Measured results

`pnpm test:latency` runs an isolated Express/tRPC/Socket.IO listener with volatile room storage. The benchmark never creates room or message records in the managed MySQL database.

| Measurement | Result | Target / interpretation |
| --- | ---: | --- |
| Socket.IO propagation p50 | 1.91 ms | Latest measured run; loopback only |
| Socket.IO propagation p95 | 2.92 ms | 250 ms target passed on this loopback run |
| Maximum propagation sample | 4.30 ms | 1,000 recipient-delivery samples |
| Modeled post-correction absolute drift p95 | 173.8 ms | Ideal clock simulation, not browser media |
| Modeled maximum post-correction absolute drift | 452 ms | 500 ms tolerance passed in simulation |
| Modeled maximum final drift after 12 ticks | 117.45 ms | Ideal linear playback model |

### Conditions and method

- Captured in the project Sandbox on Linux/x64 with Node v22.13.0.
- Ten Socket.IO clients join one isolated local Express HTTP server bound to `127.0.0.1`; the app's production-managed listener is not used for benchmark writes.
- After a 250 ms warm-up, one host sends 100 sequential seek controls. Each action is timed from emission until all ten clients receive its accepted room update: 1,000 delivery samples total. Percentiles use the nearest-rank sample.
- The harness also exercises 12 concurrent controls and checks the final monotonic room revision, disconnect/reconnect snapshot reconciliation, a late-join snapshot, delivery/acknowledgement of an action sent after reconnect reconciliation, and retrying one chat action with the same ID (one message is observed by every client).
- Drift simulation evaluates 161 initial offsets from −2,000 ms to +2,000 ms in 25 ms steps, over 12 correction ticks at 1.2-second intervals. It applies the implemented policy to ideal linear-playback clocks: no correction at ≤120 ms, bounded playback-rate correction from >120 through 500 ms, and a hard seek above 500 ms.

**Limitations:** loopback is not a separate-device Wi-Fi/LAN measurement. Therefore this run does **not** establish the ≤250 ms p95 requirement on a real multi-device local network. The drift result is deterministic model evidence, not measured video-element drift under real decoding, buffering, codec, or source/network jitter. No multi-instance deployment was tested. The benchmark is a reproducible baseline, not a broad performance guarantee.

## Failure and recovery behavior

| Condition | Behavior |
| --- | --- |
| Late join or reconnect | The server rejoins the participant and sends an authoritative room snapshot; the client reconciles before continuing. Up to 100 unacknowledged room actions are buffered in the mounted room, then replayed with the same idempotency ID only after that authoritative snapshot; the queue expires after four minutes and shows a warning rather than silently replaying stale intent. Clock-offset samples are refreshed on join and every 8 seconds. |
| Lost socket | Socket.IO reconnects with a 400 ms starting delay, exponential backoff capped at 5 seconds, WebSocket first and polling fallback. Server ping interval/timeout are 6/12 seconds. The UI reports reconnecting and then resumes from the latest snapshot. |
| Concurrent or retried room actions | Per-room state mutations are serialized. Room snapshot revisions advance monotonically for control, membership, chat, playlist, and poll updates; clients ignore older revisions. UUID action IDs deduplicate accepted mutations for five minutes; reactions are deduplicated for 60 seconds. |
| Playback authority and identity | Only the current host can change the shared source or play/pause/seek. Every anonymous browser proves possession of a random 256-bit session token on joins/reconnects; the server stores only its SHA-256 hash, not the token. A public participant ID in the room snapshot is not sufficient to claim that identity. Host transfer anchors the current playhead so ownership changes do not rewind playback. Clearing the browser's local storage loses that session identity; users can rejoin as a new attendee, but cannot reclaim the old host identity without its original token. |
| Drift | Clients check about every 1.2 seconds against the estimated server clock. Drift over 500 ms is corrected with a seek; moderate drift uses a bounded temporary rate change; small jitter is left alone. Browser buffering and autoplay restrictions can still interrupt actual media playback. |
| Invalid or oversized input | Display names are capped at 32 characters, chat at 320, poll choices at four (80 characters each), and a direct source URL at 500 characters. Playlist entries are deduplicated per room. Non-HTTPS or non-direct `.mp4`, `.webm`, or `.ogg` video URLs are rejected. |
| Full room | Admission is capped at 50 participants, with a clear rejection; the automated tests include at least 10 participants. |
| Database unavailable | Room operations do not silently fall back to volatile production state. Room creation and room actions return user-safe service/reconnect errors rather than database details; accepted durable data remains in MySQL. Only the explicit isolated benchmark/test mode uses in-memory room state. |
| Video source unavailable | Discovery entries are curated film metadata and poster artwork, not hosted films or streaming rights. The host must provide a browser-accessible direct HTTPS video file; DRM services, arbitrary streaming pages, and unsupported codecs are not converted into playable sources. |
| YouTube or catalog full-film source unavailable | YouTube watch/short links are canonicalized into the official IFrame Player; viewers may need to tap to enable playback, and embed restrictions, sign-in, regional blocks, buffering, or provider outages can prevent viewing. The catalog records an optional preverified official/public-domain full-film URL and its source evidence and rights/jurisdiction note. An absent URL means no qualifying source was verified; it does not make metadata a film stream. The host may replace the current source with a supported YouTube link or direct HTTPS MP4/WebM/Ogg URL. |
| Horizontal scaling | The current Socket.IO room fan-out is process-local. Use a shared Socket.IO adapter/pub-sub layer before running multiple app instances; cross-instance delivery is not claimed. |

## Persistence and run commands

The additive migrations create the room, participant, chat, playlist, poll, and vote tables, add a playback-specific millisecond timestamp so presence/host updates cannot reset or round the media clock, add a hash-only participant session token, and create the movie plus normalized movie-genre catalog tables. A later additive migration adds optional catalog playback URLs with source-type, evidence-page, and rights-note fields. The migrations were applied and the schema verified in the project-managed database; eight curated movie records are seeded at the time of this report. Benchmark room/message writes use only isolated volatile storage.

```bash
pnpm check
pnpm test
pnpm test:latency
pnpm build
```
