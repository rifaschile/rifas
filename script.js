document.addEventListener('DOMContentLoaded', () => {
    const ticketPrice = 7500;
    const decreaseBtn = document.getElementById('decrease-tickets');
    const increaseBtn = document.getElementById('increase-tickets');
    const ticketInput = document.getElementById('ticket-quantity');
    const totalAmountSpan = document.getElementById('total-amount');
    const checkoutForm = document.getElementById('checkout-form');
    const applyPromoBtn = document.getElementById('apply-promo');

    // Ticket Quantity Logic
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(ticketInput.value);
            if (currentValue > 1) {
                ticketInput.value = currentValue - 1;
                updateTotal();
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(ticketInput.value);
            ticketInput.value = currentValue + 1;
            updateTotal();
        });
    }

    if (ticketInput) {
        ticketInput.addEventListener('change', () => {
            if (ticketInput.value < 1) ticketInput.value = 1;
            updateTotal();
        });
    }

    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', () => {
            ticketInput.value = 3;
            updateTotal();
            const form = document.getElementById('checkout-form');
            if (form) form.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function updateTotal() {
        if (!totalAmountSpan) return;
        const quantity = parseInt(ticketInput.value);
        let total = 0;

        const setsOfThree = Math.floor(quantity / 3);
        const remainder = quantity % 3;
        total = (setsOfThree * 15000) + (remainder * ticketPrice);

        totalAmountSpan.textContent = '$' + total.toLocaleString('es-CL');
        
        // Update hidden Webpay field
        const webpayMonto = document.getElementById('webpay-hidden-monto');
        if (webpayMonto) webpayMonto.value = total;
    }

    // RUT Formatting & Validation
    const rutInput = document.getElementById('rut');
    if (rutInput) {
        rutInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\./g, '').replace(/-/g, '');
            if (value.length > 0) {
                let dvChar = value.slice(-1);
                let cuerpo = value.slice(0, -1);
                if (value.length > 1) {
                    e.target.value = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dvChar;
                }
            }
        });
    }

    function validateRUT(rut) {
        if (!/^[0-9.]+[-][0-9kK]{1}$/.test(rut)) return false;
        let tmp = rut.split('-');
        let digv = tmp[1];
        let cuerpo = tmp[0].replace(/\./g, '');
        if (digv == 'K') digv = 'k';
        return (calculateDV(cuerpo) == digv);
    }

    function calculateDV(T) {
        let M = 0, S = 1;
        for (; T; T = Math.floor(T / 10))
            S = (S + T % 10 * (9 - M++ % 6)) % 11;
        return S ? S - 1 : 'k';
    }

    // Form Submission Logic
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const rut = rutInput.value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const quantity = ticketInput.value;
            const total = totalAmountSpan.textContent;

            if (!validateRUT(rut)) {
                alert('Por favor, ingresa un RUT válido.');
                return;
            }

            // Save data for later
            localStorage.setItem('raffle_temp_data', JSON.stringify({ name, rut, phone, email, quantity }));

            alert(`¡Excelente ${name}!\n\nSe abrirá la ventana oficial de Webpay para que realices tu pago por ${total}.\n\nUna vez pagado, esta ventana te llevará al último paso para subir tu comprobante.`);

            // Submit the official Webpay form in new window
            const webpayForm = document.getElementById('webpay-official-form');
            if (webpayForm) {
                webpayForm.submit();
            }

            // Move this window to confirmation page
            setTimeout(() => {
                window.location.href = 'confirmacion.html';
            }, 1000);
        });
    }

    // Hero Slider Logic
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideInterval = 5000;

    function showSlide(n) {
        if (slides.length === 0) return;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    if (slides.length > 0) {
        let autoSlide = setInterval(nextSlide, slideInterval);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(autoSlide);
                showSlide(index);
                autoSlide = setInterval(nextSlide, slideInterval);
            });
        });
    }

    // Initial update
    updateTotal();
});


    // Contact Form Logic - Save to Admin Dashboard
    const contactForm = document.getElementById('contact-us-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            let messages = JSON.parse(localStorage.getItem('raffle_messages')) || [];
            messages.push({
                name,
                email,
                message,
                date: new Date().toLocaleString()
            });

            localStorage.setItem('raffle_messages', JSON.stringify(messages));

            alert('¡Gracias ' + name + '! Tu mensaje ha sido enviado. Te responderemos a la brevedad.');
            contactForm.reset();
        });
    }
