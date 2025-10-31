from pdf2image import convert_from_path
from PIL import Image, ImageDraw, ImageFont
import os
from django.conf import settings
from .models import Document, DocumentPage
import mammoth
from io import BytesIO

POPPLER_PATH = r'C:\poppler-25.07.0\Library\bin'

def docx_to_images(file_path):
    """Convert DOCX to images by rendering HTML"""
    with open(file_path, 'rb') as docx_file:
        result = mammoth.convert_to_html(docx_file)
        html = result.value

    # Createed a single page image with the text
    from docx import Document as DocxDocument
    doc = DocxDocument(file_path)
    
    images = []
    page_text = []
    
    for para in doc.paragraphs:
        page_text.append(para.text)
        
        if len(page_text) >= 30:
            img = create_text_image('\n'.join(page_text))
            images.append(img)
            page_text = []
    
    # Add remaining text as last page
    if page_text:
        img = create_text_image('\n'.join(page_text))
        images.append(img)
    
    return images

def create_text_image(text, width=800, height=1100):
    """Create an image from text"""
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Use default font
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    # Draw text
    y = 50
    for line in text.split('\n'):
        draw.text((50, y), line, fill='black', font=font)
        y += 25
        if y > height - 50:
            break
    
    return img

def process_document(document_id):
    """Convert document to images and create DocumentPage entries"""
    document = Document.objects.get(id=document_id)
    file_path = document.file.path
    
    images = []
    
    try:
        if document.file_type == 'pdf':
            if POPPLER_PATH and os.path.exists(POPPLER_PATH):
                images = convert_from_path(file_path, dpi=150, poppler_path=POPPLER_PATH)
            else:
                images = convert_from_path(file_path, dpi=150)
        
        elif document.file_type == 'docx':
            images = docx_to_images(file_path)
        
        # Save each page as an image
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