# 1DM Browser (Windows portable)

A portable Windows browser and download manager built on Electron (castLabs build, so Widevine works). It is a port of the
Android 1DM+ browser, and it also carries over two features from the Android MLTB indexer app:
a **live RTMP restream** and a **selective torrent downloader**.

No installer: build the single `1DM-Browser-<version>-portable.exe`, put it anywhere and run it. Settings, bookmarks and
history live in a `1DM-Browser-Data` folder next to the exe (or in `%APPDATA%` if that folder is read-only).

## Features

**Browsing**: tabs (pin, mute, duplicate, reopen), incognito, bookmarks and history, reading mode, find in page, zoom,
mobile-site mode, invert colors, per-site permissions, proxy and custom user agent, "clear on exit" options.

**Ad blocking**: EasyList-style network filters (lists are downloaded and cached, `assets/adblocker/builtin.txt` is the
offline fallback), per-site switch, best-effort YouTube ad blocking.

**Downloads**: Chromium downloads plus an accelerated multi-connection downloader (resumable), HLS and DASH downloads
(optionally remuxed to MP4 with the bundled ffmpeg), capture of `blob:` / MediaSource videos, a media detector in the
toolbar and a page grabber.

### Live restream (new)
`Menu → Live restream…` plays one video **live into an RTMP server** (YouTube, Twitch, OK.ru, any `rtmp://` ingest) with the
bundled ffmpeg, the same as `ffmpeg -re -i … -c copy -c:a aac -f flv rtmp://…`.

- **Sources**: a link (direct file or HLS `.m3u8`), a file on your PC, or **one file of a torrent / magnet that is streamed from
  peers while it plays**, so there is no wait for the download to finish (optionally keep the file afterwards).
- Starts from the media popup (**Restream** next to a detected video), from a finished download, from a torrent's file list
  or from the menu. The page's referrer and cookies are sent when the source is a link.
- The video is always copied untouched. **Audio**: The default is to keep the original audio as it is (*copy*). Choose *Auto* to keep AAC but convert anything else (AC3, DTS, Opus, FLAC, MP3) to
  AAC 128k stereo, because RTMP servers only take AAC; or always keep / always convert.
- **Repeat** (`-stream_loop`), live status (position, speed, bitrate), **Stop** button, desktop notification when it ends.
- The stream key is hidden in the UI and in every error message. Address and key can be remembered (stored in
  `settings.json`, in plain text, like any other setting).
- At most **2 streams at once**. Closing the browser stops them.

### Torrents (improved)
- **File picker before downloading**: a magnet link, `.torrent` link, info-hash or `.torrent` file opens the Torrents page
  with the file list. Tick what you want (All / None / Videos only), choose the folder, choose whether to keep seeding.
  Magnet links clicked on a web page ask *Download all / Choose files… / Cancel*.
- Files can still be changed while downloading; **Restream…** button on a torrent or on any video file in it.
- **Stalled torrents are abandoned** after a timeout (default 10 min, magnet metadata at most 5 min) and can be retried.
- **Seeding**: per torrent, with optional goals (stop at an upload ratio and/or after N minutes). Settings → Torrents.
- Powered by **aria2c** (the same engine as the Android app: DHT, trackers, peer exchange, local peer discovery). Windows may ask to allow network access the
  first time.

## Build

The torrent engine is `aria2c.exe`. The CI workflow downloads it into `bin/` and the portable exe carries it. When running from source, run `npm run get-aria2` once (or put `aria2c.exe` in `bin/`, or set `ARIA2C_PATH`).

```
npm install
npm start          # run from source
npm test           # restream through ffmpeg + torrent manager tests
npm run dist       # dist/1DM-Browser-<version>-portable.exe
```

GitHub Actions (`.github/workflows/build-windows.yml`) runs the syntax check, the tests and the build on every push, and
attaches the exe to a release when you push a `v*` tag.

## Layout

| Path | What |
| --- | --- |
| `src/main.js` | main process: tabs, sessions, IPC, menus |
| `src/torrents.js`, `src/bencode.js` | torrent manager (peek, picker, seeding, stall watchdog, local stream server), `.torrent` reader |
| `src/restream.js`, `src/ffmpeg.js` | restream jobs and ffmpeg wrapper |
| `src/downloads.js`, `accel.js`, `hls.js`, `dash.js`, `net.js` | download engines |
| `src/adblock.js`, `youtube-adblock.js` | ad blocking |
| `ui/` | browser chrome (tabs, address bar, menus) |
| `pages/` | internal `onedm://` pages (home, downloads, torrents, restream, settings…) |
| `test/` | tests (`npm test`) |

## Notes and limits
- Restream is real-time (`-re`); your upload bandwidth must cover the video's bitrate. Streaming a torrent also needs peers
  that upload at least that fast.
- `rtmps://` works only if the bundled ffmpeg build has TLS (the usual Windows ffmpeg-static builds do).
- Not ported from the Android app because they belong to its Telegram/cloud workflow: Telegram upload, rclone, RSS, zip /
  rename / unpack after download.
