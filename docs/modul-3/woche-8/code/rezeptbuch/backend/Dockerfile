# schlankes python image ohne compiler und build tools
FROM python:3.11-slim

# arbeitsverzeichnis im container
WORKDIR /app

# erst requirements kopieren fuer besseres layer caching
# aendert sich selten also wird der layer wiederverwendet
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# dann den eigentlichen code kopieren
COPY app.py .

# port dokumentieren den die app nutzt
EXPOSE 8000

# uvicorn startet die fastapi app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
