// ===== Mobile Menu Toggle =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navButtons = document.querySelector('.nav-buttons');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navButtons.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navButtons.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===== Gallery Filter =====
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Set initial active button
    const allButton = document.querySelector('[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');
            console.log('Filter clicked:', filterValue);

            // Filter gallery items
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all') {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else if (itemCategory === filterValue) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Initialize gallery filter when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryFilter);
} else {
    setTimeout(initGalleryFilter, 100);
}

// ===== Form Submission =====
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        comment: formData.get('comment')
    };

    try {
        const response = await fetch('send.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            formMessage.textContent = 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.';
            formMessage.classList.add('success');
            formMessage.classList.remove('error');
            contactForm.reset();
        } else {
            formMessage.textContent = 'Ошибка при отправке формы. Пожалуйста, попробуйте еще раз.';
            formMessage.classList.add('error');
            formMessage.classList.remove('success');
        }
    } catch (error) {
        console.error('Error:', error);
        formMessage.textContent = 'Ошибка при отправке формы. Пожалуйста, попробуйте еще раз.';
        formMessage.classList.add('error');
        formMessage.classList.remove('success');
    }

    // Hide message after 5 seconds
    setTimeout(() => {
        formMessage.classList.remove('success', 'error');
    }, 5000);
});

// ===== Smooth Scroll for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== Scroll Animation for Elements =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards, advantage items, and other elements
document.querySelectorAll('.service-card, .advantage-item, .product-item, .step, .requirement-item, .material-item, .pricing-card').forEach(el => {
    observer.observe(el);
});

// ===== Navbar Background on Scroll =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// ===== Counter Animation =====
const countElements = document.querySelectorAll('.advantage-number');
let hasAnimated = false;

const animateCounters = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    countElements.forEach(el => {
        const target = parseInt(el.textContent);
        let current = 0;
        const increment = target / 30;

        const updateCount = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = target;
            }
        };

        updateCount();
    });
};

// Trigger counter animation when section is visible
const advantagesSection = document.querySelector('.advantages');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (advantagesSection) {
    counterObserver.observe(advantagesSection);
}

// ===== Lazy Loading Images =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== Active Link Highlighting =====
const highlightActiveLink = () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
};

highlightActiveLink();

// ===== Parallax Effect =====
window.addEventListener('scroll', () => {
    const parallaxElements = document.querySelectorAll('.hero-bg-image');
    parallaxElements.forEach(el => {
        let scrollPosition = window.pageYOffset;
        el.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    });
});

// ===== Phone Number Formatting =====
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 6) {
                value = value.slice(0, 3) + ' ' + value.slice(3);
            } else if (value.length <= 9) {
                value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
            } else {
                value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 9) + ' ' + value.slice(9, 11);
            }
        }
        e.target.value = value;
    });
}

// ===== Email Validation =====
const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', (e) => {
        const email = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            e.target.style.borderColor = '#ff6b35';
        } else {
            e.target.style.borderColor = '#333333';
        }
    });
}

// ===== Add Loading State to Form =====
if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    contactForm.addEventListener('submit', () => {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        submitBtn.style.opacity = '0.7';
    });
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        navButtons.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to page
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);

    // Log initialization
    console.log('Expografica website loaded successfully');
});

// ===== Performance Optimization =====
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for frequent events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
    // Scroll event handler
}, 100));


// ===== Gallery Lightbox =====
function initGalleryLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (!lightbox) {
        console.error('Lightbox element not found');
        return;
    }
    
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    function openLightbox(imageSrc, imageTitle) {
        if (lightboxContent && lightboxCaption) {
            lightboxContent.src = imageSrc;
            lightboxCaption.textContent = imageTitle;
            lightbox.style.display = 'flex';
            lightbox.style.visibility = 'visible';
            lightbox.style.opacity = '1';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeLightbox() {
        lightbox.style.display = 'none';
        lightbox.style.visibility = 'hidden';
        lightbox.style.opacity = '0';
        document.body.style.overflow = 'auto';
    }

    galleryItems.forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const overlay = this.nextElementSibling;
            if (overlay) {
                const titleElement = overlay.querySelector('h3');
                const title = titleElement ? titleElement.textContent : 'Image';
                openLightbox(this.src, title);
            }
        });
        
        img.style.cursor = 'pointer';
        img.style.touchAction = 'manipulation';
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeLightbox();
        });
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxCaption) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            closeLightbox();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryLightbox);
} else {
    initGalleryLightbox();
}
