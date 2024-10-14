document.addEventListener('DOMContentLoaded', () => {
    const months = document.querySelectorAll('.month');
    const modal = document.getElementById('file-modal');
    const monthTitle = document.getElementById('month-title');
    const closeModal = document.querySelector('.close');
    const fileInput = document.getElementById('file-input');
    const saveFileBtn = document.getElementById('save-file-btn');
    const fileList = document.getElementById('file-list');
    let selectedMonth = '';
    let db; // For IndexedDB

    // Open or create the IndexedDB database
    const request = indexedDB.open('currentAffairsDB', 1);

    request.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('month', 'month', { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };

    // Load files for the selected month from IndexedDB
    function loadFiles() {
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');
        const index = objectStore.index('month');
        const request = index.getAll(selectedMonth);

        request.onsuccess = function(event) {
            const files = event.target.result;
            fileList.innerHTML = '';
            files.forEach((file, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${file.name}</span>
                    <a href="#" data-id="${file.id}" class="view-file">View</a>
                    <button class="delete-file" data-id="${file.id}">Delete</button>
                `;
                fileList.appendChild(li);
            });

            // Add event listeners to view each file
            document.querySelectorAll('.view-file').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const fileId = parseInt(link.getAttribute('data-id'));
                    viewFile(fileId);
                });
            });

            // Add event listeners to delete each file
            document.querySelectorAll('.delete-file').forEach(button => {
                button.addEventListener('click', (e) => {
                    const fileId = parseInt(button.getAttribute('data-id'));
                    deleteFile(fileId);
                });
            });
        };
    }

    // Show modal and set selected month
    months.forEach(month => {
        month.addEventListener('click', () => {
            selectedMonth = month.dataset.month;
            monthTitle.innerText = `Upload Current Affairs for ${selectedMonth}`;
            modal.style.display = 'block';
            loadFiles();
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Save file in IndexedDB
    saveFileBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file && file.size <= 1 * 1024 * 1024 * 1024) { // Check if file size is <= 1GB
            const reader = new FileReader();
            reader.onload = function(e) {
                const transaction = db.transaction(['files'], 'readwrite');
                const objectStore = transaction.objectStore('files');
                const fileData = {
                    name: file.name,
                    data: e.target.result,
                    month: selectedMonth,
                };
                objectStore.add(fileData);

                transaction.oncomplete = function() {
                    console.log('File saved successfully');
                    loadFiles();
                };
            };
            reader.readAsDataURL(file); // Read the file as a base64 string
        } else {
            alert('File is too large or unsupported format.');
        }
    });

    // View file from IndexedDB using Blob
    function viewFile(fileId) {
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.get(fileId);

        request.onsuccess = function(event) {
            const file = event.target.result;
            const link = document.createElement('a');
            const blob = base64ToBlob(file.data);
            const blobUrl = URL.createObjectURL(blob);

            link.href = blobUrl;
            link.download = file.name;
            link.target = '_blank';
            window.open(blobUrl, '_blank'); // Open the file in a new tab
        };
    }

    // Helper function to convert base64 to Blob
    function base64ToBlob(base64) {
        const byteString = atob(base64.split(',')[1]);
        const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        const buffer = new ArrayBuffer(byteString.length);
        const byteArray = new Uint8Array(buffer);
        for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([buffer], { type: mimeString });
    }

    // Delete a file from IndexedDB
    function deleteFile(fileId) {
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.delete(fileId);

        request.onsuccess = function() {
            console.log('File deleted successfully');
            loadFiles();
        };
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });


    /** search files  */

    // Search functionality
    document.getElementById('search-btn').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-box').value.toLowerCase();
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.getAll();

        request.onsuccess = function(event) {
            const files = event.target.result;
            const fileList = files.filter(file => file.name.toLowerCase().includes(searchTerm));

            if (fileList.length > 0) {
                viewFile(fileList[0].id); // Open the first matched file
            } else {
                alert('No files found!');
            }
        };
    });
});

 
