class RichTextEditor {
  constructor(container) {
    this.container = container;
    this.editor = null;
    this.toolbar = null;
    this.content = null;
    this.isAdminMode = container.classList.contains('admin-mode');
    this.init();
  }

  init() {
    if (this.isAdminMode) {
      this.createToolbar();
      this.createEditor();
      this.bindEvents();
    }
    // For readonly mode, the content is already rendered by Liquid
  }

  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'rich-text-toolbar';
    
    const buttons = [
      { command: 'bold', icon: 'B', title: 'Bold' },
      { command: 'italic', icon: 'I', title: 'Italic' },
      { command: 'underline', icon: 'U', title: 'Underline' },
      { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
      { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
      { command: 'formatBlock', value: 'h2', icon: 'H2', title: 'Heading 2' },
      { command: 'formatBlock', value: 'h3', icon: 'H3', title: 'Heading 3' },
      { command: 'formatBlock', value: 'p', icon: 'P', title: 'Paragraph' },
      { command: 'createLink', icon: '🔗', title: 'Insert Link' },
      { command: 'removeFormat', icon: '⌫', title: 'Remove Formatting' }
    ];

    buttons.forEach(button => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rich-text-btn';
      btn.innerHTML = button.icon;
      btn.title = button.title;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.executeCommand(button.command, button.value);
        this.updateToolbar();
      });
      this.toolbar.appendChild(btn);
    });

    this.container.appendChild(this.toolbar);
  }

  createEditor() {
    this.content = document.createElement('div');
    this.content.className = 'rich-text-content';
    this.content.contentEditable = true;
    
    // Get initial content from container's data attribute or use default
    const initialContent = this.container.getAttribute('data-content');
    if (initialContent && initialContent.trim() !== '') {
      this.content.innerHTML = initialContent;
    } else {
      this.content.innerHTML = '<p>Start typing your description here...</p>';
    }
    
    this.container.appendChild(this.content);
  }

  executeCommand(command, value = null) {
    document.execCommand(command, false, value);
    this.content.focus();
  }

  bindEvents() {
    this.content.addEventListener('input', () => {
      this.updateToolbar();
    });

    this.content.addEventListener('keydown', (e) => {
      // Handle Enter key for lists
      if (e.key === 'Enter' && this.isInList()) {
        e.preventDefault();
        this.executeCommand('insertOrderedList');
      }
    });

    this.content.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  isInList() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const listItem = range.commonAncestorContainer.closest('li');
    return listItem !== null;
  }

  updateToolbar() {
    const buttons = this.toolbar.querySelectorAll('.rich-text-btn');
    buttons.forEach(btn => {
      btn.classList.remove('active');
    });

    // Update active states
    if (document.queryCommandState('bold')) {
      this.toolbar.querySelector('[title="Bold"]').classList.add('active');
    }
    if (document.queryCommandState('italic')) {
      this.toolbar.querySelector('[title="Italic"]').classList.add('active');
    }
    if (document.queryCommandState('underline')) {
      this.toolbar.querySelector('[title="Underline"]').classList.add('active');
    }
  }

  getContent() {
    return this.content.innerHTML;
  }

  setContent(html) {
    this.content.innerHTML = html;
  }

  focus() {
    this.content.focus();
  }
}

// Initialize rich text editors when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const editors = document.querySelectorAll('.rich-text-editor-container');
  editors.forEach(container => {
    new RichTextEditor(container);
  });
});

// Export for use in other scripts
window.RichTextEditor = RichTextEditor;