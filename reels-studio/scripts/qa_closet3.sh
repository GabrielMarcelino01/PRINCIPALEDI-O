#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 scripts/validate_closet3.py
python3 ../skills/captions/scripts/caption_qa.py closet-3-captions.srt \
  --video out/closet-3-final.mp4 --max-cps 22 --max-lines 2 --strict \
  --output reports/closet-3-caption-qa.json
python3 ../skills/video-quality/scripts/video_qa.py out/closet-3-final.mp4 \
  --expected-width 1080 --expected-height 1920 --min-fps 30 \
  --target-loudness -14 --loudness-tolerance 0.5 --max-true-peak -1 --strict \
  --output reports/closet-3-video-qa.json \
  --contact-sheet out/closet-3-contact-qa.jpg
