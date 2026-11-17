"""Extract thumbnail frames from the supplied videos without changing them."""
from pathlib import Path
import subprocess
import sys

workspace = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(workspace / "artifacts" / "media-tools"))
import imageio_ffmpeg

source = Path(sys.argv[1])
output = workspace / "public" / "images" / "videos"
output.mkdir(parents=True, exist_ok=True)
names = [
    "1fac8aff-1c66-4a31-beda-1eaa40d80c63.mp4",
    "cc51b02f-797b-445c-8ae0-17c7360fb177.mp4",
    "6053ed54-1595-42b9-aea1-a216af7aaddb.mp4",
    "90d683f8-3e72-439c-9406-21b90bb576d8.mp4",
    "VID_20261114_113753_005.mp4",
]
for index, name in enumerate(names, 1):
    subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
        "-y", "-ss", "0", "-i", str(source / name), "-frames:v", "1",
        "-vf", "scale=540:960:force_original_aspect_ratio=decrease",
        "-q:v", "3", str(output / f"herbliss-film-{index:02d}.jpg"),
    ], check=True)
    print(f"Created poster {index} of {len(names)}.", flush=True)
