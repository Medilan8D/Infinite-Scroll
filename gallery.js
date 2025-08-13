// gallery.js - Handles gallery logic, infinite scroll, modal, and image actions
const galleryGrid = document.getElementById('gallery-grid');
const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.querySelector('.close');
const likeBtn = document.getElementById('like-btn');
const viewBtn = document.getElementById('view-btn');
const likeCount = document.getElementById('like-count');
const viewCount = document.getElementById('view-count');
const commentList = document.getElementById('comment-list');
const commentInput = document.getElementById('comment-input');
const commentBtn = document.getElementById('comment-btn');

let images = [];
let currentImageId = null;

// Fetch images from backend or placeholder
async function fetchImages() {
    // Placeholder: Use picsum.photos for demo
    for (let i = 0; i < 20; i++) {
        images.push({
            id: 'img_' + (images.length + 1),
            url: `https://picsum.photos/seed/${Math.random().toString(36).substr(2,8)}/400/300`,
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 500),
            comments: []
        });
    }
    renderImages();
}

function renderImages() {
    images.forEach(img => {
        if (document.getElementById(img.id)) return;
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.id = img.id;
        div.innerHTML = `
            <img src="${img.url}" alt="Image">
            <div style="padding:8px;">
                <span>👍 ${img.likes}</span>
                <span style="margin-left:12px;">👁️ ${img.views}</span>
                <span style="margin-left:12px;">💬 ${img.comments.length}</span>
            </div>
        `;
        div.onclick = () => openModal(img.id);
        galleryGrid.appendChild(div);
    });
}

function openModal(id) {
    const img = images.find(im => im.id === id);
    if (!img) return;
    currentImageId = id;
    modalImg.src = img.url;
    likeCount.textContent = img.likes;
    viewCount.textContent = img.views;
    commentList.innerHTML = '';
    img.comments.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c;
        commentList.appendChild(li);
    });
    imageModal.style.display = 'flex';
    // Increment view count
    img.views++;
    viewCount.textContent = img.views;
}

closeBtn.onclick = () => {
    imageModal.style.display = 'none';
    currentImageId = null;
};

likeBtn.onclick = () => {
    if (!currentImageId) return;
    const img = images.find(im => im.id === currentImageId);
    img.likes++;
    likeCount.textContent = img.likes;
};

viewBtn.onclick = () => {
    if (!currentImageId) return;
    const img = images.find(im => im.id === currentImageId);
    img.views++;
    viewCount.textContent = img.views;
};

commentBtn.onclick = () => {
    if (!currentImageId) return;
    const img = images.find(im => im.id === currentImageId);
    const comment = commentInput.value.trim();
    if (comment) {
        img.comments.push(comment);
        const li = document.createElement('li');
        li.textContent = comment;
        commentList.appendChild(li);
        commentInput.value = '';
    }
};

// Infinite scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        fetchImages();
    }
});

// Initial load
fetchImages();
