document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input');
    const uploadForm = document.getElementById('upload-form');
    const originalImageContainer = document.getElementById('original-image');
    const convertButton = document.getElementById('convert-button');
    const asciiArtContainer = document.getElementById('ascii-art');
  
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          originalImageContainer.innerHTML = `<img src="${e.target.result}" alt="Original Image">`;
          convertButton.disabled = false;
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    });
  
    uploadForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const formData = new FormData(uploadForm);
      fetch('/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(data => {
        asciiArtContainer.innerHTML = `<pre>${data}</pre>`;
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    convertButton.addEventListener('click', function () {
      uploadForm.dispatchEvent(new Event('submit'));
    });
  });
  