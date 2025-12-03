  import React, { useState, useEffect, useRef } from 'react';
  import { Upload, ChevronLeft, ChevronRight, Menu, Book } from 'lucide-react';
  import HTMLFlipBook from 'react-pageflip';

  const API_BASE = 'http://localhost:8000';

  interface DocumentPage {
    id: number;
    page_number: number;
    image: string;
  }

  interface Document {
    id: number;
    title: string;
    file_type: string;
    total_pages: number;
    pages: DocumentPage[];
  }



  const Page = React.forwardRef<HTMLDivElement, { number: number; image: string }>(
    ({ number, image }, ref) => {
      return (
        <div className="page" ref={ref} style={{ width: '100%', height: '100%' }}>
          <div className="h-full w-full flex flex-col bg-gradient-to-br from-amber-50 to-amber-100 p-3">
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <img
                src={image}
                alt={`Page ${number}`}
                className="max-w-full max-h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
            <div className="text-center text-[10px] text-gray-600 font-serif mt-1">
              {number}
            </div>
          </div>
        </div>
      );
    }
  );

  Page.displayName = 'Page';

  export default function BookViewer() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [error, setError] = useState('');
    const [bookReady, setBookReady] = useState(false);
    const bookRef = useRef<any>(null);

    useEffect(() => {
      fetchDocuments();
    }, []);

    useEffect(() => {
      setBookReady(false);
      if ((currentDoc?.pages?.length ?? 0) > 0) {
        setTimeout(() => setBookReady(true), 100);
      }
    }, [currentDoc]);

    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/documents/`);
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        console.error('Error fetching documents:', err);
      }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      setIsUploading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE}/api/documents/`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const newDoc = await response.json();
        await fetchDocuments();
        setCurrentDoc(newDoc);
        setCurrentPage(0);
      } catch (err) {
        setError('Upload failed');
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    };

    const loadDocument = async (docId: number) => {
      try {
        const response = await fetch(`${API_BASE}/api/documents/${docId}/`);
        const data = await response.json();
        setCurrentDoc(data);
        setCurrentPage(0);
        setShowMenu(false);
      } catch (err) {
        console.error('Error loading document:', err);
      }
    };

    const nextPage = () => {
      if (bookRef.current) {
        try {
          bookRef.current.pageFlip().flipNext();
        } catch (e) {
          console.error('Error flipping next:', e);
        }
      }
    };

    const prevPage = () => {
      if (bookRef.current) {
        try {
          bookRef.current.pageFlip().flipPrev();
        } catch (e) {
          console.error('Error flipping prev:', e);
        }
      }
    };

    const goToPage = (pageNum: number) => {
      if (bookRef.current) {
        try {
          bookRef.current.pageFlip().flip(pageNum);
        } catch (e) {
          console.error('Error going to page:', e);
        }
      }
    };

    const onFlip = (e: any) => {
      setCurrentPage(e.data);
    };

    const getTotalPages = () => {
      return currentDoc ? currentDoc.total_pages : 0;
    };

    const getPageNumbers = () => {
      if (!currentDoc) return [];
      
      const totalPages = currentDoc.total_pages;
      const displayPage = currentPage + 1; // Convert 0-based to 1-based
      const pages: number[] = [];
      
      pages.push(1);
      
      if (totalPages > 1) {
        const rangeStart = Math.max(2, displayPage - 1);
        const rangeEnd = Math.min(totalPages, displayPage + 2);
        
        if (rangeStart > 2) {
          pages.push(-1);
        }
        
        for (let i = rangeStart; i <= rangeEnd; i++) {
          if (i !== 1 && i !== totalPages) {
            pages.push(i);
          }
        }
        
        if (rangeEnd < totalPages - 1) {
          pages.push(-2);
        }
        
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col p-4">
        <style>{`
  .page {
    background-color: #fef3c7;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    display: block;
    overflow: hidden;
  }
  
  .page-cover {
    background-color: #fef3c7;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }

  /* RED BOX FRAME */
  .book-frame {
    position: relative;
    overflow: hidden;
  }

  /* Force the flipbook to live INSIDE .book-frame and be centered */
  .demo-book {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
  }

  .demo-book .stf__parent,
  .demo-book .stf__wrapper {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
    margin: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }

  .demo-book .stf__block {
    display: block !important;
  }
`}</style>



        {/* Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="fixed top-6 left-6 z-50 bg-amber-100 hover:bg-amber-200 p-3 rounded-lg shadow-lg transition-all"
        >
          <Menu className="w-6 h-6 text-gray-800" />
        </button>

        {/* Sidebar Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ${
            showMenu ? 'translate-x-0' : '-translate-x-full'
          } overflow-y-auto`}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center gap-2">
              <Book className="w-6 h-6" />
              Document Library
            </h2>

            <div className="mb-6">
              <label className="block w-full cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center">
                <Upload className="w-5 h-5 inline-block mr-2" />
                Upload Document
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <p className="text-amber-300 text-sm mt-2">Uploading...</p>
              )}
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => loadDocument(doc.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    currentDoc?.id === doc.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold truncate">{doc.title}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {doc.total_pages} pages • {doc.file_type.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center overflow-hidden">
          {!currentDoc ? (
            <div className="text-center text-amber-100">
              <Book className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <h1 className="text-3xl font-bold mb-2">Document Viewer</h1>
              <p className="text-lg opacity-75">Upload a document or select from the menu to begin</p>
            </div>
          ) : (
            <>
              {currentDoc.pages && currentDoc.pages.length > 0 && bookReady ? (
                <div className="relative flex flex-col items-center justify-start w-full gap-6 overflow-visible" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                  <div
  className="
    bg-gradient-to-b from-red-700 to-red-800
    rounded-3xl shadow-2xl
    p-6
    book-frame
    w-full max-w-5xl
    h-[70vh]
    flex items-center justify-center
  "
>
  <HTMLFlipBook
    key={currentDoc.id}
    width={350}
    height={450}
    style={{}}
    size="fixed"
    minWidth={250}
    maxWidth={400}
    minHeight={300}
    maxHeight={500}
    maxShadowOpacity={0.5}
    showCover={false}
    mobileScrollSupport={false}
    onFlip={onFlip}
    className="demo-book"
    ref={bookRef}
    usePortrait={false}
    startPage={0}
    drawShadow={true}
    flippingTime={600}
    useMouseEvents={true}
    swipeDistance={30}
    clickEventForward={false}
    startZIndex={0}
    autoSize={false}
    showPageCorners={true}
    disableFlipByClick={false}
  >
    {currentDoc.pages.map((page) => (
      <Page
        key={page.id}
        number={page.page_number}
        image={page.image}
      />
    ))}
  </HTMLFlipBook>
</div>


                
                  {/* Navigation */}
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 0}
                      className="bg-amber-100 hover:bg-amber-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      prev
                    </button>

                    <div className="flex gap-2 items-center">
                      {getPageNumbers().map((num, index) => 
                        num < 0 ? (
                          <span key={`ellipsis-${index}`} className="text-amber-100 px-2">...</span>
                        ) : (
                          <button
                            key={num}
                            onClick={() => goToPage(num - 1)}
                            className={`min-w-[3rem] h-12 px-3 rounded-xl font-bold transition-all ${
                              currentPage === num - 1 ? 'bg-gray-800 text-white' : 'bg-amber-100 hover:bg-amber-200 text-gray-800'
                            }`}
                          >
                            {num}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={currentPage >= getTotalPages() - 1}
                      className="bg-amber-100 hover:bg-amber-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center text-amber-100">
                    <h2 className="text-xl font-semibold">{currentDoc.title}</h2>
                    <p className="text-sm opacity-75">
                      {currentPage === 0 ? 'Cover Page' : `Page ${currentPage} of ${currentDoc.total_pages}`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-amber-100 py-12">
                  <p className="text-xl">Processing document...</p>
                  <p className="text-sm opacity-75 mt-2">Please wait while pages are being generated</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }