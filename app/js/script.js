const btnHamburger = document.querySelector('#btnHamburger');
const body = document.querySelector('body');
const header = document.querySelector('.header');
const overlay = document.querySelector('.overlay');
const fadeElems = document.querySelectorAll('.has-fade');

// Handle "Inicio" / Home links - reload page if already on home
(function () {
  var homeLinks = document.querySelectorAll('a[href="/"], a[data-home-link]');
  homeLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      // Check if we're already on the home page
      if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        e.preventDefault();
        // Scroll to top smoothly then reload
        if (window.smoothScrollTo) {
          window.smoothScrollTo(0, 400);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setTimeout(function () {
          location.reload();
        }, 100);
      }
      // If not on home page, let the default navigation happen
    });
  });
})();

if (!btnHamburger) {
  console.warn('Hamburger button (#btnHamburger) not found in the DOM.');
} else {
  btnHamburger.addEventListener('click', function () {
    console.log('click hamburger');

    if (header.classList.contains('open')) {
      // Close Hamburger Menu
      body.classList.remove('noscroll');
      header.classList.remove('open');
      fadeElems.forEach(function (element) {
        element.classList.remove('fade-in');
        element.classList.add('fade-out');
      });
    } else {
      // Open Hamburger Menu
      body.classList.add('noscroll');
      header.classList.add('open');
      fadeElems.forEach(function (element) {
        element.classList.remove('fade-out');
        element.classList.add('fade-in');
      });
    }
  });

  // allow clicking overlay to close the menu if overlay exists
  if (overlay) {
    overlay.addEventListener('click', function () {
      if (header.classList.contains('open')) {
        body.classList.remove('noscroll');
        header.classList.remove('open');
        fadeElems.forEach(function (element) {
          element.classList.remove('fade-in');
          element.classList.add('fade-out');
        });
      }
    });
  }
}

// Smooth scroll for on-page anchors (custom duration ~400ms)
(function () {
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function smoothScrollTo(targetY, duration) {
    var startY = window.pageYOffset;
    var diff = targetY - startY;
    var startTime = performance.now();

    function step(now) {
      var time = Math.min(1, (now - startTime) / duration);
      var eased = easeInOutQuad(time);
      window.scrollTo(0, Math.round(startY + diff * eased));
      if (time < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // expose for other scripts
  window.smoothScrollTo = smoothScrollTo;

  document.addEventListener('click', function (e) {
    var el = e.target;
    // find nearest anchor
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el) return;

    var href = el.getAttribute('href');
    if (!href) return;

    // ignore non-hash links and plain '#' links
    if (href.charAt(0) !== '#' || href === '#') return;

    var id = href.slice(1);
    var target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    var rect = target.getBoundingClientRect();
    var targetY = window.pageYOffset + rect.top;

    smoothScrollTo(targetY, 400);

    // if mobile menu is open, close it
    if (header && header.classList.contains('open')) {
      body.classList.remove('noscroll');
      header.classList.remove('open');
      fadeElems.forEach(function (element) {
        element.classList.remove('fade-in');
        element.classList.add('fade-out');
      });
    }
  });
})();

// Back-to-top button: show when scrolled down and scroll to top on click
(function () {
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;

  function onScroll() {
    if (window.pageYOffset > 150) {
      btn.classList.add('back-to-top--visible');
    } else {
      btn.classList.remove('back-to-top--visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // initial check
  onScroll();

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    if (window.smoothScrollTo) {
      window.smoothScrollTo(0, 400);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const messageBox = document.getElementById("contact-form-message");

  if (!form || !messageBox) {
    console.error("No se encontró el formulario o el contenedor del mensaje.");
    return;
  }

  const submitButton = form.querySelector(".contact__button");
  const buttonText = form.querySelector(".contact__button-text");
  let timer;

  function showMessage(text, type) {
    clearTimeout(timer);
    messageBox.textContent = text;
    messageBox.className = "contact__form-message is-visible " + type;

    timer = setTimeout(() => {
      messageBox.textContent = "";
      messageBox.className = "contact__form-message";
    }, 5000);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitButton.disabled = true;
    if (buttonText) buttonText.textContent = "Enviando...";

    try {
      const formData = new FormData(form);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        form.reset();
        showMessage(
          "Gracias por tu mensaje. Te responderemos a la mayor brevedad.",
          "is-success"
        );
      } else {
        console.error("Error de Web3Forms:", data);
        showMessage(
          "No fue posible enviar tu solicitud. Inténtalo nuevamente.",
          "is-error"
        );
      }
    } catch (error) {
      console.error("Error de red o ejecución:", error);
      showMessage(
        "Ocurrió un error al enviar el formulario. Inténtalo nuevamente.",
        "is-error"
      );
    } finally {
      submitButton.disabled = false;
      if (buttonText) buttonText.textContent = "Enviar Solicitud";
    }
  });
});