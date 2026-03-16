from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
import numpy as np
import uuid
from typing import List, Any

from app.api import deps
from app.models.user import User
from app.core.config import get_settings

settings = get_settings()

# Load the model globally
# 'all-MiniLM-L6-v2' is small, fast, and highly effective for general sentence similarity
# Using try/except to avoid crashing the whole server during model download or initialization if offline
try:
    model = SentenceTransformer('all-MiniLM-L6-v2', token=settings.HF_TOKEN)
except Exception as e:
    model = None
    print(f"Warning: SentenceTransformer failed to load: {e}")

router = APIRouter()

def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Computes cosine similarity between two vectors (-1.0 to 1.0)."""
    if not vec1 or not vec2:
        return 0.0
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    # Cosine Similarity = (A . B) / (||A|| * ||B||)
    norm = (np.linalg.norm(v1) * np.linalg.norm(v2))
    if norm == 0:
        return 0.0
    return float(np.dot(v1, v2) / norm)

@router.get("/")
def semantic_search(query: str, db: Session = Depends(deps.get_db)) -> Any:
    """
    Search for students using natural language.
    Example: /search?query=someone to help with my startup
    """
    if not model:
        return {"error": "Semantic search engine not initialized. Try exact search."}
        
    if not query.strip():
        return []

    # 1. Convert the search query into an embedding vector
    query_embedding = model.encode(query).tolist()
    
    # 2. Fetch all student profiles that have an embedding from the DB
    # For MVP, calculating in-memory with NumPy is fine.
    # For large scale, pgvector extension should be used inside Postgres.
    students = db.query(User).filter(User.embedding != None, User.is_active == True).all()
    
    results = []
    
    # 3. Compute cosine similarity for each student
    for student in students:
        similarity = compute_cosine_similarity(query_embedding, student.embedding)
        
        # Determine how to display the picture safely
        pic_url = student.profile_picture_url
        if pic_url and pic_url.startswith('/'):
            # This logic usually happens in frontend but exposing full pic isn't bad
            pass
            
        results.append({
            "id": str(student.id),
            "fullName": student.full_name,
            "skillTags": student.skill_tags or [],
            "bio": student.bio or "",
            "role": student.role.value if student.role else "student",
            "profilePictureUrl": pic_url,
            "similarityScore": round(similarity, 4)
        })
    
    # 4. Return the top matching students ranked by similarity score
    # We can filter out people who have very low similarity (e.g. < 0.1)
    results = [r for r in results if r["similarityScore"] > 0.1]
    results.sort(key=lambda x: x["similarityScore"], reverse=True)
    
    # Return the top 10 most relevant students
    return results[:10]
