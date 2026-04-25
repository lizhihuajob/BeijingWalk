// 轮播图功能
let slideIndex = 1;
let slideInterval;

// 初始化轮播图
function initSlideshow() {
    showSlides(slideIndex);
    startAutoSlide();
}

// 显示当前幻灯片
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    // 隐藏所有幻灯片
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    // 移除所有圆点的active类
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    // 显示当前幻灯片，激活对应的圆点
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
    }
}

// 下一张/上一张按钮
function plusSlides(n) {
    clearInterval(slideInterval);
    showSlides(slideIndex += n);
    startAutoSlide();
}

// 直接跳转到指定幻灯片
function currentSlide(n) {
    clearInterval(slideInterval);
    showSlides(slideIndex = n);
    startAutoSlide();
}

// 自动播放
function startAutoSlide() {
    slideInterval = setInterval(function() {
        plusSlides(1);
    }, 5000); // 每5秒切换一次
}

// 背景音乐播放器功能
function initMusicPlayer() {
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    if (!musicToggle || !bgMusic) return;

    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            musicToggle.style.animation = 'none';
        } else {
            bgMusic.play().catch(function(error) {
                console.log('音频播放需要用户交互:', error);
            });
            musicToggle.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });
}

// 导航栏滚动效果
function initNavigation() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('section[id]');

    // 滚动时改变导航栏样式
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // 高亮当前所在的导航项
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // 平滑滚动到锚点
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 返回顶部按钮
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');

    if (!backToTopBtn) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 北京文化板块 - 卡片悬停效果增强
function initCultureCards() {
    const cultureCards = document.querySelectorAll('.culture-card');

    cultureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        });
    });
}

// 地方特产板块 - 卡片翻转/悬停效果
function initSpecialtyCards() {
    const specialtyCards = document.querySelectorAll('.specialty-card');

    specialtyCards.forEach(card => {
        // 添加点击放大查看效果
        card.addEventListener('click', function() {
            // 创建模态框预览效果
            const image = this.querySelector('.specialty-image img');
            const title = this.querySelector('.specialty-info h3').textContent;
            const description = this.querySelector('.specialty-info p').textContent;
            
            showPreviewModal(image.src, title, description);
        });
    });
}

// 名胜古迹板块 - 侧边栏项目点击切换主图
function initScenicSection() {
    const mainFeatured = document.querySelector('.scenic-featured');
    const sidebarItems = document.querySelectorAll('.scenic-item');

    if (!mainFeatured || sidebarItems.length === 0) return;

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // 获取侧边栏项目的信息
            const img = this.querySelector('img').src;
            const title = this.querySelector('h4').textContent;
            const description = this.querySelector('p').textContent;

            // 更新主图区域
            const mainImg = mainFeatured.querySelector('img');
            const mainTitle = mainFeatured.querySelector('h3');
            const mainDesc = mainFeatured.querySelector('p');

            // 添加切换动画
            mainFeatured.style.opacity = '0';
            mainFeatured.style.transform = 'scale(0.95)';

            setTimeout(() => {
                mainImg.src = img;
                if (mainTitle) mainTitle.textContent = title;
                if (mainDesc) mainDesc.textContent = description;

                mainFeatured.style.opacity = '1';
                mainFeatured.style.transform = 'scale(1)';
            }, 300);

            // 高亮当前选中的侧边栏项目
            sidebarItems.forEach(i => {
                i.style.borderLeft = 'none';
                i.style.background = 'white';
            });
            this.style.borderLeft = '4px solid var(--primary-red)';
            this.style.background = 'linear-gradient(90deg, rgba(196, 30, 58, 0.05), transparent)';
        });
    });
}

// 非物质文化遗产板块 - 卡片悬停效果
function initHeritageItems() {
    const heritageItems = document.querySelectorAll('.heritage-item');

    heritageItems.forEach((item, index) => {
        // 添加入场动画延迟
        item.style.animationDelay = `${index * 0.1}s`;

        // 悬停效果
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.heritage-icon');
            if (icon) {
                icon.style.transform = 'scale(1.3) rotate(10deg)';
            }
        });

        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.heritage-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// 预览模态框功能
function showPreviewModal(imageSrc, title, description) {
    // 检查是否已存在模态框
    let existingModal = document.getElementById('preview-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // 创建模态框
    const modal = document.createElement('div');
    modal.id = 'preview-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow: hidden;
        position: relative;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-red);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    `;

    const modalImage = document.createElement('div');
    modalImage.style.cssText = `
        width: 100%;
        height: 400px;
        overflow: hidden;
    `;

    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
    `;

    const modalInfo = document.createElement('div');
    modalInfo.style.cssText = `
        padding: 30px;
    `;

    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    modalTitle.style.cssText = `
        font-size: 28px;
        color: var(--deep-red);
        margin-bottom: 15px;
        font-family: 'Noto Serif SC', serif;
    `;

    const modalDesc = document.createElement('p');
    modalDesc.textContent = description;
    modalDesc.style.cssText = `
        color: #666;
        line-height: 1.8;
        font-size: 16px;
    `;

    // 组装模态框
    modalImage.appendChild(img);
    modalInfo.appendChild(modalTitle);
    modalInfo.appendChild(modalDesc);
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(modalImage);
    modalContent.appendChild(modalInfo);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 显示动画
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);

    // 关闭功能
    const closeModal = () => {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
        }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 键盘ESC关闭
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播图
    initSlideshow();
    
    // 初始化音乐播放器
    initMusicPlayer();
    
    // 初始化导航
    initNavigation();
    
    // 初始化返回顶部
    initBackToTop();
    
    // 初始化各板块交互
    initCultureCards();
    initSpecialtyCards();
    initScenicSection();
    initHeritageItems();
    
    // 页面加载动画
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // 第一个section立即显示
    if (sections[0]) {
        sections[0].style.opacity = '1';
        sections[0].style.transform = 'translateY(0)';
    }
});

// 导出函数供全局使用
window.plusSlides = plusSlides;
window.currentSlide = currentSlide;
