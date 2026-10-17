// === 1. KHỞI TẠO VÀ ĐỌC DỮ LIỆU TỪ LOCALSTORAGE / JSON ===
async function loadInitialData() {
    if (!localStorage.getItem('categories')) {
        try {
            const res = await fetch('./data/menu.json');
            const data = await res.json();
            localStorage.setItem('categories', JSON.stringify(data.menu || []));
        } catch(e) {
            console.error("Lỗi đọc file data/menu.json:", e);
        }
    }

    if (!localStorage.getItem('posts')) {
        try {
            const res = await fetch('./data/posts.json');
            const posts = await res.json();
            localStorage.setItem('posts', JSON.stringify(posts || []));
        } catch(e) {
            console.error("Lỗi đọc file data/posts.json:", e);
        }
    }
}

function getPosts() { return JSON.parse(localStorage.getItem('posts')) || []; }
function getCategories() { return JSON.parse(localStorage.getItem('categories')) || []; }

function savePostToStorage(newPost) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === newPost.id);
    if (index >= 0) { posts[index] = newPost; } 
    else { posts.unshift(newPost); }
    localStorage.setItem('posts', JSON.stringify(posts));
}

// === 2. THANH ĐIỀU HƯỚNG (NAVBAR) ===
function renderNavbar() {
    const categories = getCategories();
    const navMenuEl = document.getElementById('navbarMenu');
    const footerCatEl = document.getElementById('footerCategories');

    let navHtml = '';
    let footerHtml = '';

    categories.forEach(cat => {
        navHtml += `<li><a onclick="renderCategory('${cat.id}')" id="nav-${cat.id}">${cat.title}</a></li>`;
        footerHtml += `<li><a onclick="renderCategory('${cat.id}')">${cat.title}</a></li>`;
    });

    navHtml += `<li><a onclick="renderCrawlerPage()" class="btn-crawler">Crawler Page</a></li>`;

    navMenuEl.innerHTML = navHtml;
    footerCatEl.innerHTML = footerHtml;
}

// === 3. TRANG DANH SÁCH BÀI VIẾT THEO CHUYÊN MỤC (TOP 1-2 & XẾP DỌC) ===
function renderCategory(catId = 'home') {
    const app = document.getElementById('appView');
    const posts = getPosts();
    const categories = getCategories();

    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${catId}`);
    if (activeNav) activeNav.classList.add('active');

    let filteredPosts = posts;
    let currentCatTitle = "Trang chủ";

    if (catId !== 'home' && catId !== 'latest') {
        const targetCat = categories.find(c => c.id === catId);
        if (targetCat) currentCatTitle = targetCat.title;
        filteredPosts = posts.filter(p => p.category && (p.category.toLowerCase().includes(catId.toLowerCase()) || p.category.toLowerCase().includes(currentCatTitle.toLowerCase())));
    } else if (catId === 'latest') {
        currentCatTitle = "Tin Mới Nhất";
    }

    // Sắp xếp thời gian giảm dần (Mới -> Cũ)
    filteredPosts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    if (filteredPosts.length === 0) {
        app.innerHTML = `<h2 class="section-title">${currentCatTitle}</h2><p style="margin-top:15px;">Chưa có bài viết nào trong chuyên mục này. Bấm vào <b>Crawler Page</b> để cào thêm bài viết mới!</p>`;
        return;
    }

    // Tách 1 bài lớn + 2 bài nhỏ
    const featuredLarge = filteredPosts[0];
    const featuredSmall = filteredPosts.slice(1, 3);
    const remainingPosts = filteredPosts.slice(3);

    let html = `<h2 class="section-title">${currentCatTitle}</h2>`;

    // Top Section (Grid 1 lớn + 2 nhỏ)
    html += `<div class="featured-grid">`;
    if (featuredLarge) {
        html += `
            <div class="card featured-large" onclick="renderArticleDetail('${featuredLarge.id}')">
                <div class="card-body">
                    <div class="card-category">${featuredLarge.category}</div>
                    <h3 class="card-title">${featuredLarge.title}</h3>
                    <p class="card-excerpt">${featuredLarge.excerpt}</p>
                    <div class="card-meta">Đăng ngày: ${featuredLarge.publishedAt} | Tác giả: ${featuredLarge.author}</div>
                </div>
            </div>
        `;
    }

    html += `<div class="featured-small-group">`;
    featuredSmall.forEach(post => {
        html += `
            <div class="card" onclick="renderArticleDetail('${post.id}')">
                <div class="card-body">
                    <div class="card-category">${post.category}</div>
                    <h4 class="card-title">${post.title}</h4>
                    <div class="card-meta">${post.publishedAt}</div>
                </div>
            </div>
        `;
    });
    html += `</div></div>`;

    // Danh sách bài viết còn lại xếp dọc
    if (remainingPosts.length > 0) {
        html += `<h3 style="margin-bottom: 15px;">Các tin khác</h3><div class="recent-list">`;
        remainingPosts.forEach(post => {
            html += `
                <div class="list-item" onclick="renderArticleDetail('${post.id}')">
                    <div class="list-content">
                        <div class="card-category">${post.category}</div>
                        <h4 style="margin: 5px 0; font-size:16px;">${post.title}</h4>
                        <p style="font-size: 13px; color: #666; margin-bottom: 8px;">${post.excerpt}</p>
                        <span class="card-meta">${post.publishedAt} - Tác giả: ${post.author}</span>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    app.innerHTML = html;
}

