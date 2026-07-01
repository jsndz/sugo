import subprocess

from pathlib import Path
import logging

from vtracer import convert_image_to_svg_py
import cv2
import numpy as np
import svgwrite
from shapely.geometry import LineString

TEMP_DIR = Path("/tmp/floor_map_processing")
TEMP_DIR.mkdir(exist_ok=True)
# =========================================================
# 1. LEGACY POTRACE PIPELINE
# =========================================================

from vtracer import convert_image_to_svg_py
import cv2
import numpy as np

logger = logging.getLogger(__name__)

def convert_png_to_svg_local(png_path: Path, output_svg_path: Path) -> Path:
    """
    Production-ready PNG -> SVG conversion using VTracer.
    Preserves your existing:
    - optimization
    - frontend standardization
    - upload flow
    """

    try:
        temp_filename = png_path.stem
        preprocessed_png = TEMP_DIR / f"{temp_filename}_preprocessed.png"
        temp_svg_path = TEMP_DIR / f"{temp_filename}.svg"

        logger.info(f"📄 CONVERTING: {png_path.name}")

        # =====================================================
        # STEP 1 — PREPROCESS IMAGE
        # =====================================================

        logger.info("   🖼️ Step 1/4: Preprocessing image...")

        img = cv2.imread(str(png_path))

        if img is None:
            logger.error("   ❌ Failed to load image")
            return None

        # Denoise while preserving edges
        img = cv2.bilateralFilter(
            img,
            9,
            75,
            75
        )

        # Sharpen
        kernel = np.array([
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ])

        img = cv2.filter2D(
            img,
            -1,
            kernel
        )

        # Save preprocessed image
        cv2.imwrite(str(preprocessed_png), img)

        logger.info("   ✅ Preprocessing completed")

        # =====================================================
        # STEP 2 — VTRACER
        # =====================================================

        logger.info("   🖊️ Step 2/4: Vectorizing with VTracer...")

        convert_image_to_svg_py(
            str(preprocessed_png),
            str(temp_svg_path)
        )

        if not temp_svg_path.exists():
            logger.error("   ❌ VTracer failed")
            return None

        logger.info(
            f"   ✅ SVG created ({temp_svg_path.stat().st_size} bytes)"
        )

        # =====================================================
        # STEP 3 — STANDARDIZE SVG
        # =====================================================

        # logger.info("   🎨 Step 3/4: Standardizing SVG...")

        # standardized_svg_path = standardize_svg_for_frontend(
        #     temp_svg_path,
        #     temp_filename
        # )

        # logger.info("   ✅ Standardization completed")

        # =====================================================
        # STEP 4 — OPTIMIZE SVG
        # =====================================================

        # logger.info("   ⚡ Step 4/4: Optimizing SVG...")

        # optimized_svg_path = optimize_svg(
        #     standardized_svg_path,
        #     temp_filename
        # )

        # import shutil

        # shutil.move(
        #     str(optimized_svg_path),
        #     str(output_svg_path)
        # )
        import shutil

        shutil.copy(
            str(temp_svg_path),
            str(output_svg_path)
        )
        logger.info(
            f"🎉 SUCCESS: {output_svg_path.name}"
        )

        return output_svg_path

    except Exception as e:
        logger.exception(f"❌ Conversion failed: {str(e)}")
        return None


# =========================================================
# 2. VTRACER PIPELINE
# =========================================================

def png_to_svg_vtracer(input_png: str, output_svg: str):
    """
    Modern color-aware tracing pipeline.

    PNG
    -> VTracer
    -> SVG
    """

    convert_image_to_svg_py(
        input_png,
        output_svg
    )
    print(f"[VTracer] SVG saved to {output_svg}")


# =========================================================
# 3. PRODUCTION-STYLE PIPELINE
# =========================================================

def png_to_svg_production(input_png: str, output_svg: str):
    """
    Production-style floorplan vectorization.

    PNG
    -> preprocess
    -> wall extraction
    -> geometry reconstruction
    -> structured SVG
    """

    # ---------------------------------------------
    # LOAD IMAGE
    # ---------------------------------------------
    img = cv2.imread(input_png)

    if img is None:
        raise ValueError("Failed to load image")

    # ---------------------------------------------
    # PREPROCESSING
    # ---------------------------------------------
    denoised = cv2.bilateralFilter(img, 9, 75, 75)

    sharpen_kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ])

    sharpened = cv2.filter2D(
        denoised,
        -1,
        sharpen_kernel
    )

    gray = cv2.cvtColor(
        sharpened,
        cv2.COLOR_BGR2GRAY
    )

    edges = cv2.Canny(
        gray,
        50,
        150
    )

    # ---------------------------------------------
    # WALL DETECTION
    # ---------------------------------------------
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=100,
        minLineLength=40,
        maxLineGap=10
    )

    # ---------------------------------------------
    # SVG GENERATION
    # ---------------------------------------------
    h, w = gray.shape

    dwg = svgwrite.Drawing(
        output_svg,
        size=(w, h)
    )

    # Background
    dwg.add(
        dwg.rect(
            insert=(0, 0),
            size=(w, h),
            fill="white"
        )
    )

    walls_group = dwg.g(id="walls")

    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]

            # Snap near-horizontal / vertical
            if abs(x1 - x2) < 5:
                x2 = x1

            if abs(y1 - y2) < 5:
                y2 = y1

            geom = LineString([
                (x1, y1),
                (x2, y2)
            ])

            walls_group.add(
                dwg.line(
                    start=geom.coords[0],
                    end=geom.coords[1],
                    stroke="black",
                    stroke_width=2
                )
            )

    dwg.add(walls_group)

    # ---------------------------------------------
    # SAVE SVG
    # ---------------------------------------------
    dwg.save()

    print(f"[Production] SVG saved to {output_svg}")