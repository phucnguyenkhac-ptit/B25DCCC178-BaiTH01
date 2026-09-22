const burger = document.getElementById('burger');
const nav    = document.getElementById('nav');

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.focus();
  }
});

const root = document.documentElement;
const tBtn = document.getElementById('theme-toggle');

function applyTheme(mode){
  root.setAttribute('data-theme', mode);
  const dark = mode === 'dark';
  tBtn.textContent = dark ? 'Nền sáng' : 'Nền tối';
  tBtn.setAttribute('aria-pressed', String(dark));
}

applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

tBtn.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
  });
});

const navLinks = [...nav.querySelectorAll('a')];
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

const progressBar = document.getElementById('progress-bar');

function updateReadingProgress(){
  const doc = document.documentElement;
  const total = doc.scrollHeight - doc.clientHeight;
  const pct = total > 0 ? (doc.scrollTop / total) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateReadingProgress, { passive: true });
window.addEventListener('resize', updateReadingProgress);
updateReadingProgress();

const revealer = new IntersectionObserver((entries, obs) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('shown');
      obs.unobserve(en.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

const searchBox = document.getElementById('search');
const chipBox   = document.getElementById('chips');
const list      = document.getElementById('projects');
const counter   = document.getElementById('count');
const cards     = [...list.querySelectorAll('.case')];
let activeTag   = 'all';

const empty = document.createElement('li');
empty.className = 'empty';
empty.hidden = true;
empty.textContent = 'Không có dự án nào khớp. Thử từ khoá ngắn hơn hoặc chọn lại "Tất cả".';
list.appendChild(empty);

const plain = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

function renderProjects(){
  const q = plain(searchBox.value.trim());
  let shown = 0;

  cards.forEach(card => {
    const matchTag  = activeTag === 'all' || card.dataset.tags.split(' ').includes(activeTag);
    const matchText = q === '' || plain(card.textContent).includes(q);
    const ok = matchTag && matchText;
    card.hidden = !ok;
    if (ok) shown++;
  });

  empty.hidden = shown !== 0;
  counter.textContent = 'Hiển thị ' + shown + ' / ' + cards.length + ' dự án.';
}

searchBox.addEventListener('input', renderProjects);

chipBox.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  activeTag = btn.dataset.tag;
  chipBox.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === btn)));
  renderProjects();
});

renderProjects();

const message = document.getElementById('message');
const cnt     = document.getElementById('counter');
const MAX     = 400;

message.addEventListener('input', () => {
  const n = message.value.length;
  cnt.textContent = n + ' / ' + MAX;
  cnt.classList.toggle('over', n > MAX - 40);
});


const form     = document.getElementById('contact');
const note     = document.getElementById('note');
const progress = document.getElementById('progress');

const requiredIds = ['name', 'email', 'topic', 'message'];

const rules = {
  name(v){
    if (!v.trim()) return 'Nhập họ tên của bạn.';
    if (v.trim().length < 2) return 'Họ tên cần ít nhất 2 ký tự.';
    if (/\d/.test(v)) return 'Họ tên không chứa chữ số.';
    return '';
  },
  email(v){
    if (!v.trim()) return 'Nhập email để mình trả lời.';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim())) return 'Email chưa đúng định dạng, ví dụ: ban@email.com';
    return '';
  },
  phone(v){
    if (!v.trim()) return '';                       // không bắt buộc
    if (!/^0\d{9}$/.test(v.trim())) return 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.';
    return '';
  },
  topic(v){
    if (!v) return 'Chọn nội dung bạn muốn trao đổi.';
    return '';
  },
  message(v){
    if (!v.trim()) return 'Viết vài dòng về việc bạn cần.';
    if (v.trim().length < 20) return 'Lời nhắn cần ít nhất 20 ký tự để mình hiểu đủ ý.';
    if (v.length > MAX) return 'Lời nhắn tối đa ' + MAX + ' ký tự.';
    return '';
  }
};

function check(id){
  const input = document.getElementById(id);
  const msg   = rules[id](input.value);
  document.getElementById('err-' + id).textContent = msg;
  input.closest('.field').classList.toggle('has-error', msg !== '');
  input.setAttribute('aria-invalid', msg !== '');
  return msg === '';
}

function updateProgress(){
  const done = requiredIds.filter(id => rules[id](document.getElementById(id).value) === '').length;
  progress.textContent = done + ' / ' + requiredIds.length + ' mục bắt buộc đã điền hợp lệ';
}

Object.keys(rules).forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('blur', () => check(id));
  el.addEventListener('input', () => {
    if (el.closest('.field').classList.contains('has-error')) check(id);
    updateProgress();
  });
  el.addEventListener('change', updateProgress);
});
updateProgress();

form.addEventListener('submit', e => {
  e.preventDefault();
  note.className = 'form-note';
  note.textContent = '';

  const ids      = Object.keys(rules);
  const results  = ids.map(check);
  const firstBad = ids.find((id, i) => !results[i]);
  updateProgress();

  if (firstBad){
    note.textContent = 'Còn ' + results.filter(r => !r).length + ' ô chưa hợp lệ. Xem dòng chữ dưới mỗi ô.';
    document.getElementById(firstBad).focus();
    return;
  }

  note.classList.add('ok');
  note.textContent = 'Đã gửi. Cảm ơn ' + document.getElementById('name').value.trim() + ', mình sẽ trả lời qua email trong 24 giờ.';
  form.reset();
  cnt.textContent = '0 / ' + MAX;
  cnt.classList.remove('over');
  updateProgress();
});

document.getElementById('year').textContent = new Date().getFullYear();