(function () {
    'use strict';

    /* ---------- course data ---------- */
    var COURSES = {
        m1: {
            level: 'Regulated Qualifications Framework',
            title: 'Diploma in Management',
            sub: 'Regulated Qualifications Framework',
            facts: [['6–12', 'Months'], ['100%', 'Online'], ['Regulated', 'Qualifications']],
            units: [
                'Principles of Management &amp; Leadership',
                'Managing a Team to Achieve Results',
                'Business Communication Strategies',
                'Personal Development as a Manager',
                'Managing Workplace Wellbeing'
            ]
        },
        m2: {
            level: '',
            title: 'Diploma for Operations &amp; Departmental Managers',
            sub: '',
            facts: [['12–18', 'Months'], ['100%', 'Online'], ['Regulated', 'Qualifications']],
            units: [
                'Strategic Leadership &amp; Organisational Direction',
                'Financial Management for Senior Managers',
                'Operations Planning, Monitoring &amp; Review',
                'Leading &amp; Developing High-Performance Teams',
                'Change Management &amp; Innovation'
            ]
        },
        m3: {
            level: '',
            title: 'Award in Education &amp; Training (AET)',
            sub: '',
            facts: [['3–6', 'Months'], ['100%', 'Online'], ['AET', 'Qualification']],
            units: [
                'Roles, Responsibilities &amp; Relationships in Education',
                'Planning to Meet the Needs of Learners',
                'Delivering Inclusive Sessions that Motivate Learners',
                'Assessing Learning in Education &amp; Training'
            ]
        },
        m4: {
            level: '',
            title: 'Certificate in Education &amp; Training (CET)',
            sub: 'Part-time teachers &amp; trainers',
            facts: [['6–12', 'Months'], ['100%', 'Online'], ['Regulated', 'Qualifications']],
            units: [
                'Teaching, Learning &amp; Assessment in Education',
                'Theories, Principles and Models of Learning',
                'Developing Teaching, Learning &amp; Assessment in Practice',
                'Inclusive Practice in Education &amp; Training'
            ]
        },
        m5: {
            level: '',
            title: 'Certified Professional Trainer (CPT)',
            sub: 'Advanced workplace trainer qualification',
            facts: [['6–9', 'Months'], ['100%', 'Online'], ['CPT', 'Qualification']],
            units: [
                'Designing Effective Training Programmes',
                'Facilitating Learning &amp; Group Dynamics',
                'Coaching &amp; Mentoring Techniques',
                'Evaluating Training Effectiveness &amp; ROI'
            ]
        },
        m6: {
            level: '',
            title: 'Award in Health &amp; Safety in the Workplace',
            sub: 'Essential for supervisors, team leaders &amp; managers',
            facts: [['1–3', 'Months'], ['100%', 'Online'], ['Award', 'Qualification']],
            units: [
                'Legal Framework for Health &amp; Safety',
                'Risk Assessment in the Workplace',
                'Hazard Identification &amp; Control Measures',
                'Accident Investigation &amp; Reporting'
            ]
        }
    };

    var $  = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* ---------- nav shadow ---------- */
    var nav = $('#nav');
    var toTop = $('#toTop');
    window.addEventListener('scroll', function () {
        if (nav) nav.classList.toggle('stuck', window.scrollY > 8);
        if (toTop) toTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });

    /* ---------- mobile menu ---------- */
    var toggle = $('#navToggle');
    var menu = $('#mobileMenu');
    if (toggle && menu) {
        var placeMenu = function () {
            if (nav) menu.style.setProperty('--menu-top', Math.round(nav.getBoundingClientRect().bottom + 8) + 'px');
        };
        toggle.addEventListener('click', function () {
            placeMenu();
            var open = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1180 && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
            placeMenu();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
        $$('#mobileMenu a').forEach(function (a) {
            a.addEventListener('click', function () {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- active section in nav ---------- */
    var links = $$('.nav-links a');
    var targets = $$('#top, #about, #why, #courses, #online, #voices, #contact');
    if ('IntersectionObserver' in window && targets.length) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                links.forEach(function (l) {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        targets.forEach(function (t) { obs.observe(t); });
    }

    /* ---------- discipline filter ---------- */
    var filters = $$('.filter');
    var courses = $$('.course');
    var blocks  = $$('.level-block');
    var noResults = $('#noResults');

    filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var want = btn.dataset.filter;
            filters.forEach(function (f) { f.setAttribute('aria-pressed', String(f === btn)); });

            courses.forEach(function (c) {
                var cats = (c.dataset.cat || '').split(' ');
                c.hidden = !(want === 'all' || cats.indexOf(want) !== -1);
            });

            var anyVisible = false;
            blocks.forEach(function (b) {
                var visible = $$('.course', b).some(function (c) { return !c.hidden; });
                b.hidden = !visible;
                if (visible) anyVisible = true;
            });
            if (noResults) noResults.hidden = anyVisible;
        });
    });

    /* ---------- horizontal course rows: arrow buttons ---------- */
    $$('.cc-group').forEach(function (group) {
        var row = $('.cc-row', group);
        var arrows = $('.cc-arrows', group);
        if (!row || !arrows) return;
        var prev = $('[data-dir="-1"]', arrows);
        var next = $('[data-dir="1"]', arrows);
        function update() {
            var max = row.scrollWidth - row.clientWidth;
            arrows.hidden = max < 4;
            prev.disabled = row.scrollLeft <= 2;
            next.disabled = row.scrollLeft >= max - 2;
        }
        function step(dir) {
            var card = $('.cc-card:not([hidden])', row);
            var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
            var w = card ? card.getBoundingClientRect().width + gap : row.clientWidth;
            row.scrollBy({ left: dir * w, behavior: 'smooth' });
        }
        prev.addEventListener('click', function () { step(-1); });
        next.addEventListener('click', function () { step(1); });
        row.addEventListener('scroll', update, { passive: true });
        row.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        });
        window.addEventListener('resize', update);
        filters.forEach(function (f) { f.addEventListener('click', function () { setTimeout(update, 0); }); });
        update();
    });

    /* ---------- course modal ---------- */
    var scrim = $('#scrim');
    var lastFocus = null;

    function setText(sel, value) {
        var el = $(sel);
        if (el) el.textContent = value;
    }

    // Course data contains HTML entities (&amp;) - decode them to plain text safely
    function decode(str) {
        var t = document.createElement('textarea');
        t.innerHTML = String(str);
        return t.value;
    }

    function openModal(key) {
        if (!scrim || !Object.prototype.hasOwnProperty.call(COURSES, key)) return;
        var c = COURSES[key];
        lastFocus = document.activeElement;

        setText('#modalLevel', decode(c.level));
        setText('#modalTitle', decode(c.title));
        setText('#modalSub', decode(c.sub));

        var facts = $('#modalFacts');
        if (facts) {
            facts.textContent = '';
            c.facts.forEach(function (f) {
                var wrap = document.createElement('div');
                wrap.className = 'fact';
                var val = document.createElement('div');
                val.className = 'fact-val';
                val.textContent = decode(f[0]);
                var k = document.createElement('div');
                k.className = 'fact-key';
                k.textContent = decode(f[1]);
                wrap.appendChild(val);
                wrap.appendChild(k);
                facts.appendChild(wrap);
            });
        }

        var units = $('#modalUnits');
        if (units) {
            units.textContent = '';
            c.units.forEach(function (u) {
                var li = document.createElement('li');
                var span = document.createElement('span');
                span.textContent = decode(u);
                li.appendChild(span);
                units.appendChild(li);
            });
        }

        scrim.hidden = false;
        document.body.style.overflow = 'hidden';
        var close = $('#modalClose');
        if (close) close.focus();
    }

    function closeModal() {
        if (!scrim) return;
        scrim.hidden = true;
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }

    courses.forEach(function (c) {
        c.addEventListener('click', function () { openModal(c.dataset.course); });
    });
    if ($('#modalClose')) $('#modalClose').addEventListener('click', closeModal);
    if ($('#modalCta')) $('#modalCta').addEventListener('click', closeModal);
    if (scrim) scrim.addEventListener('click', function (e) { if (e.target === scrim) closeModal(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && scrim && !scrim.hidden) closeModal();
    });

    /* ---------- enquiry form ----------
       Set data-endpoint on <form id="enquiry"> to a form service URL
       (e.g. https://formspree.io/f/xxxxxxx) to receive enquiries by email.
       If no endpoint is set, the visitor's email app opens with the enquiry
       pre-filled, so no lead is ever silently lost.                      */
    var toast = $('#toast');
    var toastTimer = null;

    function showToast(title, text, isError) {
        if (!toast) return;
        toast.textContent = '';
        var b = document.createElement('b');
        b.textContent = title;
        toast.appendChild(b);
        toast.appendChild(document.createTextNode(' ' + text));
        toast.classList.toggle('error', !!isError);
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 5000);
    }

    function clean(v, max) {
        return String(v || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
    }

    var form = $('#enquiry');
    var lastSubmit = 0;
    if (form) {
        // pre-select a course passed from the courses page (?course=...)
        try {
            var wanted = new URLSearchParams(location.search).get('course');
            if (wanted && form.cr) {
                Array.prototype.forEach.call(form.cr.options, function (o) {
                    if (o.value === wanted) form.cr.value = o.value;
                });
            }
        } catch (err) { /* ignore */ }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // spam honeypot
            var hp = form.querySelector('[name="company_website"]');
            if (hp && hp.value) { form.reset(); return; }

            // simple rate limit (one enquiry every 20s per page view)
            if (Date.now() - lastSubmit < 20000) {
                showToast('Please wait.', 'Your previous enquiry is still being sent.', true);
                return;
            }

            if (!form.checkValidity()) { form.reportValidity(); return; }

            var data = {
                firstName: clean(form.fn.value, 60),
                lastName: clean(form.ln.value, 60),
                email: clean(form.em.value, 120),
                phone: clean(form.ph.value, 25),
                course: clean(form.cr.value, 120),
                message: clean(form.ms.value, 2000),
                page: location.pathname
            };
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
                showToast('Check your email.', 'Please enter a valid email address.', true);
                return;
            }

            var btn = form.querySelector('button[type="submit"]');
            var endpoint = (form.getAttribute('data-endpoint') || '').trim();
            lastSubmit = Date.now();

            if (/^https:\/\//.test(endpoint)) {
                if (btn) btn.disabled = true;
                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(data),
                    credentials: 'omit'
                }).then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    form.reset();
                    showToast('Enquiry sent.', "We'll be in touch within one working day.");
                }).catch(function () {
                    lastSubmit = 0;
                    showToast('Not sent.', 'Something went wrong - please email info@londonukacademy.uk or message us on WhatsApp.', true);
                }).then(function () {
                    if (btn) btn.disabled = false;
                });
                return;
            }

            // Fallback: open the visitor's email app with the enquiry filled in
            var to = form.getAttribute('data-mailto') || 'info@londonukacademy.uk';
            var body = 'Name: ' + data.firstName + ' ' + data.lastName + '\n' +
                'Email: ' + data.email + '\n' +
                'Phone: ' + (data.phone || '-') + '\n' +
                'Course: ' + (data.course || '-') + '\n\n' + (data.message || '');
            var href = 'mailto:' + encodeURIComponent(to) +
                '?subject=' + encodeURIComponent('Course enquiry - ' + (data.course || 'General')) +
                '&body=' + encodeURIComponent(body);
            window.location.href = href;
            showToast('Almost done.', 'Your email app has opened - press Send to deliver your enquiry.');
        });
    }

    /* ---------- expert team gallery: tap / keyboard support ---------- */
    $$('.expert-team-accordion').forEach(function (gallery) {
        var items = $$('.expert-accordion-item', gallery);
        function setActive(item) {
            items.forEach(function (i) {
                var on = i === item;
                i.classList.toggle('is-active', on);
                i.setAttribute('aria-expanded', String(on));
            });
            gallery.classList.toggle('has-active', !!item);
        }
        items.forEach(function (item) {
            item.setAttribute('aria-expanded', 'false');
            item.addEventListener('click', function () {
                setActive(item.classList.contains('is-active') ? null : item);
            });
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(item.classList.contains('is-active') ? null : item);
                } else if (e.key === 'Escape') {
                    setActive(null);
                    item.blur();
                }
            });
        });
        document.addEventListener('click', function (e) {
            if (!gallery.contains(e.target)) setActive(null);
        });
    });

    /* ---------- course card navigation (file:/// compatible) ---------- */
    $$('.cc-card').forEach(function (card) {
        var link = $('.cc-go', card);
        if (link && link.href) {
            card.addEventListener('click', function (e) {
                // If the click is on the link itself, let it handle navigation
                if (e.target === link || link.contains(e.target)) {
                    return;
                }

                // Otherwise, navigate from anywhere on the card
                window.location.href = link.href;
            });
        }
    });

    /* ---------- SUPER SMOOTH SCROLL & REVEAL ENGINE ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        // 1. Comprehensive Multi-Page Scroll & Section Reveal Engine
        var selectors = [
            'section',
            'header.hero',
            '.banner-card',
            '.banner-content',
            '.section-header',
            '.about-card',
            '.why-card',
            '.course-card',
            '.stat-box',
            '.expert-feature-card',
            '.expert-team-accordion',
            '.hero-stats-card',
            '.accred-item',
            '.contact-card',
            'article.course-card',
            '.footer-grid > div'
        ].join(', ');

        var revealElements = document.querySelectorAll(selectors);
        
        revealElements.forEach(function (el) {
            el.classList.add('scroll-reveal');
            
            // Auto-assign staggered delays to siblings within containers
            if (el.parentElement) {
                var children = Array.from(el.parentElement.children);
                var childIndex = children.indexOf(el);
                if (childIndex >= 0) {
                    var delayNum = (childIndex % 6) + 1;
                    el.classList.add('scroll-reveal-delay-' + delayNum);
                }
            }
        });

        if ('IntersectionObserver' in window) {
            var observerOptions = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.08
            };

            var revealObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            revealElements.forEach(function (el) {
                revealObserver.observe(el);
            });
        } else {
            // Fallback for older browsers
            revealElements.forEach(function (el) {
                el.classList.add('is-visible');
            });
        }

        // 2. Smooth Offset Anchor Navigation
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    var targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        var headerOffset = 80;
                        var elementPosition = targetElement.getBoundingClientRect().top;
                        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    });

})();

/* ---------- page loader: fade out once the page has loaded ---------- */
(function () {
    var el = document.getElementById('pageLoader');
    if (!el) return;
    function hide() {
        el.classList.add('is-done');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
    }
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    setTimeout(hide, 5000); // never block the page for more than 5s
})();
