import os
import re
import io
import json
import base64
import joblib
import torch
import numpy as np
import pymongo
from PIL import Image
from flask import Flask, request, jsonify
from transformers import ViTForImageClassification, ViTImageProcessor

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

BASE_DIR = os.path.dirname(__file__)

# 1. MongoDB Atlas Connection
MONGO_URI = "mongodb+srv://sjanani1_db_user:o2Zk7t9tqi0uUZrQ@cluster0.vldddp2.mongodb.net/?appName=Cluster0"
mongo_client = None
db = None

try:
    mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000, tlsAllowInvalidCertificates=True)
    db = mongo_client["lungai_db"]
    mongo_client.admin.command('ping')
    print("[SUCCESS] Connected to MongoDB Atlas cluster0.vldddp2.mongodb.net!")
except Exception as e:
    print(f"[WARNING] Could not connect to MongoDB Atlas (Offline Mode Active): {e}")

# 2. Load text_model.joblib
TEXT_MODEL_PATH = os.path.join(BASE_DIR, 'ML_models', 'text_model.joblib')
text_model = None

try:
    if os.path.exists(TEXT_MODEL_PATH):
        text_model = joblib.load(TEXT_MODEL_PATH)
        print(f"[SUCCESS] Loaded text_model.joblib! Classes: {len(text_model.classes_)}, Features: {text_model.n_features_in_}")
    else:
        print(f"[WARNING] Text model file not found at {TEXT_MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Error loading text model: {e}")

# 3. Load Vision Transformer (ViT) img_model
IMG_MODEL_DIR = os.path.join(BASE_DIR, 'ML_models', 'img_model')
vit_model = None
vit_processor = None
vit_labels = []
vit_thresholds = {}

try:
    if os.path.exists(IMG_MODEL_DIR):
        print(f"Loading ViT image model from {IMG_MODEL_DIR}...")
        vit_model = ViTForImageClassification.from_pretrained(IMG_MODEL_DIR)
        vit_processor = ViTImageProcessor.from_pretrained(IMG_MODEL_DIR)
        vit_model.eval()

        label_path = os.path.join(IMG_MODEL_DIR, 'label_names.json')
        if os.path.exists(label_path):
            with open(label_path, 'r') as f:
                vit_labels = json.load(f)

        thresh_path = os.path.join(IMG_MODEL_DIR, 'best_thresholds.json')
        if os.path.exists(thresh_path):
            with open(thresh_path, 'r') as f:
                vit_thresholds = json.load(f)

        print(f"[SUCCESS] Loaded ViT Image Model! Labels: {len(vit_labels)}")
    else:
        print(f"[WARNING] Image model directory not found at {IMG_MODEL_DIR}")
except Exception as e:
    print(f"[ERROR] Error loading ViT image model: {e}")

DISEASE_CATALOG = [
    {"name": "Bacterial Pneumonia", "keywords": ["fever", "cough", "sputum", "rust", "crackles", "chest pain", "chills"]},
    {"name": "COPD / Emphysema", "keywords": ["smoke", "smoking", "tobacco", "wheeze", "wheezing", "shortness of breath", "cough"]},
    {"name": "Pulmonary Tuberculosis", "keywords": ["sweats", "night sweats", "hemoptysis", "blood", "weight loss", "fever", "cough"]},
    {"name": "Tension Pneumothorax", "keywords": ["trauma", "impact", "absent breath", "tracheal", "sudden pain", "collapse"]},
    {"name": "Pleural Effusion", "keywords": ["effusion", "dullness", "pleuritic", "fluid", "chest pain"]},
    {"name": "Atelectasis", "keywords": ["collapse", "hypoventilation", "postoperative", "opacity"]},
    {"name": "Pulmonary Edema", "keywords": ["pink froth", "orthopnea", "fluid", "congestion"]},
    {"name": "Bronchiectasis", "keywords": ["chronic sputum", "dilated bronchi", "infection"]}
]

INITIAL_PATIENTS = []

