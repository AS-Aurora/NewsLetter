from pdf2image import convert_from_path
from PIL import Image
import os
from django.conf import settings
from .models import Document, DocumentPage
from docx2pdf import convert
import tempfile

POPPLER_PATH = r'C:\poppler-25.11.0\Library\bin'

def docx_to_pdf(docx_path):
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_pdf_path = temp_pdf.name
    temp_pdf.close()
    
    try:
        # Converting DOCX to PDF using docx2pdf
        convert(docx_path, temp_pdf_path)
        return temp_pdf_path
    except Exception as e:
        print(f"Error converting DOCX to PDF: {str(e)}")
        if os.path.exists(temp_pdf_path):
            os.unlink(temp_pdf_path)
        raise

def process_document(document_id):
    document = Document.objects.get(id=document_id)
    file_path = document.file.path
    
    images = []
    temp_pdf_path = None
    
    try:
        if document.file_type == 'pdf':
            images = convert_from_path(file_path, dpi=150, poppler_path=POPPLER_PATH)
        
        elif document.file_type == 'docx':
            temp_pdf_path = docx_to_pdf(file_path)
            images = convert_from_path(temp_pdf_path, dpi=150, poppler_path=POPPLER_PATH)
        
        document.total_pages = len(images)
        document.save()
        
        for idx, img in enumerate(images):
            page_number = idx + 1
            
            page_dir = os.path.join(settings.MEDIA_ROOT, 'pages')
            os.makedirs(page_dir, exist_ok=True)
            
            image_filename = f'doc_{document.id}_page_{page_number}.jpg'
            image_path = os.path.join(page_dir, image_filename)
            
            img.save(image_path, 'JPEG', quality=85)
            
            DocumentPage.objects.create(
                document=document,
                page_number=page_number,
                image=f'pages/{image_filename}'
            )
        
        print(f"Successfully processed document {document.id} with {len(images)} pages")
        return True
    
    except Exception as e:
        print(f"Error processing document {document.id}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Cleaning up temporary PDF file if it was created
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.unlink(temp_pdf_path)
            except Exception as e:
                print(f"Warning: Could not delete temp PDF file: {str(e)}")