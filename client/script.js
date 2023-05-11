import bot from '/assets/sancury.png';
import user from '/assets/person-circle.svg';
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    if (element.textContent === '...') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (text && index < text.length) {
      // check if text is defined before accessing its length property
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img
                    src=${isAi ? bot : user}
                    alt="${isAi ? 'bot' : 'user'}"
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  try {
    const response = await fetch('https://boeai.onrender.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: data.get('prompt'),
      }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot && data.bot.trim();

      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();

      messageDiv.innerHTML = 'Oopsie! Something went wrong';
      console.error(`Error: ${response.status} - ${err}`);
    }
  } catch (err) {
    messageDiv.innerHTML = 'Oopsie! Something went wrong';
    console.error(`Error: ${err}`);
  }
};

form.addEventListener('submit', handleSubmit);
