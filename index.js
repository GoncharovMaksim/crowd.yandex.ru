document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initStagesCarousel();
  initParticipantsCarousel();
});

function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {

        const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initStagesCarousel() {
  const track = document.getElementById('stages-carousel-track');
  const slides = Array.from(track.children);
  const nextBtn = document.getElementById('stages-next');
  const prevBtn = document.getElementById('stages-prev');
  const dotsContainer = document.getElementById('stages-dots');
  const dots = Array.from(dotsContainer.children);

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateCarousel() {

    const offset = currentIndex * -100;
    track.style.transform = `translateX(${offset}%)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;

    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  nextBtn.addEventListener('click', () => {
    if (currentIndex < totalSlides - 1) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {

      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateCarousel();
      }
    } else if (touchEndX - touchStartX > swipeThreshold) {

      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }
  }

  updateCarousel();
}

function initParticipantsCarousel() {
  const track = document.getElementById('participants-track');
  const viewport = document.getElementById('participants-viewport');
  const originalCards = Array.from(track.children);
  const totalOriginal = originalCards.length;

  const prevBtn = document.getElementById('participants-prev');
  const nextBtn = document.getElementById('participants-next');
  const counter = document.getElementById('participants-counter');

  const prevBtnMob = document.getElementById('participants-prev-mob');
  const nextBtnMob = document.getElementById('participants-next-mob');
  const counterMob = document.getElementById('participants-counter-mob');

  let itemsPerPage = getItemsPerPage();
  let currentIndex = totalOriginal;
  let isTransitioning = false;
  let autoplayTimer = null;

  originalCards.forEach(card => {
    const cloneEnd = card.cloneNode(true);
    const cloneStart = card.cloneNode(true);
    track.appendChild(cloneEnd);
    track.insertBefore(cloneStart, track.firstChild);
  });

  const allCards = Array.from(track.children);

  function getItemsPerPage() {
    const width = window.innerWidth;
    if (width > 1024) return 3;
    if (width > 768) return 2;
    return 1;
  }

  function setupCarouselLayout() {
    itemsPerPage = getItemsPerPage();

    const cardWidth = 100 / itemsPerPage;
    allCards.forEach(card => {
      card.style.flex = `0 0 ${cardWidth}%`;
      card.style.maxWidth = `${cardWidth}%`;
    });

    jumpToPosition(currentIndex);
  }

  function jumpToPosition(index) {
    track.style.transition = 'none';
    const cardWidthPx = viewport.clientWidth / itemsPerPage;
    const offset = -index * cardWidthPx;
    track.style.transform = `translateX(${offset}px)`;
  }

  function slideTo(index, animate = true) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    currentIndex = index;

    if (animate) {
      track.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      track.style.transition = 'none';
    }

    const cardWidthPx = viewport.clientWidth / itemsPerPage;
    const offset = -currentIndex * cardWidthPx;
    track.style.transform = `translateX(${offset}px)`;

    updateCounter();
  }

  function updateCounter() {

    let activeCardNum = (currentIndex - totalOriginal) % totalOriginal;
    if (activeCardNum < 0) {
      activeCardNum += totalOriginal;
    }

    const displayNum = activeCardNum + 1;
    const counterText = `${displayNum} / ${totalOriginal}`;
    
    if (counter) counter.textContent = counterText;
    if (counterMob) counterMob.textContent = counterText;
  }

  track.addEventListener('transitionend', () => {
    isTransitioning = false;

    if (currentIndex >= totalOriginal * 2) {
      currentIndex = currentIndex - totalOriginal;
      jumpToPosition(currentIndex);
    }

    else if (currentIndex < totalOriginal) {
      currentIndex = currentIndex + totalOriginal;
      jumpToPosition(currentIndex);
    }
  });

  function slideNext() {
    slideTo(currentIndex + 1);
  }

  function slidePrev() {
    slideTo(currentIndex - 1);
  }

  nextBtn.addEventListener('click', () => {
    resetAutoplay();
    slideNext();
  });

  prevBtn.addEventListener('click', () => {
    resetAutoplay();
    slidePrev();
  });

  nextBtnMob.addEventListener('click', () => {
    resetAutoplay();
    slideNext();
  });

  prevBtnMob.addEventListener('click', () => {
    resetAutoplay();
    slidePrev();
  });

  function startAutoplay() {
    if (!autoplayTimer) {
      autoplayTimer = setInterval(slideNext, 4000);
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  viewport.addEventListener('touchstart', stopAutoplay, { passive: true });

  let touchStartX = 0;
  let touchEndX = 0;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoplay();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      slideNext();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      slidePrev();
    }
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupCarouselLayout();
    }, 150);
  });

  setupCarouselLayout();
  startAutoplay();
}
