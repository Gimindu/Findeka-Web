@echo off
cd /d "%~dp0"

echo 🚀 Setting up Findeka AI Service Environment...

if not exist venv (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

echo 🔌 Activating virtual environment...
call venv\Scripts\activate

echo ⬇️ Installing dependencies...
pip install -r requirements.txt

echo ⬇️ Checking SpaCy model...
python -c "import spacy; spacy.load('en_core_web_lg')" 2>nul
if errorlevel 1 (
    echo ⬇️ Downloading SpaCy model...
    python -m spacy download en_core_web_lg
)

echo.
echo ✅ Setup Complete! Starting Service...
echo.
uvicorn main:app --reload --port 8001
pause
