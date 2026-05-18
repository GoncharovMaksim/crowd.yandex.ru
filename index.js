/**
 * VASUKI CHESS CLUB - INTERACTIVE SCRIPTS
 * Pure Vanilla JavaScript implementation of premium UX carousels,
 * smooth anchor scrolling, and touch-sensitive gestures.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initStagesCarousel();
  initParticipantsCarousel();
});

/**
 * 1. SMOOTH ANCHOR SCROLLING
 */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Adjust for any header offset if needed, though header is absolute
        const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 2. MOBILE STAGES CAROUSEL
 * Features: Non-looping, no auto-play, touch swipeable, pagination dots, disabled button states.
 */
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
    // Translate the track to show current slide
    const offset = currentIndex * -100;
    track.style.transform = `translateX(${offset}%)`;

    // Update disabled button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;

    // Update pagination dots
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Click events
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

  // Dots navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  // Touch Swipe Logic
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
    const swipeThreshold = 50; // pixels
    if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe Left -> Next Slide
      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateCarousel();
      }
    } else if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe Right -> Prev Slide
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }
  }

  // Initialize
  updateCarousel();
}

/**
 * 3. LOOPED PARTICIPANTS CAROUSEL
 * Features: Loopable, auto-play every 4 seconds, touch-sensitive, updates index counter,
 * support 3 items on desktop, 2 items on tablet, 1 item on mobile.
 */
function initParticipantsCarousel() {
  const track = document.getElementById('participants-track');
  const viewport = document.getElementById('participants-viewport');
  const originalCards = Array.from(track.children);
  const totalOriginal = originalCards.length; // 6 cards

  // Desktop Controls
  const prevBtn = document.getElementById('participants-prev');
  const nextBtn = document.getElementById('participants-next');
  const counter = document.getElementById('participants-counter');

  // Mobile Controls
  const prevBtnMob = document.getElementById('participants-prev-mob');
  const nextBtnMob = document.getElementById('participants-next-mob');
  const counterMob = document.getElementById('participants-counter-mob');

  let itemsPerPage = getItemsPerPage();
  let currentIndex = totalOriginal; // Start index (after clone set)
  let isTransitioning = false;
  let autoplayTimer = null;

  // Clone elements to implement seamless infinite looping
  // We append and prepend clones of the original cards
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
    
    // Set widths on all card elements based on viewport columns
    const cardWidth = 100 / itemsPerPage;
    allCards.forEach(card => {
      card.style.flex = `0 0 ${cardWidth}%`;
      card.style.maxWidth = `${cardWidth}%`;
    });

    // Jump to the current index position immediately without transition
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

    // Update Counter
    updateCounter();
  }

  function updateCounter() {
    // Map current index (which includes clones) back to original card boundaries
    let activeCardNum = (currentIndex - totalOriginal) % totalOriginal;
    if (activeCardNum < 0) {
      activeCardNum += totalOriginal;
    }
    
    // Counter shows the active card (offset + 1)
    const displayNum = activeCardNum + 1;
    const counterText = `${displayNum} / ${totalOriginal}`;
    
    if (counter) counter.textContent = counterText;
    if (counterMob) counterMob.textContent = counterText;
  }

  // Handle seamless loops when transitioning ends
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    
    // If we've reached the right cloned buffer, wrap around to start boundary
    if (currentIndex >= totalOriginal * 2) {
      currentIndex = currentIndex - totalOriginal;
      jumpToPosition(currentIndex);
    }
    // If we've reached the left cloned buffer, wrap around to end boundary
    else if (currentIndex < totalOriginal) {
      currentIndex = currentIndex + totalOriginal;
      jumpToPosition(currentIndex);
    }
  });

  // Next / Prev actions
  function slideNext() {
    slideTo(currentIndex + 1);
  }

  function slidePrev() {
    slideTo(currentIndex - 1);
  }

  // Event Listeners for controls (both desktop and mobile)
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

  // Autoplay Logic
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

  // Pause autoplay on mouse enter / resume on leave
  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  viewport.addEventListener('touchstart', stopAutoplay, { passive: true });

  // Touch swiping on participants carousel
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

  // Debounced Resize handler to rearrange layouts on viewport scale
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupCarouselLayout();
    }, 150);
  });

  // Initial Setup
  setupCarouselLayout();
  startAutoplay();
}