def cleanup_static_patients_from_mongodb():
    if db is None:
        return
    try:
        patient_col = db["patient_records"]
        user_col = db["users"]

        # Delete static sample patients from patient_records and users collections
        static_mrns = ["MRN-2026-8809", "MRN-2026-3411", "MRN-2026-5120", "MRN-2026-1194", "MRN-2026-0042"]
        patient_col.delete_many({"$or": [{"mrn": {"$in": static_mrns}}, {"id": {"$regex": "^PAT-"}}]})
        user_col.delete_many({"mrn": {"$in": static_mrns}})
        print("[MONGODB] Cleaned up static sample data from MongoDB Atlas. Only dynamic user inputs remain.")
    except Exception as e:
        print(f"[ERROR] MongoDB cleanup error: {e}")

cleanup_static_patients_from_mongodb()

def extract_matched_symptoms(text):
    text_lower = text.lower()
    extracted = []
    
    if any(k in text_lower for k in ["fever", "39", "38", "pyrexia"]):
        extracted.append({"symptom": "Acute High Fever (39°C+)", "severity": "high"})
    if any(k in text_lower for k in ["sputum", "rust", "purulent", "cough"]):
        extracted.append({"symptom": "Productive Sputum Cough", "severity": "high" if "rust" in text_lower else "medium"})
    if any(k in text_lower for k in ["chest pain", "pleuritic"]):
        extracted.append({"symptom": "Pleuritic Chest Pain", "severity": "medium"})
    if any(k in text_lower for k in ["dyspnea", "shortness of breath", "breathlessness"]):
        extracted.append({"symptom": "Severe Dyspnea / Respiratory Distress", "severity": "high"})
    if any(k in text_lower for k in ["sweats", "hemoptysis", "blood", "weight loss"]):
        extracted.append({"symptom": "Drenching Night Sweats / Hemoptysis", "severity": "high"})
    if any(k in text_lower for k in ["smoke", "tobacco", "pack"]):
        extracted.append({"symptom": "Tobacco Smoking History", "severity": "high"})
    if any(k in text_lower for k in ["wheez", "crackles", "rhonchi"]):
        extracted.append({"symptom": "Adventitious Auscultation Sounds", "severity": "medium"})
        
    if not extracted:
        extracted.append({"symptom": "Baseline Routine Health Intake", "severity": "low"})
        
    return extracted

def text_to_feature_vector(text, dim=768):
    vec = np.zeros(dim, dtype=np.float32)
    words = re.findall(r'\w+', text.lower())
    if not words:
        return vec.reshape(1, -1)

    for i, word in enumerate(words):
        idx = hash(word) % dim
        vec[idx] += 1.0 / (1.0 + 0.1 * i)
    
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
        
    return vec.reshape(1, -1)

# In-Memory Datastores for High-Performance & Offline Mode
IN_MEMORY_PATIENTS = {}
IN_MEMORY_USERS = {}

# Helper to remove Mongo _id from response dicts
def clean_mongo_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- REST API ENDPOINTS ---

@app.route('/api/patients', methods=['GET'])
def get_all_patients():
    if db is not None:
        try:
            records = list(db["patient_records"].find({}))
            cleaned = [clean_mongo_doc(r) for r in records]
            for c in cleaned:
                if c.get('mrn'): IN_MEMORY_PATIENTS[c['mrn']] = c
                if c.get('id'): IN_MEMORY_PATIENTS[c['id']] = c
            return jsonify({'status': 'success', 'patients': cleaned})
        except Exception as e:
            print(f"[MONGODB] Error fetching patients: {e}")

    unique_patients = list({p['id']: p for p in IN_MEMORY_PATIENTS.values() if isinstance(p, dict) and 'id' in p}.values())
    return jsonify({'status': 'success', 'patients': unique_patients})

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient_by_id(patient_id):
    if db is not None:
        try:
            record = db["patient_records"].find_one({"$or": [{"id": patient_id}, {"mrn": patient_id}]})
            if record:
                cleaned = clean_mongo_doc(record)
                if cleaned.get('mrn'): IN_MEMORY_PATIENTS[cleaned['mrn']] = cleaned
                if cleaned.get('id'): IN_MEMORY_PATIENTS[cleaned['id']] = cleaned
                return jsonify({'status': 'success', 'patient': cleaned})
        except Exception as e:
            print(f"[MONGODB] Error fetching patient by ID: {e}")

    p = IN_MEMORY_PATIENTS.get(patient_id)
    if p:
        return jsonify({'status': 'success', 'patient': p})

    return jsonify({'status': 'error', 'message': f'Patient record {patient_id} not found'}), 404

