from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document, DocumentPage
from .serializers import DocumentSerializer, DocumentListSerializer
from .utils import process_document

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        return DocumentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request):
        file = request.FILES.get('file')
        title = request.data.get('title', file.name if file else 'Untitled')
        
        if not file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determine file type
        file_extension = file.name.split('.')[-1].lower()
        if file_extension not in ['pdf', 'docx']:
            return Response(
                {'error': 'Only PDF and DOCX files are supported'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create document
        document = Document.objects.create(
            title=title,
            file=file,
            file_type=file_extension
        )
        
        print(f"Processing document: {document.id}, file: {document.file.path}")
        
        # Process document
        try:
            success = process_document(document.id)
            
            if not success:
                document.delete()
                return Response(
                    {'error': 'Failed to process document. Check server logs for details.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            serializer = DocumentSerializer(document, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Exception in create view: {str(e)}")
            document.delete()
            return Response(
                {'error': f'Processing error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def pages(self, request, pk=None):
        document = self.get_object()
        serializer = DocumentSerializer(document, context={'request': request})
        return Response(serializer.data)