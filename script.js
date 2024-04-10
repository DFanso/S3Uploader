let imageURLs = [];

function uploadImages() {
  const fileInput = document.getElementById('fileInput');
  const files = fileInput.files;
  const domain = document.getElementById('domain').value;
  
  const previewsDiv = document.getElementById('previews');
  previewsDiv.innerHTML = '';
  
  imageURLs = []; // Clear previous URLs
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    const formData = new FormData();
    formData.append('fileName', file.name);
    formData.append('domain', domain);
    formData.append('contentType', file.type);
    
    fetch('https://api.quick-quest.dfanso.dev/v1/s3/generate-presigned-url', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        domain: domain,
        contentType: file.type
      })
    })
    .then(response => response.json())
    .then(data => {
      const presignedUrl = data.presignedUrl;
      const s3url = data.s3url;
      
      imageURLs.push(s3url); // Store the URL
      
      return fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      })
      .then(() => {
        const imagePreview = document.createElement('div');
        imagePreview.classList.add('image-preview');
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy URL';
        copyButton.classList.add('btn', 'btn-secondary');
        copyButton.onclick = () => {
          copyToClipboard(s3url);
        };
        
        imagePreview.appendChild(img);
        imagePreview.appendChild(copyButton);
        
        previewsDiv.appendChild(imagePreview);
      });
    })
    .catch(error => {
      console.error('Error uploading image:', error);
    });
  }
}

function downloadURLs() {
  const text = imageURLs.join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'image_urls.txt';
  link.click();
}

function copyToClipboard(text) {
  const dummy = document.createElement('textarea');
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
  alert('URL copied to clipboard!');
}