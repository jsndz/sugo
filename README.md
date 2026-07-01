# ⚡ Sugo

**Sugo** is a high-performance image-to-SVG vectorization engine. It provides a React frontend and a FastAPI backend with multiple vectorization pipelines ranging from color-aware path tracing to structured geometry reconstruction for architectural floorplans.

---

## 🚀 Key Features & Vectorization Pipelines

Sugo implements three distinct processing pipelines for various vectorization needs:

1. **Potrace (Local VTracer)**:
   - Optimized for single-color shapes or silhouette vectorization.
   - Includes image preprocessing: a bilateral filter to reduce noise while preserving edges, followed by a sharpening filter before tracing.
   
2. **VTracer**:
   - A modern, color-aware tracing pipeline.
   - Converts raster colors into corresponding overlapping SVG paths, preserving multi-color details.

3. **Production (Geometry Reconstruction)**:
   - Specifically optimized for floorplans and architectural lines.
   - **Algorithm Flow**:
     1. Preprocessing (bilateral filter + sharpening + grayscale conversion).
     2. Edge detection using the Canny algorithm.
     3. Wall detection using the Probabilistic Hough Line Transform.
     4. Geometry snapping to near-horizontal and near-vertical constraints.
     5. Reconstructing wall boundaries using [Shapely](https://shapely.readthedocs.io/).
     6. Exporting a structured SVG grouping wall elements under `<g id="walls">`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4
- **Backend**: FastAPI + Uvicorn
- **Computer Vision & Graphics**: OpenCV (Python), Shapely, svgwrite, VTracer

---

## 📂 Project Structure

- [sugo.yaml](file:///home/jaison/code/projects/sugo/sugo.yaml) - Orchestration configurations for local services
- [frontend/](file:///home/jaison/code/projects/sugo/frontend) - React web application
  - [frontend/src/App.tsx](file:///home/jaison/code/projects/sugo/frontend/src/App.tsx) - Main user interface & file upload logic
  - [frontend/src/main.tsx](file:///home/jaison/code/projects/sugo/frontend/src/main.tsx) - Vite entrypoint
  - [frontend/package.json](file:///home/jaison/code/projects/sugo/frontend/package.json) - Frontend package details
- [server/](file:///home/jaison/code/projects/sugo/server) - FastAPI backend
  - [server/app/main.py](file:///home/jaison/code/projects/sugo/server/app/main.py) - FastAPI application entry & CORS middleware
  - [server/app/get_svg.py](file:///home/jaison/code/projects/sugo/server/app/get_svg.py) - Custom CV & tracing pipeline algorithms

---

## ⚙️ Installation & Setup

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+)

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd sugo
   ```

2. **Backend Installation**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install fastapi uvicorn opencv-python numpy svgwrite shapely vtracer python-multipart
   ```

3. **Frontend Installation**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🏃 Running the Application

### Option A: Using the Task Runner
If you are using a workspace task orchestrator that understands [sugo.yaml](file:///home/jaison/code/projects/sugo/sugo.yaml):
```bash
# Runs both services as defined in sugo.yaml
agy run
```

### Option B: Manual Startup

1. **Start the FastAPI server**
   ```bash
   cd server
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```
   The backend API will run on [http://localhost:8000](http://localhost:8000).

2. **Start the Vite frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend dev server will start on [http://localhost:5173](http://localhost:5173).

---

## 📡 API Reference

### `POST /api/convert`

Uploads an image file to run the conversion pipeline.

- **Request**: `multipart/form-data`
  - `file`: The raster image (PNG, JPG, WEBP).
- **Response**: `application/json`
  ```json
  {
    "filename": "input.png",
    "svgs": {
      "potrace": "<svg>...</svg> or null",
      "vtracer": "<svg>...</svg> or null",
      "production": "<svg>...</svg> or null"
    }
  }
  ```
