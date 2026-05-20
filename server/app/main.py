from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Sugo API is running"}

@app.post("/api/convert")
async def convert_image(file: UploadFile = File(...)):
    # Mock conversion logic: return a simple SVG placeholder
    mock_svg = """
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6" />
        <circle cx="100" cy="100" r="50" fill="#3b82f6" />
        <text x="50%" y="160" text-anchor="middle" fill="#1f2937" font-family="sans-serif" font-size="12">
            Mock SVG Result
        </text>
    </svg>
    """.strip()
    
    return {
        "filename": file.filename,
        "svg": mock_svg
    }
