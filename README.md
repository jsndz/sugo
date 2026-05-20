# Project: Floorplan → Structured SVG Platform

Goal:
Upload colored floorplans and generate optimized editable SVGs.

Tech stack:

* Frontend: React + TypeScript
* Backend: FastAPI
* CV: OpenCV
* Vectorization: VTracer
* Geometry: Shapely
* SVG optimization: SVGO

Architecture:

```text id="k2mjlwm"
React Frontend
    ↓
FastAPI Backend
    ↓
Image Processing Pipeline
    ├── preprocess
    ├── segmentation
    ├── wall detection
    ├── vectorization
    ├── svg cleanup
    └── svg export
```

Backend structure:

```text id="gb48m7"
/backend
│
├── app/
│   ├── main.py
│   ├── routes/
│   │   ├── upload.py
│   │   ├── process.py
│   │   └── svg.py
│   │
│   ├── services/
│   │   ├── preprocess.py
│   │   ├── segment.py
│   │   ├── walls.py
│   │   ├── vectorize.py
│   │   ├── optimize_svg.py
│   │   └── export_svg.py
│   │
│   ├── models/
│   ├── utils/
│   └── config.py
│
├── uploads/
├── outputs/
└── requirements.txt
```

Frontend structure:

```text id="5u9q0d"
/frontend
│
├── src/
│   ├── pages/
│   │   ├── UploadPage.tsx
│   │   └── EditorPage.tsx
│   │
│   ├── components/
│   │   ├── UploadBox.tsx
│   │   ├── SvgViewer.tsx
│   │   ├── Toolbar.tsx
│   │   ├── LayerPanel.tsx
│   │   └── ProcessingStatus.tsx
│   │
│   ├── api/
│   └── hooks/
```

Backend API:

```text id="x81r3f"
POST /upload
POST /process
GET  /svg/{id}
GET  /status/{id}
```

Pipeline details:

1. preprocess.py
   Tasks:

* resize
* denoise
* sharpen
* adaptive threshold
* color normalization

OpenCV techniques:

* Gaussian blur
* morphology
* Canny edges

2. segment.py
   Goal:
   Separate:

* walls
* rooms
* labels
* furniture

Methods:

* HSV segmentation
* contours
* connected components

3. walls.py
   Goal:
   Extract clean geometry.

Methods:

* Hough line transform
* contour approximation

Use:

```text id="yo5duw"
cv2.HoughLinesP()
cv2.findContours()
cv2.approxPolyDP()
```

4. vectorize.py
   Run VTracer:

```python id="4z3x10"
subprocess.run([
  "vtracer",
  "--input", input_path,
  "--output", output_path
])
```

5. optimize_svg.py
   Tasks:

* simplify paths
* merge nearby lines
* snap corners
* reduce nodes

Libraries:

* svgpathtools
* shapely

6. export_svg.py
   Generate structured SVG:

```xml id="fg8ajg"
<g id="walls">
<g id="rooms">
<g id="labels">
```

Frontend features:

Upload page:

* drag/drop upload
* preview image
* processing controls

Editor page:

* SVG zoom/pan
* toggle layers
* download SVG
* inspect paths

Useful libraries:

* react-svg
* react-query
* react-dropzone

Advanced features:

* room labeling
* OCR
* furniture detection
* editable walls
* DXF export
* AI room classification

MVP scope:

```text id="vljz3v"
Upload image
→ preprocess
→ VTracer
→ optimized SVG
→ preview/download
```

Production-quality scope:

```text id="yu9sjl"
semantic segmentation
→ geometry reconstruction
→ structured SVG editor
```

Good learning outcomes:

* CV pipelines
* backend architecture
* async processing
* SVG rendering
* geometry algorithms
* production ML/CV workflows
