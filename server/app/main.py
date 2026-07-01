import os
import tempfile
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.get_svg import convert_png_to_svg_local, png_to_svg_vtracer, png_to_svg_production
from pathlib import Path

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Sugo API is running"}

@app.post("/api/convert")
async def convert_image(file: UploadFile = File(...)):
    # Create a temporary directory to work in
    temp_dir = tempfile.mkdtemp()
    try:
        # Save uploaded file
        input_path = os.path.join(temp_dir, "input.png")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        results = {}
        
        # 1. Potrace
        potrace_out = os.path.join(temp_dir, "potrace.svg")
        try:

            convert_png_to_svg_local(
                Path(input_path),
                Path(potrace_out)
            )
            with open(potrace_out, "r") as f:
                results["potrace"] = f.read()
        except Exception as e:
            print(f"Potrace failed: {e}")
            results["potrace"] = None

        # 2. VTracer
        vtracer_out = os.path.join(temp_dir, "vtracer.svg")
        try:
            png_to_svg_vtracer(input_path, vtracer_out)
            with open(vtracer_out, "r") as f:
                results["vtracer"] = f.read()
        except Exception as e:
            print(f"VTracer failed: {e}")
            results["vtracer"] = None

        # 3. Production
        production_out = os.path.join(temp_dir, "production.svg")
        try:
            png_to_svg_production(input_path, production_out)
            with open(production_out, "r") as f:
                results["production"] = f.read()
        except Exception as e:
            print(f"Production failed: {e}")
            results["production"] = None

        return {
            "filename": file.filename,
            "svgs": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir)
