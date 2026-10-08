"""CITADEL kit: a gate/turnstile prop and a human glyph prop. Deterministic.
Run: Blender -b -P model/build.py   (writes model/source.blend, model/exports/*.glb, model/renders/poster.png)"""
import bpy, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "exports")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.join(HERE, "renders"), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, color, metal=0.0, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m

M = {
    "concrete": mat("Concrete", (0.71, 0.70, 0.66), 0, 0.85),
    "steel": mat("Steel", (0.47, 0.51, 0.55), 0.7, 0.4),
    "lime": mat("SafetyLime", (0.73, 1.0, 0.27), 0, 0.3, (0.73, 1.0, 0.27), 1.6),
    "white": mat("HumanWhite", (0.95, 0.95, 0.92), 0, 0.6),
}

def obj(name, mesh_fn, material, loc=(0, 0, 0), parent=None):
    bpy.ops.object.select_all(action="DESELECT")
    mesh_fn()
    o = bpy.context.active_object
    o.name = name
    o.location = loc
    o.data.materials.append(M[material] if isinstance(material, str) else material)
    if parent:
        o.parent = parent
    return o

def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None)
    scene.collection.objects.link(e)
    e.location = loc
    if parent:
        e.parent = parent
    return e

def smooth(o):
    for p in o.data.polygons: p.use_smooth = True

# --- gate: a turnstile frame plus a signage panel
gate_root = empty("Gate", (0, 0, 0))
for sx in (-0.4, 0.4):
    obj("Post", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.05, depth=1.4), "steel", (sx, 0, 0.7), gate_root)
lintel = obj("Lintel", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "steel", (0, 0, 1.4), gate_root)
lintel.scale = (0.9, 0.08, 0.08)
sign = obj("Signage", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "lime", (0, -0.06, 1.6), gate_root)
sign.scale = (0.5, 0.02, 0.15)

# --- human glyph: a simple capsule figure (head + body)
glyph_root = empty("HumanGlyph", (0, 0, 0))
body = obj("GlyphBody", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.12, depth=0.5), "white", (0, 0, 0.35), glyph_root)
head = obj("GlyphHead", lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.1), "white", (0, 0, 0.68), glyph_root)
smooth(body); smooth(head)

def hide(o):
    o.hide_render = True
    for c in o.children: hide(c)
bpy.ops.object.camera_add(location=(2.2, -2.4, 1.6)); cam_o = bpy.context.active_object
cam_o.name = "PosterCam"; scene.camera = cam_o; cam_o.data.lens = 40
cam_o.rotation_euler = (1.15, 0, 0.62)
for name, loc, e, col in (("Key", (-2, -3, 3), 900, (0.95, 0.95, 0.92)), ("Rim", (3, 2, 2), 700, (0.73, 1.0, 0.27)), ("Fill", (0, -1, -1), 200, (0.09, 0.23, 0.4))):
    bpy.ops.object.light_add(type="POINT", location=loc); l = bpy.context.active_object
    l.name = name; l.data.energy = e; l.data.color = col
world = bpy.data.worlds.new("Night"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.012, 0.015, 0.018, 1)
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x, scene.render.resolution_y = 1280, 720
scene.render.filepath = os.path.join(HERE, "renders", "poster.png")

def export(name, parents):
    bpy.ops.object.select_all(action="DESELECT")
    def pick(o):
        o.select_set(True)
        for c in o.children: pick(c)
    for p in parents: pick(p)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name), export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True, export_cameras=False, export_lights=False)

export("gate.glb", [gate_root])
export("human-glyph.glb", [glyph_root])
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "source.blend"))
try:
    bpy.ops.render.render(write_still=True)
except Exception as e:
    print("poster render failed:", e)
print("BUILD OK")
