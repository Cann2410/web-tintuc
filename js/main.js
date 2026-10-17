function renderCategory(catId = 'home') {
    const app = document.getElementById('appView');
    const posts = getPosts();
    const categories = getCategories();

    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${catId}`);
    if (activeNav) activeNav.classList.add('active');

    let filteredPosts = posts;
    let currentCatTitle = "Tin mới nhất";

    if (catId !== 'home' && catId !== 'latest') {
        const targetCat = categories.find(c => c.id === catId);
        if (targetCat) currentCatTitle = targetCat.title;
        filteredPosts = posts.filter(p => {
            if (!p.category) return false;
            return p.category.toLowerCase().includes(catId.toLowerCase()) || 
                   p.category.toLowerCase().includes(currentCatTitle.toLowerCase());
        });
    }

    filteredPosts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    if (filteredPosts.length === 0) {
        app.innerHTML = `<h2 class="section-title">${currentCatTitle}</h2><p style="margin-top:15px;">Chưa có bài viết nào trong chuyên mục này.</p>`;
        return;
    }

    const featuredLarge = filteredPosts[0];
    const featuredSmall = filteredPosts.slice(1, 4); // 3 bài nhỏ cho cột phải
    const tamDiemPost = filteredPosts[4] || filteredPosts[1]; // Bài Tâm điểm
    const remainingPosts = filteredPosts.slice(5);

    let html = `<h2 class="section-title">${currentCatTitle}</h2>`;

    // GRID NỔI BẬT (TRÁI: BÀI LỚN, PHẢI: 3 BÀI NHỎ + 1 BÀI TÂM ĐIỂM)
    html += `<div class="featured-grid">`;

    // CỘT BÊN TRÁI
    if (featuredLarge) {
        const defaultImg = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop";
        html += `
            <div class="featured-large" onclick="renderArticleDetail('${featuredLarge.id}')">
                <img src="${featuredLarge.thumbnail || defaultImg}" class="card-img-large" alt="thumb">
                <h3 class="card-title">${featuredLarge.title}</h3>
                <p class="card-excerpt">${featuredLarge.excerpt}</p>
            </div>
        `;
    }

    // CỘT BÊN PHẢI
    html += `<div class="featured-right-col">`;

    // 3 BÀI NHỎ
    featuredSmall.forEach(post => {
        const defaultImgSmall = "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop";
        html += `
            <div class="right-small-item" onclick="renderArticleDetail('${post.id}')">
                <h4 class="item-title">${post.title}</h4>
                <img src="${post.thumbnail || defaultImgSmall}" class="item-img" alt="thumb">
            </div>
        `;
    });

    // 1 BÀI TÂM ĐIỂM
    if (tamDiemPost) {
        const avatarImg = tamDiemPost.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop";
        html += `
            <div class="tam-diem-box" onclick="renderArticleDetail('${tamDiemPost.id}')">
                <span class="tam-diem-badge">Tâm điểm</span>
                <div class="tam-diem-content">
                    <h4 class="tam-diem-title">${tamDiemPost.title}</h4>
                    <div class="tam-diem-author-box">
                        <img src="${avatarImg}" class="tam-diem-avatar" alt="avatar">
                        <span class="tam-diem-author-name">${tamDiemPost.author || 'Tác giả'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    html += `</div></div>`; // Đóng featured-right-col và featured-grid

    // CÁC BÀI VIẾT CÒN LẠI XẾP DỌC BÊN DƯỚI
    if (remainingPosts.length > 0) {
        html += `<h3 style="margin: 25px 0 15px; font-size:20px; font-weight:bold;">Các tin khác</h3><div class="recent-list">`;
        remainingPosts.forEach(post => {
            html += `
                <div class="list-item" onclick="renderArticleDetail('${post.id}')">
                    ${post.thumbnail ? `<img src="${post.thumbnail}" class="list-item-img" alt="thumb">` : ''}
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
