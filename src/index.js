// FileYourRIA.com — Cloudflare Worker
// Routes:
//   GET  /           → Landing page
//   GET  /qualify    → Lead qualification form (FB ad destination)
//   POST /api/submit → Form submission handler (lead scoring + Resend emails)
//
// Required Worker secret: RESEND_API_KEY
// Set via: Cloudflare Dashboard → Workers → fyria → Settings → Variables → Add secret

// ─────────────────────────────────────────────
// LANDING PAGE (existing site, unchanged)
// ─────────────────────────────────────────────
const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Your RIA — Expert RIA Registration Consulting</title>
  <meta name="description" content="Get your RIA registered with expert guidance at a fraction of agency prices. Flat-fee, transparent pricing. Free 30-minute consultation.">
  <!-- Meta Pixel -->
  <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1038950925386700');fbq('track','PageView');</script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1038950925386700&ev=PageView&noscript=1"/></noscript>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            navy: '#1e2d5a',
            'navy-dark': '#16213e',
            'navy-light': '#2d4080',
            gold: '#c9a84c',
            'gold-light': '#e8c86d',
          }
        }
      }
    }
  </script>
  <style>
    html { scroll-behavior: smooth; }
    .faq-answer { display: none; }
    .faq-item.open .faq-answer { display: block; }
    .faq-item.open .faq-arrow { transform: rotate(180deg); }
    .faq-arrow { transition: transform 0.2s ease; }
    .navy-gradient { background: linear-gradient(135deg, #16213e 0%, #1e2d5a 60%, #2d4080 100%); }
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="text-gray-900 bg-white">

  <!-- NAV -->
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
    <div class="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
      <span class="text-xl font-bold tracking-tight" style="color:#1e2d5a">
        FileYourRIA<span style="color:#c9a84c">.com</span>
      </span>
      <a href="#book"
         class="text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition"
         style="background:#c9a84c"
         onmouseover="this.style.background='#b8933e'"
         onmouseout="this.style.background='#c9a84c'">
        Book Free Call
      </a>
    </div>
  </nav>

  <!-- HERO -->
  <section class="navy-gradient text-white py-24 px-5">
    <div class="max-w-3xl mx-auto text-center">
      <p class="text-xs font-bold uppercase tracking-widest mb-5" style="color:#c9a84c">
        RIA Registration Consulting
      </p>
      <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
        Get Your RIA Registered.<br>
        <span style="color:#c9a84c">Without the $5,000+ Agency Price Tag.</span>
      </h1>
      <p class="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
        Expert compliance guidance for independent advisors ready to register with their state or the SEC.
        Flat-fee, transparent pricing. No surprises.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="#book"
           class="font-semibold text-lg px-8 py-4 rounded-xl transition text-white"
           style="background:#c9a84c"
           onmouseover="this.style.background='#b8933e'"
           onmouseout="this.style.background='#c9a84c'">
          Book Free 30-Min Call
        </a>
        <a href="#pricing"
           class="font-semibold text-lg px-8 py-4 rounded-xl border-2 border-white text-white transition hover:bg-white"
           style="transition: all 0.2s"
           onmouseover="this.style.background='white';this.style.color='#1e2d5a'"
           onmouseout="this.style.background='transparent';this.style.color='white'">
          View Pricing
        </a>
      </div>
    </div>
  </section>

  <!-- WHO THIS IS FOR -->
  <section class="py-20 px-5 bg-gray-50">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-3" style="color:#1e2d5a">Who This Is For</h2>
      <p class="text-gray-500 text-center mb-12">We work with qualified advisors who are serious about launching their own RIA.</p>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style="background:#1e2d5a">
            <svg class="w-6 h-6" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="font-bold mb-2" style="color:#1e2d5a">Qualified to Register</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            You hold a Series 65, CFP, CFA, ChFC, or equivalent designation that qualifies you to act as an Investment Adviser Representative (IAR).
          </p>
        </div>
        <div class="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style="background:#1e2d5a">
            <svg class="w-6 h-6" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="font-bold mb-2" style="color:#1e2d5a">Ready to Register</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            You're registering in 1–3 states or planning SEC registration, and want expert guidance to do it right the first time — without months of trial and error.
          </p>
        </div>
        <div class="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style="background:#1e2d5a">
            <svg class="w-6 h-6" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="font-bold mb-2" style="color:#1e2d5a">Value-Conscious</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            You know large compliance firms charge $4,000–$8,000 for registration. You want the same quality guidance at a fair, transparent price.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section id="pricing" class="py-20 px-5 bg-white">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-3" style="color:#1e2d5a">Simple, Transparent Pricing</h2>
      <p class="text-gray-500 text-center mb-1">Government filing fees are separate and paid directly to the regulator (typically $50–$500 depending on your state).</p>
      <p class="text-gray-400 text-center text-sm mb-12">No quotes. No callbacks. No surprises.</p>
      <div class="grid md:grid-cols-2 gap-8 items-start">
        <div class="border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition">
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">DIY with Expert Support</p>
          <h3 class="text-2xl font-bold mb-1" style="color:#1e2d5a">Consulting-Only</h3>
          <div class="flex items-end gap-2 mb-2">
            <span class="text-4xl font-bold" style="color:#1e2d5a">$999</span>
            <span class="text-gray-400 mb-1 text-sm">flat fee</span>
          </div>
          <p class="text-gray-500 text-sm mb-7 leading-relaxed">
            You execute the registration. We guide you every step of the way and review your work before it goes to the regulator.
          </p>
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-700 text-sm">3 &times; 1-hour consultation sessions</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-700 text-sm">Full review of your drafted ADV Part 1 &amp; 2 with written feedback</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-700 text-sm">Examiner Q&amp;A coaching — we help you prepare responses</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-700 text-sm">Compliance checklist + curated resource list</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-700 text-sm">30-day email Q&amp;A support</span></li>
          </ul>
          <a href="#book" class="block w-full text-center border-2 py-3.5 rounded-xl font-semibold transition" style="border-color:#1e2d5a;color:#1e2d5a" onmouseover="this.style.background='#1e2d5a';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#1e2d5a'">Book Free Consultation</a>
        </div>
        <div class="rounded-2xl p-8 relative" style="background:#1e2d5a;border:2px solid #1e2d5a">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest" style="background:#c9a84c">Most Popular</div>
          <p class="text-xs font-bold uppercase tracking-widest mb-2" style="color:#c9a84c">We Do It With You</p>
          <h3 class="text-2xl font-bold text-white mb-1">White-Glove</h3>
          <div class="flex items-end gap-2 mb-2">
            <span class="text-4xl font-bold text-white">$1,999</span>
            <span class="text-gray-400 mb-1 text-sm">flat fee</span>
          </div>
          <p class="text-gray-300 text-sm mb-7 leading-relaxed">
            We prepare every document, walk you through every filing step, and stay with you until your registration is approved.
          </p>
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Form ADV Part 1A, 1B, Schedules A, B &amp; D — full preparation</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Form ADV Part 2A (Firm Brochure) + Part 2B (IAR Supplement) — Word &amp; PDF</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Customized written compliance policies &amp; procedures</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Code of ethics document</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">IARD/WebCRD account setup walkthrough</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Form U4 preparation (if applicable)</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Sample forms — privacy notice, client acknowledgment, fee disclosure</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Annual compliance calendar template</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Unlimited email Q&amp;A through registration completion</span></li>
            <li class="flex items-start gap-3"><svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color:#c9a84c" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="text-gray-200 text-sm">Two 1-hour review calls — kickoff + pre-submission</span></li>
          </ul>
          <a href="#book" class="block w-full text-center py-3.5 rounded-xl font-semibold text-white transition" style="background:#c9a84c" onmouseover="this.style.background='#b8933e'" onmouseout="this.style.background='#c9a84c'">Book Free Consultation</a>
        </div>
      </div>
      <p class="text-center text-gray-400 text-sm mt-8">Not sure which option is right for you? The free call will help you decide. No obligation, no pressure.</p>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="py-20 px-5 bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-12" style="color:#1e2d5a">How It Works</h2>
      <div class="grid md:grid-cols-3 gap-10">
        <div class="text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5 text-white" style="background:#1e2d5a;color:#c9a84c">1</div>
          <h3 class="font-bold mb-2" style="color:#1e2d5a">Book Your Free Call</h3>
          <p class="text-gray-500 text-sm leading-relaxed">30 minutes, no obligation. We review your qualifications, target states, and firm structure.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5 text-white" style="background:#1e2d5a;color:#c9a84c">2</div>
          <h3 class="font-bold mb-2" style="color:#1e2d5a">We Scope Your Registration</h3>
          <p class="text-gray-500 text-sm leading-relaxed">We outline exactly what your registration requires, flag any disclosure events, and confirm which service tier fits.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5 text-white" style="background:#1e2d5a;color:#c9a84c">3</div>
          <h3 class="font-bold mb-2" style="color:#1e2d5a">We Get to Work</h3>
          <p class="text-gray-500 text-sm leading-relaxed">Pay a flat fee, we start immediately. We guide you — or work alongside you — until your registration is approved and active.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- BOOK / CAL.COM -->
  <section id="book" class="py-20 px-5 bg-white">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-3" style="color:#1e2d5a">Book Your Free 30-Min Consultation</h2>
      <p class="text-gray-500 text-center mb-2">No obligation. No pitch. Just a straight conversation about your registration path.</p>
      <p class="text-gray-400 text-center text-sm mb-10">
        Prefer WhatsApp?
        <a href="https://wa.me/15127998707" target="_blank" rel="noopener noreferrer" class="font-semibold transition" style="color:#1e2d5a" onmouseover="this.style.color='#c9a84c'" onmouseout="this.style.color='#1e2d5a'">Message us directly &rarr;</a>
      </p>
      <div class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div id="my-cal-inline" style="width:100%;min-height:600px;overflow:scroll"></div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="py-20 px-5 bg-gray-50">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-12" style="color:#1e2d5a">Frequently Asked Questions</h2>
      <div class="space-y-3">
        <div class="faq-item bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onclick="toggleFaq(this)" class="w-full text-left p-5 flex items-center justify-between font-semibold transition" style="color:#1e2d5a">
            <span>What qualifications do I need to register as an RIA?</span>
            <svg class="faq-arrow w-5 h-5 flex-shrink-0 ml-3" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer px-5 pb-5 text-gray-600 text-sm leading-relaxed">Most states require the Series 65 (NASAA Uniform Investment Adviser Law Examination). Holders of CFP, CFA, CPA, ChFC, CLU, and PFS designations may qualify for a Series 65 waiver in many states. We'll confirm your qualification on the free call.</div>
        </div>
        <div class="faq-item bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onclick="toggleFaq(this)" class="w-full text-left p-5 flex items-center justify-between font-semibold transition" style="color:#1e2d5a">
            <span>How long does state registration typically take?</span>
            <svg class="faq-arrow w-5 h-5 flex-shrink-0 ml-3" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer px-5 pb-5 text-gray-600 text-sm leading-relaxed">Most state registrations are reviewed within 30–45 days of a complete, well-prepared filing. Some states move faster. A clean, complete application is the single biggest factor in minimizing turnaround time — which is where we focus.</div>
        </div>
        <div class="faq-item bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onclick="toggleFaq(this)" class="w-full text-left p-5 flex items-center justify-between font-semibold transition" style="color:#1e2d5a">
            <span>Are government filing fees included in your price?</span>
            <svg class="faq-arrow w-5 h-5 flex-shrink-0 ml-3" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer px-5 pb-5 text-gray-600 text-sm leading-relaxed">No — state and IARD filing fees are paid directly to the regulator and are not part of our fee. They typically range from $50–$500 depending on your state and AUM tier. We'll give you an exact breakdown for your situation on the free call.</div>
        </div>
        <div class="faq-item bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onclick="toggleFaq(this)" class="w-full text-left p-5 flex items-center justify-between font-semibold transition" style="color:#1e2d5a">
            <span>What states do you cover?</span>
            <svg class="faq-arrow w-5 h-5 flex-shrink-0 ml-3" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer px-5 pb-5 text-gray-600 text-sm leading-relaxed">We work with advisors registering in any U.S. state, as well as those pursuing SEC registration under the internet adviser exemption (Rule 203A-2(e)). Multi-state registrations are handled case by case.</div>
        </div>
        <div class="faq-item bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onclick="toggleFaq(this)" class="w-full text-left p-5 flex items-center justify-between font-semibold transition" style="color:#1e2d5a">
            <span>What if the examiner comes back with deficiency questions?</span>
            <svg class="faq-arrow w-5 h-5 flex-shrink-0 ml-3" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer px-5 pb-5 text-gray-600 text-sm leading-relaxed">Deficiency letters are normal — not a rejection. White-Glove clients receive full support in drafting responses through the entire review process. Consulting-Only clients get one complimentary response review; additional sessions are available at our hourly rate.</div>
        </div>
        <div class="faq-item bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onclick="toggleFaq(this)" class="w-full text-left p-5 flex items-center justify-between font-semibold transition" style="color:#1e2d5a">
            <span>Can I upgrade from Consulting-Only to White-Glove?</span>
            <svg class="faq-arrow w-5 h-5 flex-shrink-0 ml-3" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer px-5 pb-5 text-gray-600 text-sm leading-relaxed">Yes. If you start with Consulting-Only and decide you'd like us to take on document preparation, you can upgrade at any time. We credit your $999 paid toward the White-Glove fee — you pay only the $1,000 difference.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="py-10 px-5" style="background:#16213e">
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <span class="text-xl font-bold" style="color:white">FileYourRIA<span style="color:#c9a84c">.com</span></span>
      <div class="flex flex-col md:flex-row items-center gap-5 text-sm" style="color:#9ca3af">
        <a href="mailto:hello@fileyourria.com" class="transition hover:text-white" style="color:#9ca3af">hello@fileyourria.com</a>
        <a href="https://wa.me/15127998707" target="_blank" rel="noopener noreferrer" class="transition" style="color:#9ca3af" onmouseover="this.style.color='white'" onmouseout="this.style.color='#9ca3af'">WhatsApp: (512) 799-8707</a>
      </div>
      <p class="text-xs text-center md:text-right max-w-xs" style="color:#6b7280">This site provides compliance consulting guidance only. We are not attorneys and do not provide legal advice. All filings are reviewed and submitted by the client.</p>
    </div>
  </footer>

  <!-- CAL.COM EMBED -->
  <script type="text/javascript">
    (function (C, A, L) {
      let p = function (a, ar) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal; let ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
        if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["-", namespace, ar]); } else { p(cal, ar); } return; }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");
    Cal("init", { origin: "https://cal.com" });
    Cal("inline", { elementOrSelector: "#my-cal-inline", calLink: "fileyourria/30min", layout: "month_view" });
    Cal("ui", { theme: "light", hideEventTypeDetails: false, layout: "month_view" });
  </script>

  <script>
    function toggleFaq(btn) {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    }
  </script>
</body>
</html>`;

// ─────────────────────────────────────────────
// QUALIFY FORM PAGE
// ─────────────────────────────────────────────
const QUALIFY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Get Your Free RIA Registration Checklist — FileYourRIA.com</title>
  <meta name="description" content="Answer 5 quick questions and get a personalized RIA registration checklist sent to your inbox. Free.">
  <!-- Meta Pixel -->
  <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1038950925386700');fbq('track','PageView');</script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1038950925386700&ev=PageView&noscript=1"/></noscript>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .navy-gradient { background: linear-gradient(135deg, #16213e 0%, #1e2d5a 60%, #2d4080 100%); }

    /* Step visibility */
    .step { display: none; }
    .step.active { display: block; }

    /* Option cards */
    .option-card {
      width: 100%;
      text-align: left;
      padding: 16px 20px;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      background: white;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .option-card:hover { border-color: #1e2d5a; background: #f8f9ff; transform: translateY(-1px); }
    .option-card.selected { border-color: #c9a84c; background: #fffbf0; }
    .option-card.selected .check-dot { background: #c9a84c; }
    .option-card.selected .check-dot::after { display: block; }

    /* Radio dot */
    .check-dot {
      width: 20px; height: 20px; min-width: 20px;
      border-radius: 50%; border: 2px solid #d1d5db;
      background: white; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .check-dot::after {
      content: ''; display: none;
      width: 8px; height: 8px;
      border-radius: 50%; background: white;
    }

    /* Progress bar */
    .progress-fill { transition: width 0.4s ease; }

    /* Contact input */
    .form-input {
      width: 100%; padding: 14px 16px;
      border: 2px solid #e5e7eb; border-radius: 10px;
      font-size: 16px; outline: none;
      transition: border-color 0.15s;
    }
    .form-input:focus { border-color: #1e2d5a; }

    /* Step slide animation */
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .step.active { animation: fadeSlide 0.25s ease; }

    /* Spinner */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { animation: spin 0.8s linear infinite; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col">

  <!-- NAV -->
  <nav class="bg-white border-b border-gray-100 shadow-sm">
    <div class="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-tight" style="color:#1e2d5a">
        FileYourRIA<span style="color:#c9a84c">.com</span>
      </a>
      <a href="https://wa.me/15127998707" target="_blank" rel="noopener noreferrer"
         class="text-sm text-gray-500 hover:text-gray-700 transition">
        Questions? WhatsApp us
      </a>
    </div>
  </nav>

  <!-- PROGRESS BAR -->
  <div class="bg-white border-b border-gray-100">
    <div class="max-w-2xl mx-auto px-5 py-3">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide" id="step-label">Step 1</span>
        <span class="text-xs text-gray-400" id="step-desc">Credentials</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-1.5">
        <div class="progress-fill h-1.5 rounded-full" style="background:#c9a84c; width:16.6%" id="progress-bar"></div>
      </div>
    </div>
  </div>

  <!-- FORM CONTAINER -->
  <main class="flex-1 max-w-2xl mx-auto w-full px-5 py-10">

    <!-- STEP 1: Credentials -->
    <div class="step active" id="step-1">
      <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color:#1e2d5a">Which best describes your current credentials?</h2>
      <p class="text-gray-500 text-sm mb-8">Tap to select — we'll send you a checklist tailored to your situation.</p>
      <div class="space-y-3">
        <button class="option-card" onclick="selectOption(1,'series65',this)">
          <span class="font-semibold text-gray-800">Series 65 (or Series 66) licensed</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(1,'designation',this)">
          <span class="font-semibold text-gray-800">CFP, CFA, CPA, ChFC, CLU, or PFS — no Series 65 yet</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(1,'studying',this)">
          <span class="font-semibold text-gray-800">Currently studying for my exam</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(1,'not_licensed',this)">
          <span class="font-semibold text-gray-800">Not licensed yet — just starting to explore</span>
          <div class="check-dot"></div>
        </button>
      </div>
    </div>

    <!-- STEP 2: Situation (licensed path only) -->
    <div class="step" id="step-2">
      <button onclick="goBack()" class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color:#1e2d5a">What's your situation right now?</h2>
      <p class="text-gray-500 text-sm mb-8">This helps us understand what stage of the journey you're at.</p>
      <div class="space-y-3">
        <button class="option-card" onclick="selectOption(2,'wirehouse',this)">
          <span class="font-semibold text-gray-800">I'm at a wirehouse or broker-dealer and want to go independent</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(2,'independent',this)">
          <span class="font-semibold text-gray-800">I'm already independent but not yet registered as an RIA</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(2,'fresh',this)">
          <span class="font-semibold text-gray-800">I'm building my practice from scratch</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(2,'adding',this)">
          <span class="font-semibold text-gray-800">I'm adding an RIA to an existing business</span>
          <div class="check-dot"></div>
        </button>
      </div>
    </div>

    <!-- STEP 3: Entity (licensed path only) -->
    <div class="step" id="step-3">
      <button onclick="goBack()" class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color:#1e2d5a">Have you formed your business entity yet?</h2>
      <p class="text-gray-500 text-sm mb-8">LLC, corporation, or similar — the legal entity your RIA will operate under.</p>
      <div class="space-y-3">
        <button class="option-card" onclick="selectOption(3,'yes',this)">
          <span class="font-semibold text-gray-800">Yes — my entity is already set up</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(3,'know_type',this)">
          <span class="font-semibold text-gray-800">Not yet — but I know the structure I want</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(3,'need_help',this)">
          <span class="font-semibold text-gray-800">No — I need guidance on entity structure too</span>
          <div class="check-dot"></div>
        </button>
      </div>
    </div>

    <!-- STEP 4: States (licensed path only) -->
    <div class="step" id="step-4">
      <button onclick="goBack()" class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color:#1e2d5a">How many states are you planning to register in?</h2>
      <p class="text-gray-500 text-sm mb-8">This determines filing complexity and which regulator(s) you'll deal with.</p>
      <div class="space-y-3">
        <button class="option-card" onclick="selectOption(4,'single',this)">
          <span class="font-semibold text-gray-800">Single state</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(4,'multi',this)">
          <span class="font-semibold text-gray-800">Multiple states (2–5)</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(4,'sec',this)">
          <span class="font-semibold text-gray-800">Pursuing SEC registration (internet adviser / $100M+ AUM path)</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(4,'not_sure',this)">
          <span class="font-semibold text-gray-800">Not sure yet — need guidance on this</span>
          <div class="check-dot"></div>
        </button>
      </div>
    </div>

    <!-- STEP 5: Timeline -->
    <div class="step" id="step-5">
      <button onclick="goBack()" class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color:#1e2d5a">How soon are you looking to get registered?</h2>
      <p class="text-gray-500 text-sm mb-8">Be honest — there's no wrong answer. This just helps us prioritize.</p>
      <div class="space-y-3">
        <button class="option-card" onclick="selectOption(5,'asap',this)">
          <span class="font-semibold text-gray-800">ASAP — I want to move now</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(5,'30days',this)">
          <span class="font-semibold text-gray-800">Within the next 30 days</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(5,'3months',this)">
          <span class="font-semibold text-gray-800">1–3 months out</span>
          <div class="check-dot"></div>
        </button>
        <button class="option-card" onclick="selectOption(5,'researching',this)">
          <span class="font-semibold text-gray-800">Just researching for now</span>
          <div class="check-dot"></div>
        </button>
      </div>
    </div>

    <!-- STEP 6: Contact info -->
    <div class="step" id="step-6">
      <button onclick="goBack()" class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color:#1e2d5a">Almost done.</h2>
      <p class="text-gray-500 text-sm mb-8">We'll send your personalized RIA registration checklist to your inbox — free, no catch.</p>
      <form id="contact-form" onsubmit="submitForm(event)" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Full name <span class="text-red-400">*</span></label>
          <input type="text" id="field-name" class="form-input" placeholder="Jane Smith" required autocomplete="name">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email address <span class="text-red-400">*</span></label>
          <input type="email" id="field-email" class="form-input" placeholder="jane@example.com" required autocomplete="email">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Phone number <span class="text-red-400">*</span> <span class="text-gray-400 font-normal text-xs">— we'll text you the meeting link after booking</span></label>
          <input type="tel" id="field-phone" class="form-input" placeholder="(512) 555-0100" required autocomplete="tel">
        </div>
        <div id="form-error" class="hidden text-sm text-red-500 pt-1"></div>
        <button type="submit" id="submit-btn"
          class="w-full py-4 rounded-xl font-bold text-white text-lg transition mt-2"
          style="background:#c9a84c"
          onmouseover="if(!this.disabled)this.style.background='#b8933e'"
          onmouseout="if(!this.disabled)this.style.background='#c9a84c'">
          Get My Free Checklist &rarr;
        </button>
        <p class="text-xs text-gray-400 text-center">No spam. You'll get the checklist and a follow-up from our team.</p>
      </form>
    </div>

    <!-- STEP 7: Thank you -->
    <div class="step" id="step-thanks">
      <div class="text-center py-8">
        <!-- Icon -->
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style="background:#1e2d5a">
          <svg class="w-8 h-8" style="color:#c9a84c" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <!-- HIGH intent -->
        <div id="thanks-high" class="hidden">
          <h2 class="text-2xl md:text-3xl font-bold mb-3" style="color:#1e2d5a">You're ready to move.</h2>
          <p class="text-gray-600 mb-2">Your RIA registration checklist is on its way to <strong id="thanks-email-high"></strong>.</p>
          <p class="text-gray-500 text-sm mb-8">Your answers suggest you're close to ready. Taking 30 minutes now could save you weeks of back-and-forth with the regulator.</p>
          <p class="text-gray-400 text-sm mb-4">Redirecting to our booking page in <strong id="countdown" style="color:#c9a84c">3</strong>...</p>
          <a href="https://cal.com/fileyourria/30min"
             class="inline-block px-8 py-4 rounded-xl font-bold text-white text-lg"
             style="background:#c9a84c">
            Book My Free Call Now &rarr;
          </a>
        </div>

        <!-- MEDIUM intent -->
        <div id="thanks-medium" class="hidden">
          <h2 class="text-2xl md:text-3xl font-bold mb-3" style="color:#1e2d5a">Your checklist is on its way.</h2>
          <p class="text-gray-600 mb-2">Sent to <strong id="thanks-email-medium"></strong>.</p>
          <p class="text-gray-500 text-sm mb-8">When you're ready to take the next step, a free 30-minute call is the fastest way to map out your registration — no obligation, no pitch.</p>
          <a href="https://cal.com/fileyourria/30min"
             class="inline-block px-8 py-4 rounded-xl font-bold text-white text-lg mb-4"
             style="background:#c9a84c">
            Book Free 30-Min Call &rarr;
          </a>
          <p class="text-gray-400 text-sm mt-4">Or we'll reach out personally once you're ready.</p>
        </div>

        <!-- LOW intent -->
        <div id="thanks-low" class="hidden">
          <h2 class="text-2xl md:text-3xl font-bold mb-3" style="color:#1e2d5a">You're on your way.</h2>
          <p class="text-gray-600 mb-2">Your checklist is headed to <strong id="thanks-email-low"></strong>.</p>
          <p class="text-gray-500 text-sm mb-8">We'll include resources to help you prepare — study tips, exam info, and what to start thinking about now so RIA registration is straightforward when you're ready.</p>
          <a href="/" class="text-sm font-semibold" style="color:#1e2d5a">
            &larr; Back to FileYourRIA.com
          </a>
        </div>
      </div>
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="py-6 px-5 border-t border-gray-100">
    <p class="text-center text-xs text-gray-400 max-w-lg mx-auto">
      FileYourRIA.com provides compliance consulting guidance only. We are not attorneys and do not provide legal advice.
      All filings are reviewed and submitted by the client.
    </p>
  </footer>

  <script>
    // ── State ──────────────────────────────────────────────
    const answers = { credentials: null, situation: null, entity: null, states: null, timeline: null };
    let currentStep = 1;
    let isLicensedPath = true; // set after step 1

    // Step sequences for the two paths
    const LICENSED_PATH    = [1, 2, 3, 4, 5, 6];
    const UNLICENSED_PATH  = [1, 5, 6];

    const STEP_DESCS = { 1: 'Credentials', 2: 'Situation', 3: 'Entity', 4: 'States', 5: 'Timeline', 6: 'Contact' };

    // ── Progress ───────────────────────────────────────────
    function updateProgress(step) {
      const path  = isLicensedPath ? LICENSED_PATH : UNLICENSED_PATH;
      const idx   = path.indexOf(step);
      const pos   = idx === -1 ? 1 : idx + 1;
      const total = path.length;
      const pct   = Math.round((pos / total) * 100);

      document.getElementById('progress-bar').style.width = pct + '%';
      document.getElementById('step-label').textContent   = 'Step ' + pos + ' of ' + total;
      document.getElementById('step-desc').textContent    = STEP_DESCS[step] || '';
    }

    // ── Show/hide steps ────────────────────────────────────
    function showStep(n) {
      document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
      const target = document.getElementById('step-' + n);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      currentStep = n;
      updateProgress(n);
    }

    // ── Select an option card ──────────────────────────────
    function selectOption(step, value, el) {
      // Deselect siblings in this step
      document.querySelectorAll('#step-' + step + ' .option-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');

      // Store the answer
      const keyMap = { 1: 'credentials', 2: 'situation', 3: 'entity', 4: 'states', 5: 'timeline' };
      answers[keyMap[step]] = value;

      // After a brief selection feedback, advance
      setTimeout(() => advance(step), 320);
    }

    // ── Advance to next step ───────────────────────────────
    function advance(fromStep) {
      if (fromStep === 1) {
        // Determine path based on credentials
        isLicensedPath = ['series65', 'designation'].includes(answers.credentials);
        updateProgress(1); // re-render now we know the path
        showStep(isLicensedPath ? 2 : 5);
      } else if (fromStep === 2) {
        showStep(3);
      } else if (fromStep === 3) {
        showStep(4);
      } else if (fromStep === 4) {
        showStep(5);
      } else if (fromStep === 5) {
        showStep(6);
      }
    }

    // ── Go back ────────────────────────────────────────────
    function goBack() {
      if (currentStep === 2) showStep(1);
      else if (currentStep === 3) showStep(2);
      else if (currentStep === 4) showStep(3);
      else if (currentStep === 5) showStep(isLicensedPath ? 4 : 1);
      else if (currentStep === 6) showStep(5);
    }

    // ── Submit form ────────────────────────────────────────
    async function submitForm(e) {
      e.preventDefault();

      const name  = document.getElementById('field-name').value.trim();
      const email = document.getElementById('field-email').value.trim();
      const phone = document.getElementById('field-phone').value.trim();

      const errorEl = document.getElementById('form-error');
      errorEl.classList.add('hidden');

      if (!name || !email || !phone) {
        errorEl.textContent = 'Please enter your name, email, and phone number to continue.';
        errorEl.classList.remove('hidden');
        return;
      }

      // Show loading state
      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<svg class="spinner w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"/><path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...';

      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...answers, name, email, phone }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Submission failed');

        // Fire FB Lead event (used as campaign conversion signal in Ads Manager)
        if (typeof fbq !== 'undefined') fbq('track', 'Lead');

        // Show thank-you screen
        showThanks(data.score, email, data.redirect);

      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = 'Get My Free Checklist &rarr;';
        errorEl.textContent = 'Something went wrong — please try again or email us at hello@fileyourria.com';
        errorEl.classList.remove('hidden');
      }
    }

    // ── Show thank-you ─────────────────────────────────────
    function showThanks(score, email, redirectUrl) {
      // Update progress bar to 100%
      document.getElementById('progress-bar').style.width = '100%';
      document.getElementById('step-label').textContent = 'Done!';
      document.getElementById('step-desc').textContent = '';

      // Hide all steps, show thanks
      document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
      document.getElementById('step-thanks').classList.add('active');

      const scoreEl = score === 'HIGH' ? 'high' : score === 'MEDIUM' ? 'medium' : 'low';
      document.querySelectorAll('#step-thanks > div > div').forEach(el => el.classList.add('hidden'));
      const target = document.getElementById('thanks-' + scoreEl);
      target.classList.remove('hidden');

      // Populate email in the thank-you message
      const emailId = 'thanks-email-' + scoreEl;
      const emailEl = document.getElementById(emailId);
      if (emailEl) emailEl.textContent = email;

      // High-intent: countdown + auto-redirect
      if (score === 'HIGH' && redirectUrl) {
        let count = 3;
        const countEl = document.getElementById('countdown');
        const timer = setInterval(() => {
          count--;
          if (countEl) countEl.textContent = count;
          if (count <= 0) {
            clearInterval(timer);
            window.location.href = redirectUrl;
          }
        }, 1000);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Init
    updateProgress(1);
  </script>
</body>
</html>`;

// ─────────────────────────────────────────────
// LEAD SCORING
// ─────────────────────────────────────────────
function scoreLead(data) {
  const licensed = ['series65', 'designation'].includes(data.credentials);
  const urgent   = ['asap', '30days'].includes(data.timeline);
  const moderate = data.timeline === '3months';

  if (licensed && urgent)   return 'HIGH';
  if (licensed && moderate) return 'MEDIUM';
  return 'LOW';
}

// Recommended action copy for the notification email
const ACTION_COPY = {
  HIGH:   'BOOK THIS PERSON IMMEDIATELY — licensed and moving now. Reply or call within the hour.',
  MEDIUM: 'Warm lead — licensed but 1–3 months out. Follow up personally within 48 hrs.',
  LOW:    'Nurture only — not licensed yet or just exploring. Add to long-term list; do not push for a call.',
};

// Human-readable answer labels for the notification email
const LABELS = {
  credentials: { series65: 'Series 65 / Series 66 licensed', designation: 'CFP / CFA / CPA / ChFC / CLU / PFS (no S65)', studying: 'Currently studying for exam', not_licensed: 'Not licensed yet' },
  situation:   { wirehouse: 'Wirehouse / BD — going independent', independent: 'Already independent, not yet RIA', fresh: 'Building from scratch', adding: 'Adding RIA to existing business' },
  entity:      { yes: 'Entity already set up', know_type: 'Not formed, knows structure wanted', need_help: 'Needs entity guidance too' },
  states:      { single: 'Single state', multi: 'Multiple states (2–5)', sec: 'SEC registration (internet adviser / $100M+)', not_sure: 'Not sure yet' },
  timeline:    { asap: 'ASAP — ready to move now', '30days': 'Within 30 days', '3months': '1–3 months out', researching: 'Just researching' },
};

function label(field, value) {
  return (LABELS[field] && LABELS[field][value]) || value || '—';
}

// ─────────────────────────────────────────────
// NOTIFICATION EMAIL (to hello@fileyourria.com)
// ─────────────────────────────────────────────
function buildNotificationEmail(data, score) {
  const scoreColor = { HIGH: '#16a34a', MEDIUM: '#ca8a04', LOW: '#6b7280' }[score];

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #374151; margin: 0; padding: 0; background: #f9fafb; }
  .wrap { max-width: 560px; margin: 32px auto; background: white; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; }
  .header { background: #1e2d5a; padding: 24px 28px; }
  .header h1 { color: white; margin: 0; font-size: 18px; }
  .header p { color: #c9a84c; margin: 4px 0 0; font-size: 13px; }
  .score-banner { padding: 14px 28px; font-weight: bold; font-size: 15px; color: white; background: ${scoreColor}; }
  .body { padding: 24px 28px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  td:first-child { font-weight: bold; color: #6b7280; width: 38%; }
  .contact-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
  .contact-box p { margin: 4px 0; font-size: 13px; }
  .action { background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 14px 16px; font-weight: bold; font-size: 14px; color: #713f12; }
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>New Lead — FileYourRIA.com</h1>
    <p>Qualification form submission</p>
  </div>
  <div class="score-banner">Lead Score: ${score}</div>
  <div class="body">
    <div class="action">${ACTION_COPY[score]}</div>
    <br>
    <div class="contact-box">
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
    </div>
    <table>
      <tr><td>Credentials</td><td>${label('credentials', data.credentials)}</td></tr>
      ${data.situation ? `<tr><td>Situation</td><td>${label('situation', data.situation)}</td></tr>` : ''}
      ${data.entity    ? `<tr><td>Entity</td><td>${label('entity', data.entity)}</td></tr>` : ''}
      ${data.states    ? `<tr><td>States</td><td>${label('states', data.states)}</td></tr>` : ''}
      <tr><td>Timeline</td><td>${label('timeline', data.timeline)}</td></tr>
    </table>
    <p style="font-size:12px;color:#9ca3af;">Submitted via fileyourria.com/qualify</p>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// CHECKLIST EMAIL (to the lead)
// ─────────────────────────────────────────────
function buildChecklistEmail(data, score) {
  const isLicensed = ['series65', 'designation'].includes(data.credentials);

  // Opening paragraph varies by score
  const openings = {
    HIGH:   `Based on your answers, you're well-positioned to move forward quickly. Below is the full RIA registration checklist — use it to stay organized and make sure nothing falls through the cracks.`,
    MEDIUM: `You're on the right track. Below is the complete RIA registration checklist so you can start planning now and hit the ground running when you're ready to file.`,
    LOW:    `Getting familiar with the process early is smart. Below is the full RIA registration checklist — bookmark it and revisit as you get closer to your exam and registration.`,
  };

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #374151; margin: 0; padding: 0; background: #f9fafb; }
  .wrap { max-width: 580px; margin: 32px auto; background: white; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; }
  .header { background: #1e2d5a; padding: 28px 32px; text-align: center; }
  .header h1 { color: white; margin: 0 0 4px; font-size: 20px; }
  .header p { color: #c9a84c; margin: 0; font-size: 13px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; }
  .body { padding: 28px 32px; }
  h2 { font-size: 15px; color: #1e2d5a; margin: 24px 0 10px; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; }
  h2:first-of-type { margin-top: 0; }
  ul { margin: 0 0 8px; padding-left: 20px; }
  li { margin-bottom: 6px; font-size: 13px; line-height: 1.5; }
  .note { font-size: 12px; color: #6b7280; font-style: italic; margin-left: 4px; }
  .cta-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 18px 20px; margin-top: 24px; text-align: center; }
  .cta-btn { display: inline-block; background: #c9a84c; color: white; font-weight: bold; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; margin-top: 10px; }
  .footer { padding: 16px 32px; border-top: 1px solid #f3f4f6; }
  .footer p { font-size: 11px; color: #9ca3af; margin: 0; line-height: 1.5; }
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <p>Your Free Checklist from</p>
    <h1>FileYourRIA.com</h1>
  </div>
  <div class="body">
    <p>Hi ${data.name},</p>
    <p>${openings[score]}</p>
    <p>Save this email — it covers every major milestone from start to approval.</p>

    ${!isLicensed ? `
    <h2>Phase 0 — Before You Can Register</h2>
    <ul>
      <li>Pass the Series 65 exam (NASAA Uniform Investment Adviser Law Examination) <span class="note">— waived for CFP, CFA, CPA, ChFC, CLU, PFS in most states</span></li>
      <li>Confirm your designation qualifies for a Series 65 waiver in your target state(s)</li>
      <li>Form your business entity (LLC or corporation) — your RIA will be registered in the entity's name</li>
    </ul>
    ` : ''}

    <h2>Phase 1 — Business Entity &amp; Setup</h2>
    <ul>
      <li>Form your LLC or corporation in your home state</li>
      <li>Obtain your EIN (Employer Identification Number) from the IRS — free, takes minutes online</li>
      <li>Open a business bank account</li>
      <li>Decide on your firm's legal name — this will appear on all regulatory filings</li>
    </ul>

    <h2>Phase 2 — IARD / WebCRD Account</h2>
    <ul>
      <li>Create your FINRA IARD account at <strong>iard.com</strong> — this is the central filing system for all RIA registrations</li>
      <li>Fund your IARD Flex-Funding Account (you'll pay state registration fees from here)</li>
      <li>Obtain your CRD number — you'll use this for all future filings</li>
    </ul>

    <h2>Phase 3 — Form ADV Part 1</h2>
    <ul>
      <li><strong>Part 1A</strong> — organizational info, ownership, services offered, disciplinary history, business practices</li>
      <li><strong>Part 1B</strong> — state-specific supplement (required for state-registered advisers)</li>
      <li><strong>Schedules A, B, D</strong> — ownership structure, direct/indirect owners, additional details</li>
      <li>Common pitfall: inconsistencies between Part 1A and Part 2A trigger deficiency letters — review both together before filing</li>
    </ul>

    <h2>Phase 4 — Form ADV Part 2 (Brochures)</h2>
    <ul>
      <li><strong>Part 2A (Firm Brochure)</strong> — plain-English description of your services, fees, conflicts of interest, and disciplinary history. Required for delivery to clients</li>
      <li><strong>Part 2B (Brochure Supplement)</strong> — one per IAR; covers educational background, disciplinary history, outside business activities</li>
      <li>Write in plain English — examiners flag jargon and vague language quickly</li>
      <li>Fee schedule in Part 2A must match what you charge clients exactly</li>
    </ul>

    <h2>Phase 5 — Compliance Program</h2>
    <ul>
      <li>Written Compliance Policies &amp; Procedures (P&amp;Ps) — required by SEC Rule 206(4)-7 and most state equivalents</li>
      <li>Code of Ethics — covers personal trading, gifts, outside business activities</li>
      <li>Annual Review process — document how you'll review compliance each year</li>
      <li>Privacy Notice (Regulation S-P) — required disclosure to clients</li>
      <li>Business Continuity Plan — what happens if your systems go down or you're unavailable</li>
    </ul>

    <h2>Phase 6 — IAR Registration (Form U4)</h2>
    <ul>
      <li>Each Investment Adviser Representative (IAR) must file Form U4 through IARD</li>
      <li>Disclose all prior employment history, disciplinary events, and outside business activities accurately</li>
      <li>Pay state IAR registration fees through your Flex-Funding Account</li>
    </ul>

    <h2>Phase 7 — State Filing &amp; Review</h2>
    <ul>
      <li>Submit your complete ADV (Parts 1 and 2) through IARD</li>
      <li>Pay state registration fees (typically $50–$500 per state — paid to the regulator, not to us)</li>
      <li>Review period: most states take 30–45 days. Some issue deficiency letters requesting clarification</li>
      <li>Deficiency letters are normal — respond promptly and specifically to each question raised</li>
      <li>Once approved, your registration is effective — you can begin conducting investment advisory business</li>
    </ul>

    <h2>Phase 8 — Post-Registration (Ongoing)</h2>
    <ul>
      <li><strong>Annual ADV Amendment</strong> — due within 90 days of your fiscal year end; update any material changes promptly throughout the year</li>
      <li>Deliver updated Part 2A to clients annually (or upon material change)</li>
      <li>Annual compliance review — document it in writing</li>
      <li>Keep a compliance calendar — state renewals, IARD annual renewal window (Nov–Dec)</li>
      <li>Books &amp; records obligations — maintain all client files, correspondence, and trade records per state rules</li>
    </ul>

    ${score !== 'LOW' ? `
    <div class="cta-box">
      <p style="margin:0;font-weight:bold;color:#1e2d5a;">Ready to talk through your specific situation?</p>
      <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Our free 30-minute call covers your qualifications, target state(s), and exactly what your registration requires. No obligation.</p>
      <a href="https://cal.com/fileyourria/30min" class="cta-btn">Book Your Free Call &rarr;</a>
    </div>
    ` : `
    <div class="cta-box" style="background:#f9fafb;border-color:#e5e7eb;">
      <p style="margin:0;font-weight:bold;color:#1e2d5a;">Questions as you prepare?</p>
      <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Email us anytime at <a href="mailto:hello@fileyourria.com" style="color:#1e2d5a;">hello@fileyourria.com</a> — we're happy to point you in the right direction.</p>
    </div>
    `}
  </div>
  <div class="footer">
    <p>
      FileYourRIA.com &bull; hello@fileyourria.com &bull; (512) 799-8707<br>
      This email provides general informational guidance only. We are not attorneys and this is not legal advice.
      All regulatory filings are reviewed, signed, and submitted by the client.
    </p>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// RESEND EMAIL SENDER
// ─────────────────────────────────────────────
async function sendEmail(env, { to, subject, html, replyTo }) {
  // RESEND_API_KEY must be set as a Worker secret in Cloudflare dashboard
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'File Your RIA <hello@fileyourria.com>',
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────
// SUBMIT HANDLER
// ─────────────────────────────────────────────
async function handleSubmit(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  // Basic validation
  if (!data.name || !data.email) {
    return jsonError('Name and email are required', 400);
  }

  const score = scoreLead(data);

  // Build Cal.com URL with prefilled contact fields so the lead doesn't
  // have to re-enter their name, email, and phone on the booking page.
  let calUrl = null;
  if (score !== 'LOW') {
    const params = new URLSearchParams({ name: data.name, email: data.email });
    if (data.phone) params.set('phone', data.phone);
    calUrl = `https://cal.com/fileyourria/30min?${params.toString()}`;
  }
  const redirect = calUrl;

  // Send both emails — failures are logged but don't block the response
  const emailResults = await Promise.allSettled([
    sendEmail(env, {
      to:      'hello@fileyourria.com',
      subject: `[${score}] New RIA Lead: ${data.name}`,
      html:    buildNotificationEmail(data, score),
    }),
    sendEmail(env, {
      to:       data.email,
      subject:  'Your RIA Registration Checklist — FileYourRIA.com',
      html:     buildChecklistEmail(data, score),
      replyTo:  'hello@fileyourria.com',
    }),
  ]);

  // Log any email errors (visible in Cloudflare Workers logs)
  emailResults.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`Email ${i === 0 ? 'notification' : 'checklist'} failed:`, result.reason);
    }
  });

  return new Response(JSON.stringify({ success: true, score, redirect }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─────────────────────────────────────────────
// MAIN WORKER EXPORT
// ─────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin':  '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (path === '/qualify' && method === 'GET') {
      return new Response(QUALIFY_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (path === '/api/submit' && method === 'POST') {
      return handleSubmit(request, env);
    }

    if (path === '/' || path === '') {
      return new Response(LANDING_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 404 for anything else
    return new Response('Not found', { status: 404 });
  },
};
