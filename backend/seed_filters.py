import os
import sys
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.services.subcategory_filter_service import SubcategoryFilterService
from app.schemas.subcategory_filter import SubcategoryFilterCreate

def seed():
    db = SessionLocal()
    
    filters_data = [
        # 1. Subject Tutoring
        {
            "subcategory": "Subject Tutoring",
            "filters": [
                {"label": "Subject", "type": "dropdown", "options": ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Computer Science", "Law", "Accounting", "Engineering", "Languages"]},
                {"label": "Academic Level", "type": "dropdown", "options": ["100L", "200L", "300L", "400L", "Postgrad"]},
                {"label": "Department", "type": "dropdown", "options": ["Sciences", "Engineering", "Business", "Humanities", "Law", "Medicine"]},
                {"label": "Session Format", "type": "dropdown", "options": ["Online", "In-Person", "Both"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 2. Exam Preparation
        {
            "subcategory": "Exam Preparation",
            "filters": [
                {"label": "Exam Type", "type": "dropdown", "options": ["Mid-Semester", "End of Semester", "Professional Exam", "WASSCE", "IELTS", "GRE", "GMAT"]},
                {"label": "Subject", "type": "dropdown", "options": ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Computer Science", "Law", "Accounting", "Engineering", "Languages"]},
                {"label": "Urgency", "type": "dropdown", "options": ["This week", "This month", "Flexible"]},
                {"label": "Group or Solo", "type": "dropdown", "options": ["1-on-1", "Group Session"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 3. Event Posters & Flyers
        {
            "subcategory": "Event Posters & Flyers",
            "filters": [
                {"label": "Style", "type": "dropdown", "options": ["Minimalist", "Bold & Colorful", "Hand-Drawn", "Vintage", "Corporate", "Afrocentric"]},
                {"label": "File Format", "type": "dropdown", "options": ["PDF", "PNG", "PSD", "Illustrator"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["24hrs", "2–3 days", "1 week"]},
                {"label": "Software Used", "type": "dropdown", "options": ["Canva", "Photoshop", "Illustrator", "Figma"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 4. Logo Design
        {
            "subcategory": "Logo Design",
            "filters": [
                {"label": "Style", "type": "dropdown", "options": ["Minimalist", "Mascot", "Lettermark", "Abstract", "Vintage"]},
                {"label": "Color Preference", "type": "dropdown", "options": ["Monochrome", "Full Color", "Two-tone"]},
                {"label": "Revisions Included", "type": "dropdown", "options": ["1", "2", "3", "Unlimited"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["24hrs", "3 days", "1 week"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 5. Portfolio Websites
        {
            "subcategory": "Portfolio Websites",
            "filters": [
                {"label": "Tech Stack", "type": "dropdown", "options": ["HTML/CSS", "React", "WordPress", "Wix", "Webflow", "Vue"]},
                {"label": "Pages Included", "type": "dropdown", "options": ["1 page", "3 pages", "5+ pages"]},
                {"label": "Features", "type": "multi_select", "options": ["Contact Form", "Blog", "Gallery", "E-commerce"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["3 days", "1 week", "2 weeks"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 6. App Design
        {
            "subcategory": "App Design",
            "filters": [
                {"label": "Platform", "type": "dropdown", "options": ["Android", "iOS", "Both"]},
                {"label": "Type", "type": "dropdown", "options": ["UI Design only", "Full Development", "Prototype"]},
                {"label": "Tech Stack", "type": "dropdown", "options": ["Flutter", "React Native", "Kotlin", "Swift"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["1 week", "2 weeks", "1 month"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 7. CV Writing
        {
            "subcategory": "CV Writing",
            "filters": [
                {"label": "Industry", "type": "dropdown", "options": ["Tech", "Business", "Medicine", "Engineering", "Arts", "Law", "Education"]},
                {"label": "Academic Level", "type": "dropdown", "options": ["Undergraduate", "Postgrad", "Entry-level Job Seeker"]},
                {"label": "Included", "type": "multi_select", "options": ["CV only", "CV + Cover Letter", "CV + LinkedIn + Cover Letter"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["24hrs", "3 days", "1 week"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 8. Interview Preparation
        {
            "subcategory": "Interview Preparation",
            "filters": [
                {"label": "Interview Type", "type": "dropdown", "options": ["Technical", "HR/Behavioral", "Case Study", "Group Interview"]},
                {"label": "Industry", "type": "dropdown", "options": ["Tech", "Finance", "Consulting", "Healthcare", "NGO", "Government"]},
                {"label": "Session Format", "type": "dropdown", "options": ["Online", "In-Person"]},
                {"label": "Sessions Included", "type": "dropdown", "options": ["1 session", "3 sessions", "5 sessions"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 9. Campus Event Coverage
        {
            "subcategory": "Campus Event Coverage",
            "filters": [
                {"label": "Event Type", "type": "dropdown", "options": ["Graduation", "Conference", "Club Event", "Party", "Sports", "Religious"]},
                {"label": "Deliverables", "type": "dropdown", "options": ["Photos only", "Videos only", "Both"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["Same day", "24hrs", "3 days"]},
                {"label": "Hours of Coverage", "type": "dropdown", "options": ["1hr", "2hrs", "4hrs", "Full day"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 10. Portrait & Headshots
        {
            "subcategory": "Portrait & Headshots",
            "filters": [
                {"label": "Setting", "type": "dropdown", "options": ["Outdoor Campus", "Studio", "Virtual Background"]},
                {"label": "Edited Photos Included", "type": "dropdown", "options": ["5", "10", "20", "Unlimited"]},
                {"label": "Purpose", "type": "dropdown", "options": ["LinkedIn", "CV", "Social Media", "Personal"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["Same day", "24hrs", "3 days"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 11. YouTube Videos
        {
            "subcategory": "YouTube Videos",
            "filters": [
                {"label": "Video Type", "type": "dropdown", "options": ["Tutorial", "Vlog", "Documentary", "Product Review", "Campus Tour"]},
                {"label": "Duration", "type": "dropdown", "options": ["Under 5 mins", "5–10 mins", "10–20 mins", "20+ mins"]},
                {"label": "Included", "type": "dropdown", "options": ["Editing only", "Filming + Editing", "Script + Film + Edit"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["3 days", "1 week", "2 weeks"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 12. Podcast Production
        {
            "subcategory": "Podcast Production",
            "filters": [
                {"label": "Included", "type": "dropdown", "options": ["Recording only", "Editing only", "Full Production"]},
                {"label": "Episode Length", "type": "dropdown", "options": ["Under 15 mins", "15–30 mins", "30–60 mins", "60+ mins"]},
                {"label": "Number of Episodes", "type": "dropdown", "options": ["1", "3", "5", "10+"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["24hrs", "3 days", "1 week"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 13. Music Composition
        {
            "subcategory": "Music Composition",
            "filters": [
                {"label": "Genre", "type": "dropdown", "options": ["Afrobeats", "Gospel", "Highlife", "Classical", "Hip-hop", "R&B", "Spoken Word"]},
                {"label": "Instruments", "type": "multi_select", "options": ["Guitar", "Piano", "Drums", "Full Beat", "Acapella"]},
                {"label": "Duration", "type": "dropdown", "options": ["Under 1 min", "1–3 mins", "3–5 mins", "5+ mins"]},
                {"label": "Usage Rights", "type": "dropdown", "options": ["Personal", "Commercial", "Full Ownership"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 14. Document Translation
        {
            "subcategory": "Document Translation",
            "filters": [
                {"label": "Language Pair", "type": "dropdown", "options": ["French→English", "English→French", "Twi→English", "Arabic→English", "Spanish→English"]},
                {"label": "Document Type", "type": "dropdown", "options": ["Academic", "Legal", "Personal", "Medical", "Business"]},
                {"label": "Word Count", "type": "dropdown", "options": ["Under 500", "500–1000", "1000–3000", "3000+"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["24hrs", "3 days", "1 week"]},
                {"label": "Certified", "type": "dropdown", "options": ["Yes", "No"]},
                {"label": "Rating", "type": "dropdown", "options": ["4.5+", "4.0+", "3.5+"]},
                {"label": "Price", "type": "dropdown", "options": ["Under GH₵50", "GH₵50–100", "GH₵100–200", "GH₵200+"]}
            ]
        },
        # 15. Printing & Binding
        {
            "subcategory": "Printing & Binding",
            "filters": [
                {"label": "Document Type", "type": "dropdown", "options": ["Thesis", "Assignment", "Flyers", "Booklets", "Banners", "ID Cards"]},
                {"label": "Print Color", "type": "dropdown", "options": ["Black & White", "Full Color", "Mixed"]},
                {"label": "Binding Type", "type": "dropdown", "options": ["Spiral", "Hardcover", "Softcover", "Stapled"]},
                {"label": "Paper Size", "type": "dropdown", "options": ["A4", "A3", "A5", "Custom"]},
                {"label": "Delivery", "type": "dropdown", "options": ["Pickup on Campus", "Campus Delivery"]},
                {"label": "Turnaround Time", "type": "dropdown", "options": ["Same day", "24hrs", "3 days"]}
            ]
        }
    ]

    for cat_data in filters_data:
        subcat = cat_data["subcategory"]
        
        # Check if already exists to prevent duplication
        existing = SubcategoryFilterService.get_filters_by_subcategory(db, subcat)
        if existing:
            print(f"Filters for '{subcat}' already exist. Skipping.")
            continue
            
        print(f"Creating filters for '{subcat}'...")
        for i, filter_cfg in enumerate(cat_data["filters"]):
            f_create = SubcategoryFilterCreate(
                subcategory=subcat,
                filter_label=filter_cfg["label"],
                filter_type=filter_cfg["type"],
                filter_options=filter_cfg["options"],
                display_order=i
            )
            SubcategoryFilterService.create_filter(db, f_create)
            
    print("Seed completed successfully!")

if __name__ == "__main__":
    seed()
