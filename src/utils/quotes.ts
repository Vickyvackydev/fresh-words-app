export interface Quote {
  text: string;
  author: string;
}

export const DAILY_QUOTES: Quote[] = [
  { text: "Faith is taking the first step even when you don't see the whole staircase.", author: "Martin Luther King Jr." },
  { text: "God does not call the qualified, He qualifies the called.", author: "Unknown" },
  { text: "Prayer is not overcoming God's reluctance; it is laying hold of His willingness.", author: "Martin Luther" },
  { text: "The size of your candle determines the size of your shadow. Dwell in the Son.", author: "A.W. Tozer" },
  { text: "You are the only Bible some unbelievers will ever read.", author: "John MacArthur" },
  { text: "God will meet you where you are in order to take you where He wants you to go.", author: "Tony Evans" },
  { text: "He is no fool who gives what he cannot keep to gain what he cannot lose.", author: "Jim Elliot" },
  { text: "Relying on God has to begin all over again every day as if nothing had yet been done.", author: "C.S. Lewis" },
  { text: "Worry does not empty tomorrow of its sorrow, it empties today of its strength.", author: "Corrie ten Boom" },
  { text: "God's work done in God's way will never lack God's supplies.", author: "Hudson Taylor" },
  { text: "True humility is not thinking less of yourself, it is thinking of yourself less.", author: "C.S. Lewis" },
  { text: "Be faithful in small things because it is in them that your strength lies.", author: "Mother Teresa" },
  { text: "Don't pray for an easy life, pray to be a stronger person.", author: "Phillips Brooks" },
  { text: "God writes straight with crooked lines.", author: "Portuguese Proverb" },
  { text: "Aim at heaven and you will get earth thrown in. Aim at earth and you will get neither.", author: "C.S. Lewis" },
  { text: "A Christian's life is the world's Bible.", author: "D.L. Moody" },
  { text: "Feed your faith and your doubts will starve to death.", author: "D.L. Moody" },
  { text: "God NEVER shuts one door without opening a bigger and better one.", author: "Billy Graham" },
  { text: "When you can't trace His hand, trust His heart.", author: "Charles Spurgeon" },
  { text: "The Lord will fight for you; you need only to be still.", author: "Exodus 14:14" },
  { text: "Trust in the LORD with all your heart and lean not on your own understanding.", author: "Proverbs 3:5" },
  { text: "I can do all this through Him who gives me strength.", author: "Philippians 4:13" },
  { text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you.", author: "Jeremiah 29:11" },
  { text: "Cast all your anxiety on Him because He cares for you.", author: "1 Peter 5:7" },
  { text: "The steadfast love of the LORD never ceases; His mercies never come to an end; they are new every morning.", author: "Lamentations 3:22-23" },
  { text: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid.", author: "John 14:27" },
  { text: "The LORD is my shepherd, I lack nothing.", author: "Psalm 23:1" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", author: "Joshua 1:9" },
  { text: "Wait for the LORD; be strong and take heart and wait for the LORD.", author: "Psalm 27:14" },
  { text: "Give thanks to the LORD, for He is good; His love endures forever.", author: "1 Chronicles 16:34" }
];

/**
 * Deterministically returns the quote of the day based on current date (YYYY-MM-DD).
 * Changes automatically every day.
 */
export function getQuoteOfDay(dateStr?: string): Quote {
  const d = dateStr ? new Date(dateStr) : new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear) % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}
