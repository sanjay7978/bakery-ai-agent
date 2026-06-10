const messages = document.querySelector('#messages');
const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const quickActions = document.querySelector('.quick-actions');

const sessionId = crypto.randomUUID();
let menuCache = [];

function appendMessage(text, sender = 'bot') {
  const row = document.createElement('div');
  row.className = `message-row ${sender}`;

  if (sender === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'BM';
    row.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = formatReply(text);
  row.appendChild(bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;

  return row;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function formatReply(text) {
  return escapeHtml(text.replace('CONFIRMED_ORDER', '').trim())
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function appendTyping() {
  const row = document.createElement('div');
  row.className = 'message-row bot';
  row.innerHTML = `
    <div class="avatar">BM</div>
    <div class="bubble">
      <span class="typing" aria-label="BakeryMate is typing">
        <span></span><span></span><span></span>
      </span>
    </div>
  `;
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
  return row;
}

function productGlyph(category) {
  const glyphs = {
    Cakes: 'CA',
    Pastries: 'PA',
    Breads: 'BR',
    Cookies: 'CO',
  };
  return glyphs[category] || 'BM';
}

function appendMenu(products) {
  if (!products.length) return;

  const row = document.createElement('div');
  row.className = 'message-row bot';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = 'BM';

  const bubble = document.createElement('div');
  bubble.className = 'bubble menu-grid';

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    const imagePath = `/images/${product.image_filename}`;
    card.innerHTML = `
      <div class="product-photo" aria-hidden="true">
        <img src="${imagePath}" alt="" loading="lazy" />
        <span>${productGlyph(product.category)}</span>
      </div>
      <div class="product-body">
        <h3>${product.product_name}</h3>
        <p>Rs.${Number(product.price)}</p>
      </div>
    `;
    const image = card.querySelector('img');
    image.addEventListener('error', () => {
      card.classList.add('image-missing');
      image.remove();
    }, { once: true });
    bubble.appendChild(card);
  });

  row.append(avatar, bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

async function fetchMenu() {
  if (menuCache.length) return menuCache;
  const response = await fetch('/api/menu');
  const data = await response.json();
  menuCache = data.products || [];
  return menuCache;
}

async function sendMessage(message, options = {}) {
  const text = message.trim();
  if (!text) return;

  if (!options.silent) {
    appendMessage(text, 'user');
  }
  input.value = '';
  input.disabled = true;
  form.querySelector('button').disabled = true;

  const typing = appendTyping();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId }),
    });

    const data = await response.json();
    typing.remove();
    appendMessage(data.reply || "Sorry, I'm having a little trouble right now. Please try again in a moment!");

    if (/menu|items|catalog/i.test(text)) {
      const products = await fetchMenu();
      appendMenu(products);
    }
  } catch (error) {
    console.error(error);
    typing.remove();
    appendMessage("Sorry, I'm having a little trouble right now. Please try again in a moment!");
  } finally {
    input.disabled = false;
    form.querySelector('button').disabled = false;
    input.focus();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

quickActions.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-prompt]');
  if (!button) return;
  sendMessage(button.dataset.prompt);
});

window.addEventListener('load', () => {
  sendMessage('Hello', { silent: true });
});
