/**
 * Custom File Upload Handler for Product Forms
 * Handles file upload functionality for custom product forms
 */

class CustomFileUpload {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupFileUploads());
    } else {
      this.setupFileUploads();
    }
  }

  setupFileUploads() {
    // Find all file upload containers
    const fileUploadContainers = document.querySelectorAll('.file-upload-container');
    
    fileUploadContainers.forEach(container => {
      this.setupFileUpload(container);
    });
  }

  setupFileUpload(container) {
    const fileInput = container.querySelector('input[type="file"]');
    const button = container.querySelector('button[type="button"]');
    const fileNameDisplay = container.querySelector('.file-name');
    const errorMessage = document.querySelector('#errorMessage');

    if (!fileInput || !button || !fileNameDisplay) {
      console.warn('File upload elements not found in container:', container);
      return;
    }

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
      this.handleFileSelection(event, fileNameDisplay, errorMessage);
    });

    // Handle button click
    button.addEventListener('click', (event) => {
      event.preventDefault();
      fileInput.click();
    });

    // Add visual feedback
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '0.8';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '1';
    });
  }

  handleFileSelection(event, fileNameDisplay, errorMessage) {
    const files = event.target.files;
    let fileNameText;

    if (files.length === 0) {
      fileNameText = 'No file chosen';
    } else if (files.length === 1) {
      fileNameText = files[0].name;
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
    } else {
      fileNameText = `${files.length} files`;
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
    }

    fileNameDisplay.textContent = fileNameText;

    // Validate file type if accept attribute is present
    const fileInput = event.target;
    if (fileInput.hasAttribute('accept')) {
      this.validateFileType(files, fileInput.getAttribute('accept'));
    }
  }

  validateFileType(files, acceptTypes) {
    const acceptedTypes = acceptTypes.split(',').map(type => type.trim());
    
    for (let file of files) {
      const fileType = file.type;
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      let isValid = false;
      
      for (let acceptedType of acceptedTypes) {
        if (acceptedType.startsWith('.')) {
          // Extension-based validation
          if (fileExtension === acceptedType.substring(1)) {
            isValid = true;
            break;
          }
        } else if (acceptedType.includes('*')) {
          // MIME type with wildcard
          const baseType = acceptedType.split('/')[0];
          if (fileType.startsWith(baseType + '/')) {
            isValid = true;
            break;
          }
        } else if (fileType === acceptedType) {
          // Exact MIME type match
          isValid = true;
          break;
        }
      }
      
      if (!isValid) {
        console.warn(`File ${fileName} is not of an accepted type`);
        // You could show an error message here if needed
      }
    }
  }
}

// Initialize the custom file upload handler
new CustomFileUpload();