# Asset manifest

Every external file in STROLLY, where it came from and under which licence.
All of them are from **Poly Haven** (https://polyhaven.com), published under
**CC0 1.0** (public domain dedication): free for any use including
commercial, no attribution required — credit is given here anyway. The licence
was checked at the source (https://polyhaven.com/license) on 11 October 2026.

No paid, ambiguous-licence, branded or AI-generated assets are used. Human
figures, screens, the city, the sky, the Earth and the black hole are made in
code (`src/three/**`); no CC0 human models match the realistic rig.

## Pipeline

1. Download (1k glTF / 1k JPG maps / 1k HDR) from `api.polyhaven.com`,
   checking each file's MD5.
2. `python scripts/optimize-assets.py <raw dir>` →
   - models: glTF → GLB with `@gltf-transform/cli optimize` (Meshopt
     geometry, textures ≤ 1024 px WebP, node hierarchy kept, simplify error
     0.0002); decoded in the browser by three's `MeshoptDecoder`;
   - surface sets: albedo, OpenGL normal and AO/roughness/metal packed map →
     1024 px WebP;
   - HDRIs: 1k Radiance .hdr, unchanged;
   - panorama: the tonemapped 8k JPEG → 4096 × 2048 JPEG.
3. Loaded at run time by `src/three/kit/assets.ts` (models, HDRIs,
   panorama) and `src/three/kit/surfaces.ts` (surface sets), each once per
   visit, with the procedural version as the fallback if a file fails.

## Models (`public/assets/models`, GLB)

| Asset | Poly Haven id | Creator(s) | Source | Licence | Commercial use | File | Size | Modifications | Used in | Optimized |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cash Register 01 | CashRegister_01 | Joe Seabuhr | https://polyhaven.com/a/CashRegister_01 | CC0 1.0 | yes | models/CashRegister_01.glb | 368 KB | GLB, Meshopt, WebP textures ≤ 1024 px | YAŞAMAK | yes |
| Coffee Cart 01 | CoffeeCart_01 | Joe Seabuhr | https://polyhaven.com/a/CoffeeCart_01 | CC0 1.0 | yes | models/CoffeeCart_01.glb | 607 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖFKESEL DENEYİM SİMÜLASYONU | yes |
| School Chair 01 | SchoolChair_01 | Ethan Place | https://polyhaven.com/a/SchoolChair_01 | CC0 1.0 | yes | models/SchoolChair_01.glb | 206 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEK AYAK | yes |
| School Desk 01 | SchoolDesk_01 | Ethan Place | https://polyhaven.com/a/SchoolDesk_01 | CC0 1.0 | yes | models/SchoolDesk_01.glb | 127 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEK AYAK | yes |
| Wet Floor Sign 01 | WetFloorSign_01 | Fran Calvente | https://polyhaven.com/a/WetFloorSign_01 | CC0 1.0 | yes | models/WetFloorSign_01.glb | 103 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖFKESEL DENEYİM SİMÜLASYONU | yes |
| Binder Notebook | binder_notebook | DaDrood | https://polyhaven.com/a/binder_notebook | CC0 1.0 | yes | models/binder_notebook.glb | 234 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEK AYAK | yes |
| Boulder 01 | boulder_01 | Rico Cilliers | https://polyhaven.com/a/boulder_01 | CC0 1.0 | yes | models/boulder_01.glb | 1310 KB | GLB, Meshopt, WebP textures ≤ 1024 px | PARALEL-LEŞ | yes |
| Cardboard Box 01 | cardboard_box_01 | Rahul Chaudhary | https://polyhaven.com/a/cardboard_box_01 | CC0 1.0 | yes | models/cardboard_box_01.glb | 301 KB | GLB, Meshopt, WebP textures ≤ 1024 px | DURUM | yes |
| Classic Laptop | classic_laptop | Arrangemonk | https://polyhaven.com/a/classic_laptop | CC0 1.0 | yes | models/classic_laptop.glb | 331 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖFKESEL DENEYİM SİMÜLASYONU | yes |
| Clipboard | clipboard | ProgrammerOnCoffee | https://polyhaven.com/a/clipboard | CC0 1.0 | yes | models/clipboard.glb | 163 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖTE | yes |
| Dead Tree Trunk | dead_tree_trunk | Rob Tuytel | https://polyhaven.com/a/dead_tree_trunk | CC0 1.0 | yes | models/dead_tree_trunk.glb | 653 KB | GLB, Meshopt, WebP textures ≤ 1024 px | PARALEL-LEŞ | yes |
| Desk Lamp Arm 01 | desk_lamp_arm_01 | Yann Kervran, Kuutti Siitonen | https://polyhaven.com/a/desk_lamp_arm_01 | CC0 1.0 | yes | models/desk_lamp_arm_01.glb | 470 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEKERRÜR | yes |
| Exterior Aircon Unit | exterior_aircon_unit | Monsta3D | https://polyhaven.com/a/exterior_aircon_unit | CC0 1.0 | yes | models/exterior_aircon_unit.glb | 1247 KB | GLB, Meshopt, WebP textures ≤ 1024 px | PARALEL-LEŞ | yes |
| Fern 02 | fern_02 | Rob Tuytel, Rico Cilliers | https://polyhaven.com/a/fern_02 | CC0 1.0 | yes | models/fern_02.glb | 184 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEKERRÜR | yes |
| Fire Hydrant | fire_hydrant | Gonçalo Felício | https://polyhaven.com/a/fire_hydrant | CC0 1.0 | yes | models/fire_hydrant.glb | 739 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Gamepad | gamepad | Josh Dean | https://polyhaven.com/a/gamepad | CC0 1.0 | yes | models/gamepad.glb | 154 KB | GLB, Meshopt, WebP textures ≤ 1024 px | YAŞAMAK | yes |
| Industrial Microscope | industrial_microscope | Lukas Walzer | https://polyhaven.com/a/industrial_microscope | CC0 1.0 | yes | models/industrial_microscope.glb | 417 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Lifebuoy | lifebuoy | Hank Kaamura | https://polyhaven.com/a/lifebuoy | CC0 1.0 | yes | models/lifebuoy.glb | 488 KB | GLB, Meshopt, WebP textures ≤ 1024 px | PARALEL-LEŞ | yes |
| Magnifying Glass 01 | magnifying_glass_01 | Nazar Borodavka | https://polyhaven.com/a/magnifying_glass_01 | CC0 1.0 | yes | models/magnifying_glass_01.glb | 112 KB | GLB, Meshopt, WebP textures ≤ 1024 px | DURUM | yes |
| Medical Box | medical_box | Ulan Cabanilla | https://polyhaven.com/a/medical_box | CC0 1.0 | yes | models/medical_box.glb | 275 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖFKESEL DENEYİM SİMÜLASYONU | yes |
| Metal Office Desk | metal_office_desk | Ulan Cabanilla | https://polyhaven.com/a/metal_office_desk | CC0 1.0 | yes | models/metal_office_desk.glb | 182 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖTE | yes |
| Metal Trash Can | metal_trash_can | GurJas Studios | https://polyhaven.com/a/metal_trash_can | CC0 1.0 | yes | models/metal_trash_can.glb | 846 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEK AYAK | yes |
| Modern Arm Chair 01 | modern_arm_chair_01 | Vibrant Nordic | https://polyhaven.com/a/modern_arm_chair_01 | CC0 1.0 | yes | models/modern_arm_chair_01.glb | 301 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖTE | yes |
| Modular Airduct Rectangular 01 | modular_airduct_rectangular_01 | James Ray Cock | https://polyhaven.com/a/modular_airduct_rectangular_01 | CC0 1.0 | yes | models/modular_airduct_rectangular_01.glb | 777 KB | GLB, Meshopt, WebP textures ≤ 1024 px | PARALEL-LEŞ | yes |
| Modular Street Seating | modular_street_seating | Stuart Attenborrow | https://polyhaven.com/a/modular_street_seating | CC0 1.0 | yes | models/modular_street_seating.glb | 913 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Mounted Fluorescent Lights | mounted_fluorescent_lights | Ulan Cabanilla | https://polyhaven.com/a/mounted_fluorescent_lights | CC0 1.0 | yes | models/mounted_fluorescent_lights.glb | 227 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖFKESEL DENEYİM SİMÜLASYONU | yes |
| Office Notepads | office_notepads | Ulan Cabanilla | https://polyhaven.com/a/office_notepads | CC0 1.0 | yes | models/office_notepads.glb | 82 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖFKESEL DENEYİM SİMÜLASYONU | yes |
| Old Bed Frame | old_bed_frame | Luca B | https://polyhaven.com/a/old_bed_frame | CC0 1.0 | yes | models/old_bed_frame.glb | 608 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Painted Wooden Cabinet | painted_wooden_cabinet | Kirill Sannikov | https://polyhaven.com/a/painted_wooden_cabinet | CC0 1.0 | yes | models/painted_wooden_cabinet.glb | 231 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Painted Wooden Chair 01 | painted_wooden_chair_01 | Kuutti Siitonen | https://polyhaven.com/a/painted_wooden_chair_01 | CC0 1.0 | yes | models/painted_wooden_chair_01.glb | 196 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Painted Wooden Table | painted_wooden_table | Kirill Sannikov | https://polyhaven.com/a/painted_wooden_table | CC0 1.0 | yes | models/painted_wooden_table.glb | 141 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Planter Box 01 | planter_box_01 | James Ray Cock | https://polyhaven.com/a/planter_box_01 | CC0 1.0 | yes | models/planter_box_01.glb | 338 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Plastic Broom | plastic_broom | L | https://polyhaven.com/a/plastic_broom | CC0 1.0 | yes | models/plastic_broom.glb | 220 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Pot Enamel 01 | pot_enamel_01 | Kuutti Siitonen | https://polyhaven.com/a/pot_enamel_01 | CC0 1.0 | yes | models/pot_enamel_01.glb | 191 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Potted Plant 01 | potted_plant_01 | Rico Cilliers | https://polyhaven.com/a/potted_plant_01 | CC0 1.0 | yes | models/potted_plant_01.glb | 1477 KB | GLB, Meshopt, WebP textures ≤ 1024 px | YAŞAMAK | yes |
| Rock Face 01 | rock_face_01 | Dario Barresi | https://polyhaven.com/a/rock_face_01 | CC0 1.0 | yes | models/rock_face_01.glb | 625 KB | GLB, Meshopt, WebP textures ≤ 1024 px | PARALEL-LEŞ | yes |
| Round Spectacles | round_spectacles | Sean Buckley | https://polyhaven.com/a/round_spectacles | CC0 1.0 | yes | models/round_spectacles.glb | 262 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖTE | yes |
| Security Camera 01 | security_camera_01 | Alexander Otterbeck, Yann Kervran | https://polyhaven.com/a/security_camera_01 | CC0 1.0 | yes | models/security_camera_01.glb | 207 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖFKESEL DENEYİM SİMÜLASYONU | yes |
| Security Camera 02 | security_camera_02 | Garrison Gager, Yann Kervran | https://polyhaven.com/a/security_camera_02 | CC0 1.0 | yes | models/security_camera_02.glb | 214 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Sofa 02 | sofa_02 | Kirill Sannikov | https://polyhaven.com/a/sofa_02 | CC0 1.0 | yes | models/sofa_02.glb | 166 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Standing Chalkboard 01 | standing_chalkboard_01 | ParzivalCG | https://polyhaven.com/a/standing_chalkboard_01 | CC0 1.0 | yes | models/standing_chalkboard_01.glb | 240 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEK AYAK | yes |
| Steel Frame Shelves 01 | steel_frame_shelves_01 | James Ray Cock | https://polyhaven.com/a/steel_frame_shelves_01 | CC0 1.0 | yes | models/steel_frame_shelves_01.glb | 170 KB | GLB, Meshopt, WebP textures ≤ 1024 px | DURUM | yes |
| Street Lamp 01 | street_lamp_01 | Josh Dean | https://polyhaven.com/a/street_lamp_01 | CC0 1.0 | yes | models/street_lamp_01.glb | 237 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Street Lamp 02 | street_lamp_02 | Josh Dean | https://polyhaven.com/a/street_lamp_02 | CC0 1.0 | yes | models/street_lamp_02.glb | 250 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Tea Set 01 | tea_set_01 | James Ray Cock, Rico Cilliers, Jurita Burger | https://polyhaven.com/a/tea_set_01 | CC0 1.0 | yes | models/tea_set_01.glb | 351 KB | GLB, Meshopt, WebP textures ≤ 1024 px | YAŞAMAK | yes |
| Television 02 | television_02 | Benny Weimer | https://polyhaven.com/a/television_02 | CC0 1.0 | yes | models/television_02.glb | 146 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Vintage Electric Kettle | vintage_electric_kettle | SV Garip | https://polyhaven.com/a/vintage_electric_kettle | CC0 1.0 | yes | models/vintage_electric_kettle.glb | 416 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |
| Vintage Spacecraft Instrument | vintage_spacecraft_instrument | Michał Wiśniewski | https://polyhaven.com/a/vintage_spacecraft_instrument | CC0 1.0 | yes | models/vintage_spacecraft_instrument.glb | 393 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖTE | yes |
| Vintage Stapler | vintage_stapler | Mateusz Sadek | https://polyhaven.com/a/vintage_stapler | CC0 1.0 | yes | models/vintage_stapler.glb | 324 KB | GLB, Meshopt, WebP textures ≤ 1024 px | DURUM | yes |
| Vintage Suitcase | vintage_suitcase | Maximilian Schuster | https://polyhaven.com/a/vintage_suitcase | CC0 1.0 | yes | models/vintage_suitcase.glb | 491 KB | GLB, Meshopt, WebP textures ≤ 1024 px | ÖTE | yes |
| Wall Clock | wall_clock | PierreB3D | https://polyhaven.com/a/wall_clock | CC0 1.0 | yes | models/wall_clock.glb | 176 KB | GLB, Meshopt, WebP textures ≤ 1024 px | YAŞAMAK | yes |
| Watering Can Metal 01 | watering_can_metal_01 | Charles Nderitu | https://polyhaven.com/a/watering_can_metal_01 | CC0 1.0 | yes | models/watering_can_metal_01.glb | 450 KB | GLB, Meshopt, WebP textures ≤ 1024 px | BEYİN-KÖKÜ | yes |
| Wheelchair 01 | wheelchair_01 | Garreth Dean | https://polyhaven.com/a/wheelchair_01 | CC0 1.0 | yes | models/wheelchair_01.glb | 493 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TEK AYAK | yes |
| Wicker Basket 01 | wicker_basket_01 | Kuutti Siitonen | https://polyhaven.com/a/wicker_basket_01 | CC0 1.0 | yes | models/wicker_basket_01.glb | 460 KB | GLB, Meshopt, WebP textures ≤ 1024 px | TAKINTI | yes |

## Surface sets (`public/assets/textures/<id>/{diff,nor,arm}.webp`)

Used by `pbr(kind, color)` for every story (the story's colour tints the
scan's light and dark; see `src/three/kit/surfaces.ts`).

| Asset | Poly Haven id | Creator(s) | Source | Licence | Commercial use | Surface kind | Size | Modifications | Optimized |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Asphalt 02 | asphalt_02 | Rob Tuytel | https://polyhaven.com/a/asphalt_02 | CC0 1.0 | yes | asphalt | 373 KB + 481 KB + 267 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Brick Wall 02 | brick_wall_02 | Dimitrios Savva | https://polyhaven.com/a/brick_wall_02 | CC0 1.0 | yes | brick | 255 KB + 412 KB + 142 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Brown Leather | brown_leather | Rob Tuytel | https://polyhaven.com/a/brown_leather | CC0 1.0 | yes | leather | 149 KB + 315 KB + 401 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Brown Planks 04 | brown_planks_04 | Rob Tuytel | https://polyhaven.com/a/brown_planks_04 | CC0 1.0 | yes | planks | 115 KB + 283 KB + 16 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Coast Sand 01 | coast_sand_01 | Rob Tuytel | https://polyhaven.com/a/coast_sand_01 | CC0 1.0 | yes | sand | 260 KB + 434 KB + 62 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Concrete Floor 02 | concrete_floor_02 | Rob Tuytel | https://polyhaven.com/a/concrete_floor_02 | CC0 1.0 | yes | concrete | 379 KB + 197 KB + 72 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Concrete Pavement | concrete_pavement | Charlotte Baglioni | https://polyhaven.com/a/concrete_pavement | CC0 1.0 | yes | paving | 233 KB + 481 KB + 109 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Denim Fabric | denim_fabric | Rob Tuytel | https://polyhaven.com/a/denim_fabric | CC0 1.0 | yes | denim | 399 KB + 145 KB + 159 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Dirty Carpet | dirty_carpet | Rohit Seervi | https://polyhaven.com/a/dirty_carpet | CC0 1.0 | yes | carpet | 288 KB + 393 KB + 287 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Gravel Floor | gravel_floor | Jenelle van Heerden, Matterfield | https://polyhaven.com/a/gravel_floor | CC0 1.0 | yes | gravel | 418 KB + 624 KB + 263 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Interior Tiles | interior_tiles | Charlotte Baglioni | https://polyhaven.com/a/interior_tiles | CC0 1.0 | yes | tile | 87 KB + 27 KB + 31 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Knitted Fleece | knitted_fleece | colormass, Rico Cilliers | https://polyhaven.com/a/knitted_fleece | CC0 1.0 | yes | knit | 259 KB + 447 KB + 371 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Laminate Floor 02 | laminate_floor_02 | Dario Barresi, Charlotte Baglioni | https://polyhaven.com/a/laminate_floor_02 | CC0 1.0 | yes | laminate | 134 KB + 70 KB + 52 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Metal Plate | metal_plate | Rob Tuytel | https://polyhaven.com/a/metal_plate | CC0 1.0 | yes | metal | 88 KB + 177 KB + 220 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Oak Veneer 01 | oak_veneer_01 | Jenelle van Heerden | https://polyhaven.com/a/oak_veneer_01 | CC0 1.0 | yes | wood | 86 KB + 50 KB + 230 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Plastered Wall 02 | plastered_wall_02 | Charlotte Baglioni | https://polyhaven.com/a/plastered_wall_02 | CC0 1.0 | yes | plaster | 12 KB + 321 KB + 24 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Rock Face 03 | rock_face_03 | Dario Barresi, Rico Cilliers | https://polyhaven.com/a/rock_face_03 | CC0 1.0 | yes | rock | 208 KB + 412 KB + 113 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Rough Linen | rough_linen | colormass, Rico Cilliers | https://polyhaven.com/a/rough_linen | CC0 1.0 | yes | fabric | 200 KB + 336 KB + 376 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| White Stucco | white_stucco | Amal Kumar | https://polyhaven.com/a/white_stucco | CC0 1.0 | yes | painted | 49 KB + 327 KB + 11 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |
| Worn Tile Floor | worn_tile_floor | Dimitrios Savva | https://polyhaven.com/a/worn_tile_floor | CC0 1.0 | yes | tileWorn | 197 KB + 63 KB + 178 KB | 1k JPG → 1024 px WebP; albedo turned into a near-white detail map at load | yes |

## HDRIs (`public/assets/hdri`, Radiance .hdr, 1k)

| Asset | Poly Haven id | Creator(s) | Source | Licence | Commercial use | File | Size | Use | Optimized |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Abandoned Tiled Room | abandoned_tiled_room | Sergej Majboroda | https://polyhaven.com/a/abandoned_tiled_room | CC0 1.0 | yes | hdri/abandoned_tiled_room.hdr | 1750 KB | night interiors (image-based light) | 1k (smallest published) |
| Belfast Sunset (Pure Sky) | belfast_sunset_puresky | Greg Zaal, Dimitrios Savva, Jarod Guest | https://polyhaven.com/a/belfast_sunset_puresky | CC0 1.0 | yes | hdri/belfast_sunset_puresky.hdr | 1162 KB | sunset exteriors (light and sky) | 1k (smallest published) |
| Brown Photostudio 02 | brown_photostudio_02 | Sergej Majboroda | https://polyhaven.com/a/brown_photostudio_02 | CC0 1.0 | yes | hdri/brown_photostudio_02.hdr | 1610 KB | warm interiors (image-based light) | 1k (smallest published) |
| Hospital Room 2 | hospital_room_2 | Dimitrios Savva, Jarod Guest | https://polyhaven.com/a/hospital_room_2 | CC0 1.0 | yes | hdri/hospital_room_2.hdr | 1572 KB | clinical interiors (image-based light) | 1k (smallest published) |
| Kloofendal 48d Partly Cloudy (Pure Sky) | kloofendal_48d_partly_cloudy_puresky | Greg Zaal, Jarod Guest | https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky | CC0 1.0 | yes | hdri/kloofendal_48d_partly_cloudy_puresky.hdr | 1401 KB | daylight exteriors (light and sky) | 1k (smallest published) |
| Moonless Golf | moonless_golf | Greg Zaal | https://polyhaven.com/a/moonless_golf | CC0 1.0 | yes | hdri/moonless_golf.hdr | 1634 KB | night exteriors (light) | 1k (smallest published) |
| Xanderklinge | xanderklinge | Andreas Mischok | https://polyhaven.com/a/xanderklinge | CC0 1.0 | yes | hdri/xanderklinge.hdr | 1822 KB | TEKERRÜR: light for the forest room; its tonemapped photograph is the forest on the screen walls | 1k (smallest published) |

## Panorama (`public/assets/panorama`)

| Asset | Creator(s) | Source | Licence | Commercial use | File | Size | Modifications | Used in |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Xanderklinge (tonemapped JPEG) | Andreas Mischok | https://polyhaven.com/a/xanderklinge | CC0 1.0 | yes | panorama/xanderklinge_4k.jpg | 2405 KB | 8k → 4096 × 2048, JPEG q86 | TEKERRÜR (the forest on the room's screen walls) |

## Fonts and sound

Fonts and their licences are listed in `CREDITS.md`. All sound is
synthesized in code (`src/lib/audio`, `src/stories/*/audio.ts`); no audio
files are used.
