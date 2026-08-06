import sys
import traceback
from pdf_generator import create_pdf_from_structured_cv
from schemas import StructuredCV, CVSectionHeader, CVSectionLanguageOther, CVSectionExperience

cv = StructuredCV(
    header=CVSectionHeader(name='Test Name', headline='Headline', location='Loc', phone='123', email='test@test.com', portfolio='', linkedin='', github=''),
    summary='Belajar Dasar AI – Dicoding Indonesia (Jul 2026) “Test”',
    skills=[],
    experience=[CVSectionExperience(role='Developer', company='Company', duration='2020-2021', location='Remote', bullets=['Membuat aplikasi – dengan Python'])],
    projects=[],
    publications=[],
    certifications=[],
    education=[],
    languages_other=CVSectionLanguageOther(languages='Indonesian', other_skills='')
)
try:
    pdf_bytes = create_pdf_from_structured_cv(cv)
    print('PDF GENERATED, size:', len(pdf_bytes.getvalue()))
except Exception as e:
    traceback.print_exc()
