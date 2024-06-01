document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input');
  const uploadForm = document.getElementById('upload-form');
  const originalImageContainer = document.getElementById('original-image');
  const convertButton = document.getElementById('convert-button');
  const asciiArtContainer = document.getElementById('ascii-art');
  const uploadButton = document.getElementById('upload-button');
  const downloadButtonContainer = document.getElementById('download-button-container');
  const downloadTxtOption = document.getElementById('download-txt-option');
  const downloadPngOption = document.getElementById('download-png-option');
  const resetButton = document.getElementById('reset-button');
  let asciiArt = '';

  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        originalImageContainer.innerHTML = `<img src="${e.target.result}" alt="Original Image">`;
        convertButton.disabled = false;
        uploadButton.style.display = 'none';
        resetButton.style.display = 'inline-block';
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
      asciiArt = data;
      asciiArtContainer.innerHTML = `<pre>${asciiArt}</pre>`;
      downloadButtonContainer.style.display = 'inline-block';
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  convertButton.addEventListener('click', function () {
    uploadForm.dispatchEvent(new Event('submit'));
  });

  downloadTxtOption.addEventListener('click', function (event) {
    event.preventDefault();
    const blob = new Blob([asciiArt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  downloadPngOption.addEventListener('click', function (event) {
    event.preventDefault();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const lineHeight = 10;
    const lines = asciiArt.split('\n');
    const fontSize = 10;
    canvas.width = lines[0].length * fontSize;
    canvas.height = lines.length * lineHeight;
    context.font = `${fontSize}px monospace`;
    context.fillStyle = '#000';
    lines.forEach((line, index) => {
      context.fillText(line, 0, (index + 1) * lineHeight);
    });
    canvas.toBlob(function (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ascii-art.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  resetButton.addEventListener('click', function () {
    fileInput.value = '';
    originalImageContainer.innerHTML = '';
    asciiArtContainer.innerHTML = '';
    convertButton.disabled = true;
    uploadButton.style.display = 'inline-block';
    downloadButtonContainer.style.display = 'none';
    resetButton.style.display = 'none';
  });
});
