/**
 * DeepFocus Curated Motivational Quotes & Study Tips
 */

const STUDY_QUOTES = [
  { text: "Consistency is what transforms average into excellence.", author: "DeepFocus Affirmations" },
  { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Do something today that your future self will thank you for.", author: "Study Motivation" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Vidushi Learning" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" }
];

class QuoteManager {
  constructor(quoteElementId) {
    this.quoteElem = document.getElementById(quoteElementId);
    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.showQuote(0);
    const refreshBtn = document.getElementById('refresh-quote-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.nextQuote());
    }
  }

  showQuote(index) {
    this.currentIndex = index % STUDY_QUOTES.length;
    const q = STUDY_QUOTES[this.currentIndex];
    if (this.quoteElem) {
      this.quoteElem.innerHTML = `"${q.text}" <span class="text-indigo-400 font-semibold">— ${q.author}</span>`;
    }
  }

  nextQuote() {
    const nextIdx = (this.currentIndex + 1) % STUDY_QUOTES.length;
    this.showQuote(nextIdx);
  }
}

window.quoteManager = null;
document.addEventListener('DOMContentLoaded', () => {
  window.quoteManager = new QuoteManager('quote-text');
});
