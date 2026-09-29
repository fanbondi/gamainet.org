const JARGON_TERMS = [
  {
    id: 'agi',
    term: 'AGI',
    subtitle: 'Artificial general intelligence',
    body: 'AI that could learn and handle many kinds of tasks at a human level, not just one narrow job. Researchers use the term for a long term goal. Today’s products are specialised tools, not full AGI.',
  },
  {
    id: 'llm',
    term: 'LLM',
    subtitle: 'Large language model',
    body: 'Software trained on large amounts of text to understand and generate language. LLMs power chat assistants, search helpers, and coding tools. They predict likely words, so answers should always be checked.',
  },
  {
    id: 'inference',
    term: 'LLM inference',
    subtitle: 'When the model actually runs',
    body: 'Training teaches a model once. Inference is what happens every time you send a prompt and wait for a reply. Speed, cost, and hardware matter most at inference time, especially for live apps and chatbots.',
  },
  {
    id: 'vllm',
    term: 'vLLM',
    subtitle: 'High throughput serving',
    body: 'An open source engine that serves LLMs efficiently on servers, often behind an API many users share. Teams use it when they need fast responses and good use of GPUs or NPUs in production.',
  },
  {
    id: 'rag',
    term: 'RAG',
    subtitle: 'Retrieval augmented generation',
    body: 'A pattern where the system finds relevant documents first, then asks the model to answer using that text. It helps ground answers in your own material instead of guessing from memory alone.',
  },
  {
    id: 'safety',
    term: 'AI safety',
    subtitle: 'Trustworthy systems',
    body: 'Work to reduce harm from AI: reliability, fairness, privacy, misuse, and keeping people in control. AI-GAMNET treats safety as part of community education, not only a topic for big labs.',
  },
  {
    id: 'future',
    term: 'Future of AI',
    subtitle: 'What people debate now',
    body: 'Conversations about stronger models, regulation, jobs, energy use, and fair access, especially for Africa. The future is shaped by policy, open research, and how communities like ours participate.',
  },
];

let jargonIndex = 0;

function renderJargonSlide(index) {
  const tabs = document.getElementById('jargon-tabs');
  const panel = document.getElementById('jargon-panel');
  if (!tabs || !panel) return;

  jargonIndex = (index + JARGON_TERMS.length) % JARGON_TERMS.length;
  const item = JARGON_TERMS[jargonIndex];

  tabs.innerHTML = JARGON_TERMS.map((t, i) => {
    const active = i === jargonIndex ? ' active' : '';
    return `<button type="button" class="jargon-tab${active}" role="tab" aria-selected="${i === jargonIndex}" id="jargon-tab-${t.id}" aria-controls="jargon-panel" onclick="selectJargon(${i})">${t.term}</button>`;
  }).join('');

  panel.innerHTML = `
    <span class="hero-event-spotlight-tag">${item.term}</span>
    <strong>${item.subtitle}</strong>
    <span class="hero-jargon-desc">${item.body}</span>
  `;
}

function selectJargon(index) {
  renderJargonSlide(index);
}

function stepJargon(delta) {
  renderJargonSlide(jargonIndex + delta);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('jargon-slider')) renderJargonSlide(0);
});