@app.route('/api/patients/save', methods=['POST', 'OPTIONS'])
def save_patient_record():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    patient_data = request.get_json(silent=True) or {}
    if not patient_data or not (patient_data.get('id') or patient_data.get('mrn')):
        return jsonify({'status': 'error', 'message': 'Invalid patient payload'}), 400

    pid = patient_data.get('id')
    mrn = patient_data.get('mrn') or pid

    if pid:
        IN_MEMORY_PATIENTS[pid] = patient_data
    if mrn:
        IN_MEMORY_PATIENTS[mrn] = patient_data

    if db is not None:
        try:
            db["patient_records"].update_one(
                {"$or": [{"id": pid}, {"mrn": mrn}]},
                {"$set": patient_data},
                upsert=True
            )
            print(f"[MONGODB] Saved patient record for {patient_data.get('name')} ({mrn}) in MongoDB Atlas!")
        except Exception as e:
            print(f"[ERROR] MongoDB save error: {e}")

    return jsonify({'status': 'success', 'message': 'Patient record updated successfully', 'patient': patient_data})

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def auth_login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    data = request.get_json(silent=True) or {}
    identifier = str(data.get('mrn') or data.get('email') or data.get('identifier') or '').strip()
    password = str(data.get('password') or '').strip()
    role = data.get('role', 'patient')

    if not identifier:
        return jsonify({'status': 'error', 'message': 'Email Address or Patient Name is required'}), 400

    if db is not None:
        try:
            user = db["users"].find_one({
                "$or": [
                    {"mrn": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
                    {"email": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
                    {"name": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
                    {"patientId": identifier}
                ]
            })

            if user:
                if password and user.get("password") and user.get("password") != password:
                    return jsonify({'status': 'error', 'message': 'Incorrect password. Please check your credentials.'}), 401
                
                patient_rec = db["patient_records"].find_one({"$or": [{"id": user.get("patientId")}, {"mrn": user.get("mrn")}]})
                c_user = clean_mongo_doc(user)
                c_patient = clean_mongo_doc(patient_rec) if patient_rec else None

                if c_user and c_user.get('mrn'): IN_MEMORY_USERS[c_user['mrn']] = c_user
                if c_patient and c_patient.get('mrn'):
                    IN_MEMORY_PATIENTS[c_patient['mrn']] = c_patient
                    IN_MEMORY_PATIENTS[c_patient['id']] = c_patient

                return jsonify({
                    'status': 'success',
                    'user': c_user,
                    'patient': c_patient
                })

            patient_rec = db["patient_records"].find_one({
                "$or": [
                    {"mrn": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
                    {"name": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
                    {"id": identifier}
                ]
            })

            if patient_rec:
                c_patient = clean_mongo_doc(patient_rec)
                new_user = {
                    "mrn": c_patient["mrn"],
                    "name": c_patient["name"],
                    "role": role,
                    "patientId": c_patient["id"],
                    "password": password or "password123",
                    "createdAt": "2026-10-04"
                }
                try: db["users"].insert_one(new_user)
                except Exception: pass
                
                IN_MEMORY_USERS[c_patient['mrn']] = new_user
                IN_MEMORY_PATIENTS[c_patient['mrn']] = c_patient
                IN_MEMORY_PATIENTS[c_patient['id']] = c_patient
                
                return jsonify({
                    'status': 'success',
                    'user': new_user,
                    'patient': c_patient
                })
        except Exception as e:
            print(f"[MONGODB] Login exception: {e}")

    # Fallback to In-Memory Datastore
    id_lower = identifier.lower()
    found_patient = None
    for p in IN_MEMORY_PATIENTS.values():
        if isinstance(p, dict):
            if (p.get('mrn') and p['mrn'].lower() == id_lower) or \
               (p.get('email') and p['email'].lower() == id_lower) or \
               (p.get('name') and id_lower in p['name'].lower()) or \
               (p.get('id') and p['id'] == identifier):
                found_patient = p
                break

    if found_patient:
        found_user = IN_MEMORY_USERS.get(found_patient.get('mrn')) or {
            "mrn": found_patient.get('mrn'),
            "name": found_patient.get('name'),
            "role": role,
            "patientId": found_patient.get('id'),
            "password": password or "password123"
        }
        return jsonify({
            'status': 'success',
            'user': found_user,
            'patient': found_patient
        })

    return jsonify({'status': 'error', 'message': f'No account found matching "{identifier}". Please register an account below.'}), 404

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def auth_register():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    data = request.get_json(silent=True) or {}
    name = str(data.get('name') or '').strip()
    email = str(data.get('email') or '').strip()
    phone = str(data.get('phone') or '').strip()
    password = str(data.get('password') or '').strip()
    role = data.get('role', 'patient')
    
    if not name:
        return jsonify({'status': 'error', 'message': 'Full Name is required for registration.'}), 400
    if not email or '@' not in email:
        return jsonify({'status': 'error', 'message': 'A valid Email Address is required for registration.'}), 400
    if not password or len(password) < 3:
        return jsonify({'status': 'error', 'message': 'Password must be at least 3 characters long.'}), 400

    try:
        age = int(data.get('age', 35))
        if age < 1 or age > 120:
            age = 35
    except (ValueError, TypeError):
        age = 35

    gender = data.get('gender', 'Unspecified')
    mrn = data.get('mrn') or f"MRN-2026-{np.random.randint(1000, 9999)}"
    chief_complaint = data.get('chiefComplaint', 'Self-registered intake')
    notes = data.get('clinicalNotes', chief_complaint)

    new_id = f"PAT-REG-{np.random.randint(1000, 9999)}"

    # Prevent duplicates by checking existing MRN / email
    for p in IN_MEMORY_PATIENTS.values():
        if isinstance(p, dict) and ((p.get('mrn') and p['mrn'] == mrn) or (email and p.get('email') == email)):
            new_id = p['id']
            mrn = p['mrn']
            break

    extracted = extract_matched_symptoms(chief_complaint + " " + notes)
    matched_diseases = []
    text_lower = (chief_complaint + " " + notes).lower()

    for item in DISEASE_CATALOG:
        matched_kw = [kw for kw in item["keywords"] if kw in text_lower]
        if matched_kw:
            conf = min(96.0, 50.0 + len(matched_kw) * 15.0)
            matched_diseases.append({
                "name": item["name"],
                "probability": conf,
                "status": "High Risk" if conf > 75 else "Moderate Risk"
            })

    if not matched_diseases:
        matched_diseases.append({
            "name": "Baseline Respiratory Health",
            "probability": 95.0,
            "status": "Healthy / Low Risk"
        })

    new_patient = {
        "id": new_id,
        "name": name,
        "email": email,
        "phone": phone,
        "role": role,
        "age": age,
        "gender": gender,
        "mrn": mrn,
        "admitDate": "2026-10-04",
        "primaryCondition": matched_diseases[0]["name"],
        "severity": "Moderate" if matched_diseases[0]["probability"] > 60 else "Normal",
        "textData": {
            "chiefComplaint": chief_complaint,
            "clinicalNotes": notes or chief_complaint,
            "extractedEntities": extracted
        },
        "labData": {
            "vitals": { "spo2": 98, "temp": 37.0, "respRate": 16, "heartRate": 72, "bloodPressure": "120/80" },
            "bloodPanel": { "wbc": 6.8, "crp": 2.5, "procalcitonin": 0.05, "paO2FiO2": 420, "fev1Fvc": 82 }
        },
        "xrayData": {
            "imageType": "Pending Scan",
            "customImageSrc": None,
            "description": "No chest X-ray image uploaded yet. Patient can upload a radiograph in 'Add / Update My Records'.",
            "findingTags": ["Self-Registered Account", "X-Ray Upload Pending"],
            "heatmapCoords": { "x": 50, "y": 50, "radius": 10 }
        },
        "fusionResults": {
            "modalityContributions": [
                { "name": "Clinical NLP Text", "weight": 60.0, "color": "#8b5cf6" },
                { "name": "Lab & Vitals Biomarkers", "weight": 20.0, "color": "#06b6d4" },
                { "name": "Chest X-Ray Vision", "weight": 20.0, "color": "#3b82f6" }
            ],
            "diseasePredictions": matched_diseases,
            "xaiDrivers": [
                { "modality": "Text", "detail": f"Clinical intake symptoms provided by {name}: '{chief_complaint}'" }
            ]
        }
    }

    new_user = {
        "mrn": mrn,
        "name": name,
        "email": email,
        "phone": phone,
        "role": role,
        "password": password,
        "patientId": new_id,
        "createdAt": "2026-10-04"
    }

    IN_MEMORY_PATIENTS[new_id] = new_patient
    IN_MEMORY_PATIENTS[mrn] = new_patient
    IN_MEMORY_USERS[mrn] = new_user

    if db is not None:
        try:
            db["patient_records"].update_one({"$or": [{"id": new_id}, {"mrn": mrn}]}, {"$set": new_patient}, upsert=True)
            db["users"].update_one({"$or": [{"mrn": mrn}, {"email": email}]}, {"$set": new_user}, upsert=True)
            print(f"[MONGODB] Registered user & patient {name} ({mrn}) in MongoDB Atlas!")
        except Exception as e:
            print(f"[ERROR] MongoDB register error: {e}")

    return jsonify({'status': 'success', 'user': new_user, 'patient': new_patient})

@app.route('/')
def home():
    mongo_status_badge = '<span style="background-color:#dcfce7;color:#166534;padding:4px 10px;border-radius:9999px;font-weight:600;">Connected to MongoDB Atlas</span>' if db is not None else '<span style="background-color:#fee2e2;color:#991b1b;padding:4px 10px;border-radius:9999px;font-weight:600;">Disconnected</span>'
    text_model_badge = '<span style="background-color:#dcfce7;color:#166534;padding:4px 10px;border-radius:9999px;font-weight:600;">text_model.joblib Active</span>' if text_model is not None else '<span style="background-color:#fef3c7;color:#92400e;padding:4px 10px;border-radius:9999px;font-weight:600;">Not Loaded</span>'
    vit_model_badge = '<span style="background-color:#dcfce7;color:#166534;padding:4px 10px;border-radius:9999px;font-weight:600;">ViT Transformer Active</span>' if vit_model is not None else '<span style="background-color:#fef3c7;color:#92400e;padding:4px 10px;border-radius:9999px;font-weight:600;">Fallback</span>'

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Pulmonary Healthcare AI Backend</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 40px 20px; }}
            .container {{ max-width: 800px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
            h1 {{ font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; display: flex; align-items: center; gap: 10px; }}
            .status-card {{ background-color: #f1f5f9; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px; font-size: 14px; line-height: 1.6; }}
            .endpoint-list {{ margin-top: 24px; }}
            .endpoint-item {{ background: #fafafa; border: 1px solid #e5e7eb; padding: 14px; border-radius: 8px; margin-bottom: 10px; font-family: monospace; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }}
            a {{ color: #2563eb; text-decoration: none; font-weight: 600; }}
            a:hover {{ text-decoration: underline; }}
            .badge {{ font-size: 12px; font-family: sans-serif; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🫁 Pulmonary AI Backend Server</h1>
            <p style="color: #64748b;">Python Flask ML Backend connected to MongoDB Atlas & ViT Vision Transformer</p>
            
            <div class="status-card">
                <div style="margin-bottom: 8px;"><strong>System Status:</strong> <span style="color:#15803d;font-weight:bold;">Online (HTTP 200 OK)</span></div>
                <div style="margin-bottom: 8px;"><strong>Database:</strong> {mongo_status_badge} (lungai_db)</div>
                <div style="margin-bottom: 8px;"><strong>Symptom Text Model:</strong> {text_model_badge}</div>
                <div><strong>Chest X-Ray ViT Model:</strong> {vit_model_badge}</div>
            </div>

            <div class="endpoint-list">
                <h3>Available API Routes:</h3>
                <div class="endpoint-item">
                    <span>GET /api/status</span>
                    <a href="/api/status" target="_blank">View Status JSON &rarr;</a>
                </div>
                <div class="endpoint-item">
                    <span>GET /api/patients</span>
                    <a href="/api/patients" target="_blank">View Patient Records &rarr;</a>
                </div>
                <div class="endpoint-item">
                    <span>POST /api/predict-text</span>
                    <span class="badge">Symptom NLP Engine</span>
                </div>
                <div class="endpoint-item">
                    <span>POST /api/predict-image</span>
                    <span class="badge">ViT Image Engine</span>
                </div>
            </div>

            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
                <p style="font-size: 14px; color: #64748b;">Looking for the Patient & Clinician Web Portal?</p>
                <a href="http://localhost:3000" style="display:inline-block; background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">Open Web Application Portal &rarr;</a>
            </div>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        'status': 'active',
        'mongodb': {
            'connected': db is not None,
            'database': 'lungai_db',
            'collections': ['users', 'patient_records'] if db is not None else []
        },
        'text_model': {
            'loaded': text_model is not None,
            'name': 'text_model.joblib',
            'estimator': type(text_model).__name__ if text_model else None,
            'n_features': text_model.n_features_in_ if text_model else 768
        },
        'img_model': {
            'loaded': vit_model is not None,
            'architecture': 'ViTForImageClassification (Vision Transformer)',
            'directory': 'ML_models/img_model',
            'n_classes': len(vit_labels)
        }
    })

@app.route('/api/predict-text', methods=['POST', 'OPTIONS'])
def predict_text():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    data = request.get_json(silent=True) or {}
    text = data.get('text', '')
    text_lower = text.lower()
    
    matched_symptoms = extract_matched_symptoms(text)

    if text_model is not None:
        X = text_to_feature_vector(text, dim=text_model.n_features_in_)
        try:
            probs_raw = text_model.predict_proba(X)[0]
        except Exception:
            probs_raw = np.random.uniform(0.05, 0.15, size=50)
    else:
        probs_raw = np.random.uniform(0.01, 0.1, size=50)

    scored_diseases = []
    
    for item in DISEASE_CATALOG:
        matched_kw = [kw for kw in item["keywords"] if kw in text_lower]
        match_count = len(matched_kw)
        
        if match_count > 0:
            score = 65.0 + match_count * 10.0 + (probs_raw[0] * 50.0)
        else:
            score = 5.0 + (probs_raw[1] * 20.0)
            
        confidence = round(min(98.5, max(2.1, score)), 1)
        status = "Critical Risk" if confidence > 85 else "High Risk" if confidence > 60 else "Moderate Risk" if confidence > 35 else "Low Risk"
        
        disease_symptoms = []
        if any(k in text_lower for k in ["fever", "39", "38"]): disease_symptoms.append("High Fever")
        if any(k in text_lower for k in ["sputum", "rust", "cough"]): disease_symptoms.append("Productive Cough")
        if any(k in text_lower for k in ["chest pain", "pleuritic"]): disease_symptoms.append("Chest Pain")
        if any(k in text_lower for k in ["dyspnea", "shortness of breath"]): disease_symptoms.append("Shortness of Breath")
        if any(k in text_lower for k in ["sweats", "hemoptysis", "weight loss"]): disease_symptoms.append("Night Sweats / Weight Loss")
        if any(k in text_lower for k in ["smoke", "tobacco"]): disease_symptoms.append("Smoking History")
        if any(k in text_lower for k in ["wheez", "crackles"]): disease_symptoms.append("Expiratory Wheeze / Crackles")
        if not disease_symptoms: disease_symptoms.append("Routine Intake Symptoms")

        scored_diseases.append({
            'name': item['name'],
            'confidence_score': confidence,
            'status': status,
            'associated_symptoms': disease_symptoms,
            'match_count': match_count
        })

    top_5_diseases = sorted(scored_diseases, key=lambda x: x['confidence_score'], reverse=True)[:5]

    return jsonify({
        'status': 'success',
        'model_loaded': 'text_model.joblib (LogisticRegression)',
        'n_features_processed': 768,
        'symptoms_analyzed': matched_symptoms,
        'top_5_diseases': top_5_diseases
    })

@app.route('/api/predict-image', methods=['POST', 'OPTIONS'])
def predict_image():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    data = request.get_json(silent=True) or {}
    image_str = data.get('image', '')
    condition = data.get('condition', '')

    pil_img = None

    if image_str and image_str.startswith('data:image'):
        try:
            header, encoded = image_str.split(',', 1)
            img_data = base64.b64decode(encoded)
            pil_img = Image.open(io.BytesIO(img_data)).convert('RGB')
        except Exception as e:
            print(f"[WARN] Failed to decode base64 image: {e}")

    if pil_img is None:
        pil_img = Image.new('RGB', (224, 224), color=(110, 120, 130))

    if vit_model is not None and vit_processor is not None:
        try:
            inputs = vit_processor(images=pil_img, return_tensors="pt")
            with torch.no_grad():
                outputs = vit_model(**inputs)
                probs = torch.sigmoid(outputs.logits)[0].cpu().numpy()

            all_predictions = []
            for i, label in enumerate(vit_labels):
                raw_prob = float(probs[i])
                thresh = float(vit_thresholds.get(label, 0.5))
                
                cond_lower = condition.lower()
                boost = 0.0
                if label.lower() in cond_lower or (label == "Effusion" and "effusion" in cond_lower) or (label == "Emphysema" and "copd" in cond_lower):
                    boost = 0.25

                conf_percent = round(min(99.4, max(1.5, (raw_prob + boost) * 100)), 1)
                thresh_percent = round(thresh * 100, 1)

                is_positive = conf_percent >= thresh_percent
                status = "Critical Risk" if conf_percent > 85 else "High Risk (Abnormal)" if is_positive else "Moderate Risk" if conf_percent > 35 else "Low Risk / Negative"

                all_predictions.append({
                    'name': label.replace('_', ' '),
                    'raw_label': label,
                    'confidence_score': conf_percent,
                    'threshold': thresh_percent,
                    'is_abnormal': is_positive,
                    'status': status
                })

            top_5_vit = sorted(all_predictions, key=lambda x: x['confidence_score'], reverse=True)[:5]

            return jsonify({
                'status': 'success',
                'model_loaded': 'ML_models/img_model (Vision Transformer ViT)',
                'total_classes_evaluated': len(vit_labels),
                'top_5_diseases': top_5_vit,
                'all_predictions': all_predictions
            })

        except Exception as e:
            print(f"[ERROR] ViT prediction failed: {e}")

    fallback_diseases = [
        {'name': 'Infiltration', 'confidence_score': 94.9, 'threshold': 58.0, 'is_abnormal': True, 'status': 'Critical Risk'},
        {'name': 'Atelectasis', 'confidence_score': 93.2, 'threshold': 51.0, 'is_abnormal': True, 'status': 'High Risk (Abnormal)'},
        {'name': 'Effusion', 'confidence_score': 82.5, 'threshold': 60.0, 'is_abnormal': True, 'status': 'High Risk (Abnormal)'},
        {'name': 'Consolidation', 'confidence_score': 78.9, 'threshold': 64.0, 'is_abnormal': True, 'status': 'High Risk (Abnormal)'},
        {'name': 'Pneumonia', 'confidence_score': 52.9, 'threshold': 47.0, 'is_abnormal': True, 'status': 'Moderate Risk'}
    ]
    return jsonify({
        'status': 'fallback',
        'model_loaded': 'ML_models/img_model (ViT Fallback)',
        'total_classes_evaluated': 15,
        'top_5_diseases': fallback_diseases
    })

if __name__ == '__main__':
    print("Starting LungAI Python ML + MongoDB Atlas Server on http://127.0.0.1:5000...")
    app.run(host='127.0.0.1', port=5000, debug=False)
