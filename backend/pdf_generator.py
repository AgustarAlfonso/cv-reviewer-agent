import io
from fpdf import FPDF
from schemas import StructuredCV

class CV_PDF(FPDF):
    pass

def sanitize_text(text: str) -> str:
    """Sanitizes text to be compatible with FPDF's latin-1 encoding."""
    if not text:
        return ""
    replacements = {
        '\u2013': '-', # en dash
        '\u2014': '-', # em dash
        '\u2018': chr(39), # single quotes
        '\u2019': chr(39),
        '\u201c': chr(34), # double quotes
        '\u201d': chr(34),
        '\u2022': chr(149), # bullet
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text.encode('latin-1', 'ignore').decode('latin-1')

def create_pdf_from_structured_cv(cv_data: StructuredCV) -> io.BytesIO:
    # 0.5 inches = 12.7 mm
    pdf = CV_PDF(unit="mm", format="Letter")
    pdf.set_margins(left=12.7, top=12.7, right=12.7)
    pdf.set_auto_page_break(auto=True, margin=12.7)
    pdf.add_page()

    # --- Header ---
    pdf.set_font("Times", style="B", size=14)
    pdf.cell(0, 7, sanitize_text(cv_data.header.name.upper()), align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Times", style="I", size=11)
    pdf.cell(0, 5, sanitize_text(cv_data.header.headline), align="C", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Times", size=11)
    contact_p1 = f"{cv_data.header.location}  |  {cv_data.header.phone}  |  {cv_data.header.email}"
    pdf.cell(0, 5, sanitize_text(contact_p1), align="C", new_x="LMARGIN", new_y="NEXT")
    
    contact_p2 = f"Portfolio: {cv_data.header.portfolio}  |  LinkedIn: {cv_data.header.linkedin}  |  GitHub: {cv_data.header.github}"
    pdf.cell(0, 5, sanitize_text(contact_p2), align="C", new_x="LMARGIN", new_y="NEXT")
    
    def add_section_heading(text: str):
        pdf.ln(3) # space before
        pdf.set_font("Times", style="B", size=12)
        pdf.cell(0, 6, sanitize_text(text), new_x="LMARGIN", new_y="NEXT")
        
        # Draw horizontal line
        x = pdf.get_x()
        y = pdf.get_y()
        pdf.line(x, y, pdf.w - pdf.r_margin, y)
        pdf.ln(1.5) # space after

    def add_bullet_paragraph(text):
        pdf.set_font("Times", size=11)
        pdf.set_x(12.7 + 6.35) # Indent bullet
        pdf.cell(6.35, 5, chr(149)) # Bullet character
        
        x = pdf.get_x()
        w = pdf.w - pdf.r_margin - x
        pdf.multi_cell(w, 5, sanitize_text(text), new_x="LMARGIN", new_y="NEXT")
        pdf.set_x(12.7) # Explicitly reset X back to the standard left margin
        
    # --- Professional Summary ---
    if cv_data.summary:
        add_section_heading("Summary")
        pdf.set_font("Times", size=11)
        pdf.multi_cell(0, 5, sanitize_text(cv_data.summary), new_x="LMARGIN", new_y="NEXT")

    # --- Technical Skills ---
    if cv_data.skills:
        add_section_heading("Technical Skills")
        for skill_cat in cv_data.skills:
            pdf.set_font("Times", style="B", size=11)
            pdf.write(5, sanitize_text(skill_cat.category + ": "))
            pdf.set_font("Times", size=11)
            pdf.write(5, sanitize_text(skill_cat.items) + "\n")

    # --- Experience ---
    if cv_data.experience:
        add_section_heading("Experience")
        for exp in cv_data.experience:
            pdf.set_font("Times", style="B", size=11)
            pdf.cell(0, 5, sanitize_text(exp.role), new_x="LMARGIN", new_y="NEXT")
            
            pdf.set_font("Times", style="I", size=11)
            comp_text = f"{exp.company}  |  {exp.duration}  |  {exp.location}"
            pdf.cell(0, 5, sanitize_text(comp_text), new_x="LMARGIN", new_y="NEXT")
            
            if exp.bullets:
                for bullet in exp.bullets:
                    add_bullet_paragraph(bullet)

    # --- Projects ---
    if cv_data.projects:
        add_section_heading("Projects")
        for proj in cv_data.projects:
            pdf.ln(1)
            pdf.set_font("Times", style="B", size=11)
            pdf.cell(0, 5, sanitize_text(proj.name), new_x="LMARGIN", new_y="NEXT")
            
            pdf.set_font("Times", style="I", size=11)
            tech_text = f"{proj.context}  |  {proj.technologies}  |  {proj.link}"
            pdf.cell(0, 5, sanitize_text(tech_text), new_x="LMARGIN", new_y="NEXT")
            
            if proj.bullets:
                for bullet in proj.bullets:
                    add_bullet_paragraph(bullet)

    # --- Publication ---
    if cv_data.publications:
        add_section_heading("Publication")
        for pub in cv_data.publications:
            pdf.set_font("Times", size=11)
            pdf.multi_cell(0, 5, sanitize_text(pub.citation), new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)

    # --- Certifications ---
    if cv_data.certifications:
        add_section_heading("Certifications")
        for cert in cv_data.certifications:
            add_bullet_paragraph(f"{cert.name} - {cert.issuer}")

    # --- Education ---
    if cv_data.education:
        add_section_heading("Education")
        for edu in cv_data.education:
            pdf.ln(1)
            pdf.set_font("Times", style="B", size=11)
            pdf.cell(0, 5, sanitize_text(edu.institution), new_x="LMARGIN", new_y="NEXT")
            
            pdf.set_font("Times", size=11)
            deg_text = f"{edu.degree}  |  {edu.duration}  |  {edu.gpa}"
            pdf.cell(0, 5, sanitize_text(deg_text), new_x="LMARGIN", new_y="NEXT")

    # --- Languages & Other Skills ---
    if cv_data.languages_other:
        add_section_heading("Languages & Other Skills")
        if cv_data.languages_other.languages:
            pdf.set_font("Times", style="B", size=11)
            pdf.write(5, "Languages: ")
            pdf.set_font("Times", size=11)
            pdf.write(5, sanitize_text(cv_data.languages_other.languages) + "\n")
            
        if cv_data.languages_other.other_skills:
            pdf.set_font("Times", style="B", size=11)
            pdf.write(5, "Other Skills: ")
            pdf.set_font("Times", size=11)
            pdf.write(5, sanitize_text(cv_data.languages_other.other_skills) + "\n")

    # Get output
    output_stream = io.BytesIO()
    pdf_bytes = pdf.output() 
    output_stream.write(pdf_bytes)
    output_stream.seek(0)
    return output_stream
