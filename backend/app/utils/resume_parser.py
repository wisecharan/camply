import os
import spacy
import re
from pdfminer.high_level import extract_text
import fitz  # PyMuPDF
import docx

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spaCy model 'en_core_web_sm' not found. Resume parsing may be degraded.")
    nlp = None

def extract_text_from_pdf_pymupdf(file_path):
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
    except Exception as e:
        print(f"PyMuPDF extraction failed: {e}")
    return text

def extract_text_from_pdf_pdfminer(file_path):
    try:
        return extract_text(file_path)
    except Exception as e:
        print(f"pdfminer extraction failed: {e}")
        return ""

def extract_text_from_docx(file_path):
    try:
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"docx extraction failed: {e}")
        return ""

def parse_resume(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    
    if ext == '.pdf':
        text = extract_text_from_pdf_pymupdf(file_path)
        if not text.strip():
            text = extract_text_from_pdf_pdfminer(file_path)
    elif ext in ['.doc', '.docx']:
        text = extract_text_from_docx(file_path)
        
    if not text.strip():
        return {"error": "Could not extract text from the document."}
        
    extracted_data = {
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "name": extract_name(text)
    }
    
    return extracted_data

def extract_email(text):
    email_regex = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    emails = re.findall(email_regex, text)
    return emails[0] if emails else None

def extract_phone(text):
    phone_regex = r"[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]"
    phones = re.findall(phone_regex, text)
    # Simple heuristic: get the first one that looks like a phone number
    return phones[0] if phones else None

def extract_skills(text):
    # This is a basic dictionary-based approach. We can expand this.
    common_skills = [
        "python", "java", "c++", "c", "javascript", "typescript", "html", "css", 
        "react", "angular", "vue", "node.js", "express", "django", "flask", "spring", 
        "sql", "mysql", "postgresql", "mongodb", "aws", "azure", "docker", "kubernetes",
        "git", "machine learning", "data science", "api", "rest"
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    # Use re to find whole word matches
    for skill in common_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill.upper() if len(skill) <= 3 else skill.title())
            
    return ", ".join(found_skills)

def extract_education(text):
    # Very basic education extraction
    education_keywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.sc", "b.e", "university", "institute", "college"]
    education_lines = []
    
    for line in text.split('\n'):
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in education_keywords):
            if len(line.strip()) > 10 and len(line.strip()) < 100:  # heuristic to avoid matching huge paragraphs
                education_lines.append(line.strip())
                
    return " | ".join(education_lines[:3]) if education_lines else None

def extract_name(text):
    if not nlp:
        # Fallback to taking the first couple of lines if spaCy is missing
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        for line in lines[:5]:
            if len(line.split()) <= 4:
                return line
        return None
        
    doc = nlp(text[:1000]) # Look for name in first 1000 characters
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return None
