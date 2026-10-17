/**
 * MD to PDF Converter - Core Application Logic
 * 100% Client-Side Local Execution (Zero Server Communication)
 */

(function () {
  'use strict';

  // State Management
  const state = {
    fileName: 'document.md',
    rawMarkdown: '',
    viewMode: 'preview', // 'preview' | 'split' | 'editor'
    zoomLevel: 100,
    settings: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      fontSize: 15,
      lineHeight: 1.7,
      paperFormat: 'a4', // 'a4' | 'letter' | 'a3'
      marginSize: '20mm',
      theme: 'theme-clean-white',
      showHeader: true,
      showFooter: true,
      customTitle: '',
    }
  };

  // DOM Elements Cache
  const elements = {
    // Inputs & Upload
    fileInput: document.getElementById('file-input'),
    btnUpload: document.getElementById('btn-upload'),
    btnLoadSample: document.getElementById('btn-load-sample'),
    btnNewDoc: document.getElementById('btn-new-doc'),
    dropOverlay: document.getElementById('drop-overlay'),
    
    // Actions
    btnExportPdf: document.getElementById('btn-export-pdf'),
    btnPrintPdf: document.getElementById('btn-print-pdf'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnToggleUiTheme: document.getElementById('btn-toggle-ui-theme'),
    btnHelp: document.getElementById('btn-help'),
    
    // Layout
    sidebar: document.getElementById('settings-sidebar'),
    editorPane: document.getElementById('editor-pane'),
    previewPane: document.getElementById('preview-pane'),
    editorTextarea: document.getElementById('editor-textarea'),
    documentSheetWrapper: document.getElementById('document-sheet-wrapper'),
    documentSheet: document.getElementById('document-sheet'),
    markdownBody: document.getElementById('markdown-body'),
    emptyPlaceholder: document.getElementById('empty-placeholder'),
    
    // Document Banners
    docHeaderBanner: document.getElementById('doc-header-banner'),
    docFooterBanner: document.getElementById('doc-footer-banner'),
    headerDocTitle: document.getElementById('header-doc-title'),
    headerDocDate: document.getElementById('header-doc-date'),
    footerDocInfo: document.getElementById('footer-doc-info'),

    // Settings Controls
    selectFontFamily: document.getElementById('setting-font-family'),
    rangeFontSize: document.getElementById('setting-font-size'),
    labelFontSize: document.getElementById('label-font-size'),
    rangeLineHeight: document.getElementById('setting-line-height'),
    labelLineHeight: document.getElementById('label-line-height'),
    selectPaperFormat: document.getElementById('setting-paper-format'),
    segmentMargins: document.querySelectorAll('[data-margin]'),
    segmentThemes: document.querySelectorAll('[data-theme]'),
    toggleHeader: document.getElementById('toggle-show-header'),
    toggleFooter: document.getElementById('toggle-show-footer'),
    inputCustomTitle: document.getElementById('setting-custom-title'),
    
    // Toolbar & Status
    activeFileName: document.getElementById('active-file-name'),
    viewTabs: document.querySelectorAll('.view-tab-btn'),
    btnZoomIn: document.getElementById('btn-zoom-in'),
    btnZoomOut: document.getElementById('btn-zoom-out'),
    btnZoomReset: document.getElementById('btn-zoom-reset'),
    zoomLevelText: document.getElementById('zoom-level-text'),
    statCharCount: document.getElementById('stat-char-count'),
    statWordCount: document.getElementById('stat-word-count'),
    statReadingTime: document.getElementById('stat-reading-time'),

    // Toast & Modal
    toastContainer: document.getElementById('toast-container'),
    helpModal: document.getElementById('help-modal'),
    btnCloseHelpModal: document.getElementById('btn-close-help-modal'),
    btnModalDismiss: document.getElementById('btn-modal-dismiss')
  };

  // Sample Markdown Document
  const SAMPLE_MARKDOWN = `# 마크다운 문서 (PDF 변환 미리보기)

이 웹앱은 사용자가 업로드한 **Markdown(*.md)** 파일을 읽고, 설정한 **폰트와 글자 크기, 여백, 스타일을 그대로 유지**하여 고품질 **PDF로 저장**해 주는 순수 클라이언트 도구입니다.

> 🔒 **100% 로컬 보안 보장**  
> 모든 파일 데이터는 사용자의 웹 브라우저 메모리 안에서만 처리되며, 어떠한 외부 서버나 외부 서비스로도 절대 전송되지 않습니다.

---

## 1. 주요 기능 안내

1. **다양한 한글 폰트 지원**
   - Pretendard (모던 고딕)
   - Noto Sans KR (본고딕)
   - Noto Serif KR (본명조)
   - 나눔명조 (Nanum Myeongjo)
   - 시스템 기본 폰트
2. **자유로운 스타일 커스텀**
   - 글자 크기 (12px ~ 24px) 정밀 조절
   - 줄 간격 (1.3 ~ 2.2) 조절
   - 용지 여백 (좁게, 보통, 넓게) 및 용지 규격 (A4, Letter, A3) 선택
   - 가독성 높은 테마 (클린 화이트, 서적 세피아, 모던 슬레이트, 학술 세리프)
3. **두 가지 PDF 저장 방식**
   - ⚡ **빠른 원클릭 PDF 다운로드**: 파일 생성 후 바로 브라우저 다운로드 폴더로 저장.
   - 🖨️ **고화질 벡터 인쇄/PDF 저장**: 텍스트 복사/검색이 가능한 고해상도 PDF 출력 (A4 최적화).

---

## 2. 서식 및 표(Table) 렌더링

| 기능 항목 | 지원 여부 | 설명 |
| :--- | :---: | :--- |
| **순수 로컬 파싱** | ✅ 지원 | 서버 전송 없이 메모리에서 즉시 렌더링 |
| **코드 블록 하이라이트** | ✅ 지원 | 구문 강조 및 들여쓰기 완벽 보존 |
| **체크리스트 & 인용구** | ✅ 지원 | 할 일 목록 및 스타일링된 인용 박스 |
| **인쇄 페이지 분할 방지** | ✅ 지원 | 표와 코드블록이 중간에 잘리지 않도록 보호 |

### 체크리스트 예시
- [x] Markdown 파일 드래그 & 드롭으로 업로드하기
- [x] 좌측 설정 패널에서 마음에 드는 폰트와 글자 크기 지정하기
- [ ] 상단의 [PDF로 저장] 또는 [인쇄] 버튼을 눌러 결과 확인하기

---

## 3. 코드 블록 예시 (JavaScript)

\`\`\`javascript
// 100% 클라이언트 사이드 파일 리더
function readLocalFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const markdownContent = event.target.result;
    console.log("로컬 메모리 로드 완료! 외부 통신 없음.");
    renderMarkdown(markdownContent);
  };
  reader.readAsText(file, "UTF-8");
}
\`\`\`

---

## 4. 인용구 및 수식/기호
> *"단순함은 궁극의 정교함이다."*  
> — 레오나르도 다 빈치

수학적 표현: $E = mc^2$, $a^2 + b^2 = c^2$ 등 문서 내 다양한 특수문자 및 기호가 깨끗하게 표현됩니다.
`;

  /* ==========================================================================
     Application Initialization
     ========================================================================== */
  function init() {
    loadSettingsFromStorage();
    setupMarkedParser();
    setupEventListeners();
    updateThemeStyles();
    updateSheetDimensions();
    
    // Load default sample markdown to give immediate visual feedback
    loadMarkdownText(SAMPLE_MARKDOWN, 'sample_guide.md');
    showToast('환영합니다! 마크다운 파일을 업로드하거나 편집해 보세요.', 'info');
  }

  /* ==========================================================================
     Markdown Parser Setup (with Fallback)
     ========================================================================== */
  function setupMarkedParser() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
        highlight: function (code, lang) {
          if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (e) {
              console.warn('Highlight.js error:', e);
            }
          }
          return code;
        }
      });
    }
  }

  // Fallback simple markdown parser if marked CDN is unreachable
  function fallbackParseMarkdown(md) {
    if (!md) return '';
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n$/gim, '<br />');
    return html;
  }

  function renderMarkdownToHtml(mdText) {
    if (typeof marked !== 'undefined') {
      return marked.parse(mdText);
    } else {
      return fallbackParseMarkdown(mdText);
    }
  }

  /* ==========================================================================
     Document Loading & Rendering (100% Client Memory)
     ========================================================================== */
  function loadMarkdownText(content, fileName = 'untitled.md') {
    state.rawMarkdown = content;
    state.fileName = fileName;

    // Update Textarea and Active File indicator
    elements.editorTextarea.value = content;
    elements.activeFileName.textContent = fileName;
    elements.headerDocTitle.textContent = state.settings.customTitle || fileName.replace(/\.[^/.]+$/, '');
    elements.headerDocDate.textContent = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    elements.footerDocInfo.textContent = `${fileName} • MD to PDF Converter`;

    // Render Preview
    renderDocument();
    updateDocumentStats();
  }

  function renderDocument() {
    if (!state.rawMarkdown.trim()) {
      elements.markdownBody.innerHTML = '';
      elements.emptyPlaceholder.style.display = 'flex';
      return;
    }

    elements.emptyPlaceholder.style.display = 'none';
    const html = renderMarkdownToHtml(state.rawMarkdown);
    elements.markdownBody.innerHTML = html;

    // Apply Highlight.js to any newly inserted code blocks
    if (typeof hljs !== 'undefined') {
      elements.markdownBody.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }

    // Enhance task list checkboxes
    elements.markdownBody.querySelectorAll('li').forEach((li) => {
      const text = li.innerHTML;
      if (text.startsWith('[ ] ')) {
        li.classList.add('task-list-item');
        li.innerHTML = '<input type="checkbox" disabled /> ' + text.substring(4);
      } else if (text.startsWith('[x] ') || text.startsWith('[X] ')) {
        li.classList.add('task-list-item');
        li.innerHTML = '<input type="checkbox" checked disabled /> ' + text.substring(4);
      }
    });
  }

  function handleFileSelection(file) {
    if (!file) return;

    // Strict client-side verification
    if (!file.name.match(/\.(md|markdown|txt)$/i)) {
      showToast('마크다운 파일(*.md, *.markdown, *.txt)만 업로드 가능합니다.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      loadMarkdownText(text, file.name);
      showToast(`'${file.name}' 파일을 로컬 메모리에 불러왔습니다.`, 'success');
    };
    reader.onerror = function () {
      showToast('파일을 읽는 도중 오류가 발생했습니다.', 'danger');
    };

    // Read directly into client memory as UTF-8 text
    reader.readAsText(file, 'UTF-8');
  }

  /* ==========================================================================
     Document Stats Calculator
     ========================================================================== */
  function updateDocumentStats() {
    const text = state.rawMarkdown || '';
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    // Average reading speed: ~200-250 words per minute
    const readingMinutes = Math.max(1, Math.ceil(words / 200));

    elements.statCharCount.textContent = `${charCount.toLocaleString()}자`;
    elements.statWordCount.textContent = `${words.toLocaleString()}단어`;
    elements.statReadingTime.textContent = `약 ${readingMinutes}분`;
  }

  /* ==========================================================================
     Style & Settings Controllers
     ========================================================================== */
  function applyStylesToDocument() {
    const doc = elements.documentSheet;
    const root = document.documentElement;

    // Font Family
    doc.style.setProperty('--doc-font-family', state.settings.fontFamily);
    
    // Font Size & Line Height
    doc.style.setProperty('--doc-font-size', `${state.settings.fontSize}px`);
    doc.style.setProperty('--doc-line-height', state.settings.lineHeight);

    // Padding (Page Margin)
    doc.style.setProperty('--doc-page-padding', state.settings.marginSize);

    // Header & Footer visibility
    if (state.settings.showHeader) {
      elements.docHeaderBanner.classList.add('active');
    } else {
      elements.docHeaderBanner.classList.remove('active');
    }

    if (state.settings.showFooter) {
      elements.docFooterBanner.classList.add('active');
    } else {
      elements.docFooterBanner.classList.remove('active');
    }

    // Title override
    if (state.settings.customTitle.trim()) {
      elements.headerDocTitle.textContent = state.settings.customTitle.trim();
    } else {
      elements.headerDocTitle.textContent = state.fileName.replace(/\.[^/.]+$/, '');
    }

    // Theme Class
    doc.className = `document-sheet ${state.settings.theme} format-${state.settings.paperFormat}`;

    // Save preferences
    saveSettingsToStorage();
  }

  function updateSheetDimensions() {
    elements.documentSheet.classList.remove('format-a4', 'format-letter', 'format-a3');
    elements.documentSheet.classList.add(`format-${state.settings.paperFormat}`);
  }

  function updateThemeStyles() {
    applyStylesToDocument();
  }

  /* ==========================================================================
     View Modes & Zoom
     ========================================================================== */
  function setViewMode(mode) {
    state.viewMode = mode;
    
    elements.viewTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    if (mode === 'preview') {
      elements.editorPane.classList.remove('visible');
      elements.previewPane.style.display = 'flex';
    } else if (mode === 'split') {
      elements.editorPane.classList.add('visible');
      elements.previewPane.style.display = 'flex';
    } else if (mode === 'editor') {
      elements.editorPane.classList.add('visible');
      elements.previewPane.style.display = 'none';
    }
  }

  function setZoom(newZoom) {
    const clamped = Math.min(175, Math.max(50, newZoom));
    state.zoomLevel = clamped;
    elements.zoomLevelText.textContent = `${clamped}%`;
    elements.documentSheetWrapper.style.transform = `scale(${clamped / 100})`;
  }

  /* ==========================================================================
     PDF Export & Print Handlers
     ========================================================================== */

  // 1. One-Click Direct PDF Download (html2pdf.js)
  async function exportDirectPdf() {
    if (!state.rawMarkdown.trim()) {
      showToast('PDF로 저장할 문서 내용이 없습니다.', 'warning');
      return;
    }

    const baseName = state.fileName.replace(/\.[^/.]+$/, '') || 'document';
    const outputFilename = `${baseName}.pdf`;

    showToast('PDF 문서를 생성하고 있습니다...', 'info');

    // If html2pdf library is loaded
    if (typeof html2pdf !== 'undefined') {
      // Temporarily set scale to 1 for high-res crisp capture
      const currentScale = elements.documentSheetWrapper.style.transform;
      elements.documentSheetWrapper.style.transform = 'none';

      const opt = {
        margin: 0,
        filename: outputFilename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: state.settings.paperFormat === 'letter' ? 'letter' : (state.settings.paperFormat === 'a3' ? 'a3' : 'a4'),
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: ['pre', 'table', 'h1', 'h2', 'h3', 'blockquote', 'img']
        }
      };

      try {
        await html2pdf().set(opt).from(elements.documentSheet).save();
        showToast(`'${outputFilename}' 저장이 완료되었습니다!`, 'success');
      } catch (err) {
        console.error('html2pdf generation error:', err);
        showToast('PDF 직접 생성 중 오류가 발생하여 고화질 인쇄 모드로 전환합니다.', 'warning');
        window.print();
      } finally {
        elements.documentSheetWrapper.style.transform = currentScale;
      }
    } else {
      // Direct print fallback
      printDocument();
    }
  }

  // 2. High-Quality Vector Print / Save as PDF (window.print())
  function printDocument() {
    if (!state.rawMarkdown.trim()) {
      showToast('인쇄할 문서 내용이 없습니다.', 'warning');
      return;
    }

    // Set page title temporarily so browser defaults PDF filename to this
    const oldTitle = document.title;
    const baseName = state.fileName.replace(/\.[^/.]+$/, '') || 'document';
    document.title = baseName;

    // Call browser's native print engine
    window.print();

    // Restore title after dialog closes
    setTimeout(() => {
      document.title = oldTitle;
    }, 1000);
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */
  function setupEventListeners() {
    // File Upload via Button
    elements.btnUpload.addEventListener('click', () => {
      elements.fileInput.value = '';
      elements.fileInput.click();
    });

    elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });

    // Sample Document Button
    elements.btnLoadSample.addEventListener('click', () => {
      loadMarkdownText(SAMPLE_MARKDOWN, 'sample_guide.md');
      showToast('샘플 가이드 문서를 불러왔습니다.', 'info');
    });

    // New Document
    elements.btnNewDoc.addEventListener('click', () => {
      loadMarkdownText('# 새 문서\n\n내용을 여기에 입력하세요...', 'new_document.md');
      setViewMode('split');
      elements.editorTextarea.focus();
    });

    // Editor Textarea Live Sync
    elements.editorTextarea.addEventListener('input', (e) => {
      state.rawMarkdown = e.target.value;
      renderDocument();
      updateDocumentStats();
    });

    // Drag and Drop (Zero-network client loading)
    let dragCounter = 0;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      window.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    window.addEventListener('dragenter', (e) => {
      dragCounter++;
      elements.dropOverlay.classList.add('active');
    });

    window.addEventListener('dragleave', (e) => {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        elements.dropOverlay.classList.remove('active');
      }
    });

    window.addEventListener('drop', (e) => {
      dragCounter = 0;
      elements.dropOverlay.classList.remove('active');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelection(dt.files[0]);
      }
    });

    // PDF Actions
    elements.btnExportPdf.addEventListener('click', exportDirectPdf);
    elements.btnPrintPdf.addEventListener('click', printDocument);

    // Sidebar Toggle
    elements.btnToggleSidebar.addEventListener('click', () => {
      elements.sidebar.classList.toggle('collapsed');
    });

    // UI Theme Toggle (App Shell Light/Dark)
    elements.btnToggleUiTheme.addEventListener('click', () => {
      document.body.classList.toggle('light-ui');
      const isLight = document.body.classList.contains('light-ui');
      elements.btnToggleUiTheme.textContent = isLight ? '🌙' : '☀️';
      localStorage.setItem('md_reader_ui_theme', isLight ? 'light' : 'dark');
    });

    // Font Family
    elements.selectFontFamily.addEventListener('change', (e) => {
      state.settings.fontFamily = e.target.value;
      applyStylesToDocument();
    });

    // Font Size
    elements.rangeFontSize.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.settings.fontSize = val;
      elements.labelFontSize.textContent = `${val}px`;
      applyStylesToDocument();
    });

    // Line Height
    elements.rangeLineHeight.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.settings.lineHeight = val;
      elements.labelLineHeight.textContent = val.toFixed(1);
      applyStylesToDocument();
    });

    // Paper Format
    elements.selectPaperFormat.addEventListener('change', (e) => {
      state.settings.paperFormat = e.target.value;
      updateSheetDimensions();
      applyStylesToDocument();
    });

    // Margins Segmented Buttons
    elements.segmentMargins.forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.segmentMargins.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.settings.marginSize = btn.dataset.margin;
        applyStylesToDocument();
      });
    });

    // Themes Segmented Buttons
    elements.segmentThemes.forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.segmentThemes.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.settings.theme = btn.dataset.theme;
        applyStylesToDocument();
      });
    });

    // Header & Footer Toggles
    elements.toggleHeader.addEventListener('change', (e) => {
      state.settings.showHeader = e.target.checked;
      applyStylesToDocument();
    });

    elements.toggleFooter.addEventListener('change', (e) => {
      state.settings.showFooter = e.target.checked;
      applyStylesToDocument();
    });

    // Custom Document Title
    elements.inputCustomTitle.addEventListener('input', (e) => {
      state.settings.customTitle = e.target.value;
      applyStylesToDocument();
    });

    // View Mode Tabs
    elements.viewTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        setViewMode(tab.dataset.mode);
      });
    });

    // Zoom Controls
    elements.btnZoomIn.addEventListener('click', () => setZoom(state.zoomLevel + 10));
    elements.btnZoomOut.addEventListener('click', () => setZoom(state.zoomLevel - 10));
    elements.btnZoomReset.addEventListener('click', () => setZoom(100));

    // Help Modal
    elements.btnHelp.addEventListener('click', () => {
      elements.helpModal.classList.add('active');
    });

    const closeHelp = () => elements.helpModal.classList.remove('active');
    elements.btnCloseHelpModal.addEventListener('click', closeHelp);
    elements.btnModalDismiss.addEventListener('click', closeHelp);
    elements.helpModal.addEventListener('click', (e) => {
      if (e.target === elements.helpModal) closeHelp();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printDocument();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportDirectPdf();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        elements.btnUpload.click();
      } else if (e.key === 'Escape') {
        closeHelp();
      }
    });
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ==========================================================================
     Settings Persistence (localStorage)
     ========================================================================== */
  function saveSettingsToStorage() {
    try {
      localStorage.setItem('md_reader_settings', JSON.stringify(state.settings));
    } catch (e) {
      // Ignore quota error if any
    }
  }

  function loadSettingsFromStorage() {
    try {
      // Saved UI Theme
      const savedUiTheme = localStorage.getItem('md_reader_ui_theme');
      if (savedUiTheme === 'light') {
        document.body.classList.add('light-ui');
        elements.btnToggleUiTheme.textContent = '🌙';
      }

      // Saved Document Settings
      const saved = localStorage.getItem('md_reader_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.settings = { ...state.settings, ...parsed };

        // Sync UI inputs with loaded settings
        if (elements.selectFontFamily) elements.selectFontFamily.value = state.settings.fontFamily;
        if (elements.rangeFontSize) {
          elements.rangeFontSize.value = state.settings.fontSize;
          elements.labelFontSize.textContent = `${state.settings.fontSize}px`;
        }
        if (elements.rangeLineHeight) {
          elements.rangeLineHeight.value = state.settings.lineHeight;
          elements.labelLineHeight.textContent = state.settings.lineHeight.toFixed(1);
        }
        if (elements.selectPaperFormat) elements.selectPaperFormat.value = state.settings.paperFormat;
        if (elements.toggleHeader) elements.toggleHeader.checked = state.settings.showHeader;
        if (elements.toggleFooter) elements.toggleFooter.checked = state.settings.showFooter;
        if (elements.inputCustomTitle && state.settings.customTitle) {
          elements.inputCustomTitle.value = state.settings.customTitle;
        }

        // Margin segments
        elements.segmentMargins.forEach((b) => {
          b.classList.toggle('active', b.dataset.margin === state.settings.marginSize);
        });

        // Theme segments
        elements.segmentThemes.forEach((b) => {
          b.classList.toggle('active', b.dataset.theme === state.settings.theme);
        });
      }
    } catch (e) {
      console.warn('Failed to load settings from storage:', e);
    }
  }

  // Boot on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
