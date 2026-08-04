import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file provided as bytes.
    
    Args:
        file_bytes (bytes): The contents of the PDF file.
        
    Returns:
        str: The extracted text from the entire PDF.
    """
    text = ""
    try:
        # Open the PDF from memory
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        
        # Iterate through all pages and extract text
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            text += page.get_text("text") + "\n"
            
        pdf_document.close()
        return text.strip()
    except Exception as e:
        # In a real app, you might want to log this error
        raise ValueError(f"Failed to parse PDF file: {str(e)}")
