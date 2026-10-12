"""Turns the downloaded Poly Haven (CC0) sources into the web assets in public/assets.

    python scripts/optimize-assets.py <raw dir>

<raw dir> holds what the download step fetched (models/<id>/<id>.gltf with its
textures and .bin, textures/<id>/{diff,nor,arm}.jpg, hdri/<id>_1k.hdr and the
forest panorama). See ASSET_MANIFEST.md for the list and the licences.

- Models → GLB, textures ≤ 1024 px WebP, Meshopt geometry (decoded in the
  browser by three's MeshoptDecoder). The node hierarchy is kept so parts stay
  addressable.
- Surface sets → 1024 px WebP (albedo, OpenGL normal, AO/roughness/metal).
- HDRIs → copied as 1k Radiance .hdr (image-based lighting).
- The forest panorama → 4096 × 2048 JPEG for TEKERRÜR's screen walls.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

RAW = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'public' / 'assets'
report = {}

for d in sorted((RAW / 'models').iterdir()):
    src = d / f'{d.name}.gltf'
    dst = OUT / 'models' / f'{d.name}.glb'
    dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists():
        cmd = ['npx', '--yes', '@gltf-transform/cli', 'optimize', str(src), str(dst),
               '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024',
               '--flatten', 'false', '--join', 'false', '--palette', 'false', '--simplify-error', '0.0002']
        subprocess.run(cmd, check=True, shell=sys.platform == 'win32', stdout=subprocess.DEVNULL)
    report[f'models/{dst.name}'] = dst.stat().st_size

QUALITY = {'diff': 82, 'nor': 90, 'arm': 85}
for d in sorted((RAW / 'textures').iterdir()):
    for name, q in QUALITY.items():
        src = d / f'{name}.jpg'
        if not src.exists():
            continue
        dst = OUT / 'textures' / d.name / f'{name}.webp'
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists():
            im = Image.open(src).convert('RGB')
            if max(im.size) > 1024:
                im = im.resize((1024, 1024), Image.LANCZOS)
            im.save(dst, 'WEBP', quality=q, method=6)
        report[f'textures/{d.name}/{dst.name}'] = dst.stat().st_size

for src in sorted((RAW / 'hdri').glob('*_1k.hdr')):
    dst = OUT / 'hdri' / src.name.replace('_1k', '')
    dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists():
        shutil.copyfile(src, dst)
    report[f'hdri/{dst.name}'] = dst.stat().st_size

pano = RAW / 'hdri' / 'xanderklinge_tonemapped.jpg'
if pano.exists():
    dst = OUT / 'panorama' / 'xanderklinge_4k.jpg'
    dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists():
        Image.MAX_IMAGE_PIXELS = None
        Image.open(pano).convert('RGB').resize((4096, 2048), Image.LANCZOS).save(dst, 'JPEG', quality=86, optimize=True, progressive=True)
    report[f'panorama/{dst.name}'] = dst.stat().st_size

(OUT / 'sizes.json').write_text(json.dumps(report, indent=1))
total = sum(report.values())
print(f'{len(report)} files, {total / 1e6:.1f} MB in {OUT}')
