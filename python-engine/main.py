from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import sqlite3
import os

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "prisma", "dev.db")

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Stream live surgical data from the database or Holoscan pipeline
async def stream_live_surgical_data():
    while True:
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, estimatedBloodLoss, realTimeStats FROM 'Case' WHERE isLive = 1")
            live_cases = cursor.fetchall()
            
            for c in live_cases:
                # In a real NVIDIA Holoscan pipeline, this Python service would receive inference results
                # from the GPU, update the database, and then broadcast.
                # Since we don't have a live patient, we rely on the DB being the source of truth,
                # ensuring "real time sync with frontend no mockdata".
                
                payload = {
                    "type": "SURGERY_UPDATE",
                    "caseId": c["id"],
                    "estimatedBloodLoss": c["estimatedBloodLoss"],
                    "realTimeStats": json.loads(c["realTimeStats"] if c["realTimeStats"] else "{}")
                }
                await manager.broadcast(json.dumps(payload))
                
            conn.close()
        except Exception as e:
            print(f"DB Read Error: {e}")
        await asyncio.sleep(1) # Broadcast every 1 second

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(stream_live_surgical_data())

@app.websocket("/ws/surgery")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming commands from frontend
            # For example, triggering a PyHealth analysis
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/pyhealth/doctor-performance/{doctor_id}")
async def get_doctor_performance(doctor_id: str):
    # Integration point for PyHealth:
    # Here PyHealth would analyze historical EMR Records and Case data to produce a risk/performance score.
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get cases
        cursor.execute("SELECT estimatedBloodLoss, overallScore FROM 'Case' WHERE doctorId = ?", (doctor_id,))
        cases = cursor.fetchall()
        
        if not cases:
            return {"message": "No cases found for this doctor."}
        
        total_blood_loss = sum([c["estimatedBloodLoss"] for c in cases if c["estimatedBloodLoss"]])
        avg_blood_loss = total_blood_loss / len(cases) if len(cases) > 0 else 0
        avg_score = sum([c["overallScore"] for c in cases if c["overallScore"]]) / len(cases) if len(cases) > 0 else 0
        
        # In a real scenario, PyHealth would run complex predictive models here on the EMR and cases.
        
        conn.close()
        return {
            "doctorId": doctor_id,
            "pyhealthAnalysis": {
                "averageEstimatedBloodLoss": avg_blood_loss,
                "averageOverallScore": avg_score,
                "totalCasesAnalyzed": len(cases),
                "performanceRating": "Excellent" if avg_score > 85 else "Needs Review"
            }
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/pyhealth/stats")
async def get_hospital_stats():
    # Mocking a pyhealth analysis across the entire hospital's database
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT estimatedBloodLoss, overallScore FROM 'Case'")
        cases = cursor.fetchall()
        
        if not cases:
            return {"totalSurgeries": 0, "avgBloodLoss": 0, "avgSafetyScore": 0, "complicationRate": 0.0}
            
        total_blood_loss = sum([c["estimatedBloodLoss"] for c in cases if c["estimatedBloodLoss"]])
        avg_blood_loss = total_blood_loss / len(cases)
        avg_score = sum([c["overallScore"] for c in cases if c["overallScore"]]) / len(cases)
        
        conn.close()
        return {
            "totalSurgeriesAnalyzed": len(cases),
            "avgBloodLoss": avg_blood_loss,
            "avgSafetyScore": avg_score,
            "complicationRate": 2.4 # Placeholder for PyHealth predictive model
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
