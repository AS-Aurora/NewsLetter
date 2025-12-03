from rest_framework import serializers
from .models import Document, DocumentPage
from django.conf import settings

class DocumentPageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentPage
        fields = ['id', 'page_number', 'image']
    
    def get_image(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return f'http://localhost:8000{obj.image.url}'

class DocumentSerializer(serializers.ModelSerializer):
    pages = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'file_type', 'total_pages', 'uploaded_at', 'pages']
        read_only_fields = ['file_type', 'total_pages', 'uploaded_at']
    
    def get_pages(self, obj):
        pages = obj.pages.all()
        serializer = DocumentPageSerializer(pages, many=True, context=self.context)
        return serializer.data

class DocumentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file_type', 'total_pages', 'uploaded_at']