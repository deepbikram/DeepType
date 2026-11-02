# DeepType DMG settings: Steam-style drag-and-drop installer.
# Built headless with dmgbuild (no Finder session needed).
import os

volume_name = "DeepType"
format = "UDZO"
compression_level = 9

# ponytail: fixed 640x420 canvas shared with scripts/dmg-background.swift;
# icon slots in the background sit at these coordinates.
window_rect = ((200, 140), (640, 420))
icon_size = 128
text_size = 13
background = os.path.join(os.environ["DMG_STAGING"], ".background", "background.tiff")

files = [
    os.path.join(os.environ["DMG_STAGING"], "DeepType.app"),
]
# ponytail: symlink via setting, not files — ditto would dereference it
# and copy all of /Applications into the image.
symlinks = {
    "Applications": "/Applications",
}

icon_locations = {
    "DeepType.app": (160, 170),
    "Applications": (480, 170),
}
