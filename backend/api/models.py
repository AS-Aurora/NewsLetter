from django.db import models

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    file_type = models.CharField(max_length=10)  # 'pdf' or 'docx'
    total_pages = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class DocumentPage(models.Model):
    document = models.ForeignKey(Document, related_name='pages', on_delete=models.CASCADE)
    page_number = models.IntegerField()
    image = models.ImageField(upload_to='pages/')
    
    class Meta:
        ordering = ['page_number']
        unique_together = ['document', 'page_number']
    
    def __str__(self):
        return f"{self.document.title} - Page {self.page_number}"