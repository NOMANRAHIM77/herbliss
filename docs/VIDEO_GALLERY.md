# Store video gallery

The five owner-supplied MP4 files are stored in the configured MongoDB database using GridFS. The homepage reads their published metadata from `/api/videos` and streams video bytes through `/api/videos/[id]`.

## Storage

- `store_videos`: ordered gallery records, titles, publication flag, file references and poster paths.
- `store_video_files.files` and `store_video_files.chunks`: original MP4 data in GridFS.
- `public/images/videos`: JPEG thumbnails extracted from the supplied files. Include these small files with the application deployment.
- Credentials stay in the existing ignored environment configuration. No upload endpoint is exposed publicly.

The stream route supports HTTP byte ranges, including suffix ranges, for seeking without loading the complete file into server memory. Only published gallery records can be streamed. ImageKit remains the chosen future media provider; these videos currently stream from MongoDB because ImageKit credentials are pending.

## Re-import

From the project directory, run:

```powershell
node --conditions=react-server --import tsx scripts/import-videos.ts 'C:\Users\noman\Downloads'
```

The importer expects the five supplied filenames. Content-derived file identifiers allow completed uploads to be reused on a repeat run. Records use stable identifiers so their ordering remains consistent. Replacing a source video retains the old GridFS file; cleanup is a separate deliberate operation.

Thumbnails were created using `scripts/prepare-video-posters.py`, with the imageio-ffmpeg utility installed in ignored `artifacts/media-tools`. Original clips are unchanged. The thumbnail utility is not needed to run the website.

## Display

Four portrait cards fit on desktop, two on tablet, and a partial next card invites swiping on phones. Videos use their original proportions within the portrait frame. Playback is user-initiated and starts muted. Starting another clip, scrolling a clip away, or hiding the tab pauses playback. Native video controls provide seeking and fullscreen where the browser supports them.

Generic numbered film titles avoid inventing customer identities or endorsements. Replace the database titles and content copy when specific captions are supplied. Captions/transcripts have not been supplied or generated.

The import completed for all five files. No build, test, playback or browser verification was performed, per the owner's instruction.