// === 4. TRANG CHI TIẾT BÀI VIẾT ===
function renderArticleDetail(postId) {
    const app = document.getElementById('appView');
    const posts = getPosts();
    const article = posts.find(p => p.id === postId);

    if (!article) {
        app.innerHTML = `<h2>Bài viết không tồn tại</h2>`;
        return;
    }

    app.innerHTML = `
        <div class="article-detail">
            <div class="article-header">
                <div class="card-category">${article.category}</div>
                <h1 class="article-title-main">${article.title}</h1>
                <div class="article-meta-info">
                    <span>Tác giả: <b>${article.author}</b></span> |
                    <span>Ngày đăng: ${article.publishedAt}</span> |
                    <span>Nguồn: ${article.source}</span>
                </div>
            </div>
            ${article.excerpt ? `<p class="article-excerpt-main">${article.excerpt}</p>` : ''}
            <div class="article-content-body">${article.content}</div>
            <br><hr><br>
            <a href="${article.url}" target="_blank" style="color: #008837; font-weight: bold;">[Xem bài viết gốc trên Dantri]</a>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === 5. TRANG CRAWLER PAGE ===
function renderCrawlerPage() {
    const app = document.getElementById('appView');
    app.innerHTML = `
        <div class="crawler-box">
            <h2 class="section-title">Chức năng Crawler Bài viết</h2>
            <p style="margin-bottom: 15px;">Nhập URL bài viết từ website Dantri.com.vn để tự động bóc tách dữ liệu:</p>
            
            <div class="form-group">
                <label for="crawlUrl">Đường dẫn bài viết (URL):</label>
                <input type="text" id="crawlUrl" placeholder="https://dantri.com.vn/bat-dong-san/ha-noi-tinh-co-che-boi-thuong-dat-dac-biet-cho-7-du-an-duong-sat-20260928122246655.htm">
            </div>
            <button class="btn-submit" onclick="handleCrawl()">Bắt đầu Cào Dữ Liệu</button>

            <div id="crawlerStatus" style="margin-top: 15px; font-weight: bold;"></div>
            <div id="jsonPreviewContainer" style="display:none;">
                <h3 style="margin-top: 20px;">Kết quả JSON Trích xuất:</h3>
                <pre class="json-preview" id="jsonPreview"></pre>
                <button class="btn-submit" style="background: #28a745; margin-top: 15px;" onclick="saveCrawledArticle()">Lưu Bài Viết Vào LocalStorage</button>
            </div>
        </div>
    `;
}

let tempCrawledPost = null;

async function handleCrawl() {
    const urlInput = document.getElementById('crawlUrl').value.trim();
    const statusEl = document.getElementById('crawlerStatus');
    const previewContainer = document.getElementById('jsonPreviewContainer');
    const jsonPreview = document.getElementById('jsonPreview');

    if (!urlInput) { alert("Vui lòng nhập URL!"); return; }

    statusEl.style.color = "orange";
    statusEl.innerText = "Đang cào dữ liệu bài viết...";
    previewContainer.style.display = "none";

    // Gọi hàm getArticle từ file js/crawler.js
    const result = await getArticle(urlInput);

    if (result) {
        tempCrawledPost = result;
        statusEl.style.color = "green";
        statusEl.innerText = "Trích xuất bài viết thành công!";
        jsonPreview.innerText = JSON.stringify(result, null, 2);
        previewContainer.style.display = "block";
    } else {
        statusEl.style.color = "red";
        statusEl.innerText = "Không thể cào bài viết. Vui lòng kiểm tra lại URL!";
    }
}

function saveCrawledArticle() {
    if (tempCrawledPost) {
        savePostToStorage(tempCrawledPost);
        alert("Đã lưu bài viết vào LocalStorage!");
        renderCategory('home');
    }
}

// KHỞI CHẠY TỰ ĐỘNG
window.onload = async function() {
    await loadInitialData();
    renderNavbar();
    renderCategory('home');
};
