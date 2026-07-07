export interface Devotional {
  id: string;
  category: 'Daily Deliverance' | 'Holiness Devotional' | 'Prayer Devotional' | '2026 Devotional';
  title: string;
  date: string; // YYYY-MM-DD
  readingTime: number; // minutes
  scriptureRef: string;
  scriptureText: string;
  body: string[];
  prayer: string;
  reflection: string;
  actionPoints: string[];
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  name: string;
  testament: 'Old' | 'New';
  chapters: BibleChapter[];
}

export const MOCK_DEVOTIONALS: Devotional[] = [
  {
    id: 'dev-1',
    category: 'Daily Deliverance',
    title: 'Walking In Faith',
    date: '2026-07-05', // Today
    readingTime: 10,
    scriptureRef: 'Hebrews 11:1-3',
    scriptureText: 'Now faith is the assurance of things hoped for, the conviction of things not seen. For by it the people of old received their commendation.',
    body: [
      'Faith is not a blind leap into the dark; it is a calculated step into the light of God\'s promises. When we face trials, our immediate reaction is often to rely on our own strength or seek instant solutions. However, God calls us to stand still and trust in His sovereign timing.',
      'To walk by faith means to let go of our desire to control the outcome. It requires daily surrender, recognizing that the Creator of the universe has already chartered our path. As we read the stories of faithful men and women in Scripture, we see that their faith was tested, but their trust was ultimately rewarded.',
      'Today, whatever challenge lies before you, declare that God is bigger than your circumstances. Step out in confidence, knowing that He goes before you and protects you from behind.'
    ],
    prayer: 'Lord, increase my faith today. Teach me to trust in Your unseen hand and to walk boldly in the plans You have laid out for me. Help me to lay down my worries at Your feet. Amen.',
    reflection: 'What area of your life are you holding onto that you need to surrender to God\'s control today?',
    actionPoints: [
      'Write down three of God\'s promises that apply to your current situation.',
      'Spend 5 minutes in quiet prayer, intentionally surrendering your primary worry.',
      'Share an encouraging word of faith with someone else today.'
    ]
  },
  {
    id: 'dev-2',
    category: 'Prayer Devotional',
    title: 'The Power of Stillness',
    date: '2026-07-04', // Yesterday
    readingTime: 8,
    scriptureRef: 'Psalm 46:10',
    scriptureText: 'Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!',
    body: [
      'We live in a world that equates busyness with productivity. We are constantly connected, constantly notified, and constantly moving. Yet, the deepest encounters with God often happen in the quiet spaces, in the moments of total stillness.',
      'Stillness is not passive laziness; it is an active positioning of the soul. By silencing the noise around us, we create room to hear the gentle whisper of the Holy Spirit. In stillness, we acknowledge that God is in control and we are not.',
      'Take time today to disconnect from your devices and connect with the Father. Allow His peace to saturate your mind and quiet your anxious thoughts.'
    ],
    prayer: 'Heavenly Father, quiet my heart in Your presence. Quiet the noise of this world so I can hear Your voice. Renew my strength as I wait quietly on You. Amen.',
    reflection: 'How can you create a daily habit of quiet time with God amidst your busy schedule?',
    actionPoints: [
      'Turn off all notifications for 30 minutes today.',
      'Sit in silence for 5 minutes, focusing purely on breathing and God\'s presence.',
      'Read Psalm 46 and meditate on His sovereignty.'
    ]
  },
  {
    id: 'dev-3',
    category: 'Holiness Devotional',
    title: 'A Pure Heart',
    date: '2026-07-03', // Missed day (unread)
    readingTime: 6,
    scriptureRef: 'Psalm 51:10',
    scriptureText: 'Create in me a clean heart, O God, and renew a right spirit within me.',
    body: [
      'Purity is not the absence of temptation, but the presence of a resolved heart to honor God. Our thoughts and desires dictate our actions. If we fill our minds with the things of this world, our hearts will naturally reflect worldly values.',
      'David prayed for a clean heart after recognizing his own brokenness. Purity begins with repentance and daily alignment with God\'s Word. It is a process of refinement, where the Holy Spirit chips away our selfish desires and replaces them with holy passions.',
      'Guard your heart today. Be mindful of what you watch, what you listen to, and what you meditate on.'
    ],
    prayer: 'Lord, search my heart and show me any ways that do not honor You. Cleanse me and renew a steadfast spirit within me. I desire to live a life that is holy and pleasing in Your sight. Amen.',
    reflection: 'What influences are entering your heart that might be clouding your spiritual vision?',
    actionPoints: [
      'Identify one compromise in your life and commit to turning away from it today.',
      'Memorize Psalm 51:10 and recite it when temptations arise.',
      'Do a digital cleanup: unfollow accounts that pull you away from holiness.'
    ]
  },
  {
    id: 'dev-4',
    category: 'Daily Deliverance',
    title: 'Overcoming Fear',
    date: '2026-07-02', // Read day
    readingTime: 9,
    scriptureRef: '2 Timothy 1:7',
    scriptureText: 'For God gave us a spirit not of fear but of power and love and self-control.',
    body: [
      'Fear is one of the enemy\'s greatest tools to paralyze the children of God. It whispers lies about our future, our security, and our worth. But Scripture tells us that fear does not come from God.',
      'God has clothed you with power to overcome, love to cast out fear, and a sound mind to think clearly under pressure. When fear knocks, answer with the Word of God. Speak truth to your worries and remind yourself of who is on your side.',
      'You are not a victim of fear; you are a victor through Christ Jesus who loved you.'
    ],
    prayer: 'Father, thank You that You have not given me a spirit of fear. Fill me with Your power, love, and self-control. Teach me to cast all my anxieties onto You because You care for me. Amen.',
    reflection: 'What fear is currently holding you back from stepping into what God has for you?',
    actionPoints: [
      'Speak 2 Timothy 1:7 aloud three times today.',
      'Act in spite of fear: do one small thing today that requires courage.',
      'Pray for someone else who is struggling with anxiety or fear.'
    ]
  },
  {
    id: 'dev-5',
    category: 'Daily Deliverance',
    title: 'Resting in the Shadow of the Almighty',
    date: '2026-07-01', // Completed Day
    readingTime: 10,
    scriptureRef: 'Psalm 91:1-2',
    scriptureText: 'He who dwells in the shelter of the Most High will abide in the shadow of the Almighty. I will say to the Lord, "My refuge and my fortress, my God, in whom I trust."',
    body: [
      'Abiding in the shadow of the Almighty suggests closeness and intimacy. A shadow is cast only when something is near. To dwell in God\'s shelter is to make Him our permanent residence, not just a temporary emergency shelter.',
      'When the storms of life rage, those who abide in God find immediate protection. They do not panic because they know their refuge is unshakable.',
      'Make the Lord your dwelling place today. Speak words of trust and refuse to harbor doubt in your heart.'
    ],
    prayer: 'Lord, You are my refuge and my fortress. I choose to dwell in Your shelter and rest in Your shadow today. Keep me safe under Your wings. Amen.',
    reflection: 'What does it look like practically to "dwell" in God\'s presence throughout a busy workday?',
    actionPoints: [
      'Dwell on Psalm 91 during your lunch break.',
      'Set an hourly reminder to say: "Lord, You are my refuge, I trust in You."',
      'Offer words of comfort to someone experiencing a storm in their life.'
    ]
  },
  {
    id: 'dev-6',
    category: 'Daily Deliverance',
    title: 'The Lord is My Shepherd',
    date: '2026-07-06', // Future Day
    readingTime: 7,
    scriptureRef: 'Psalm 23:1-3',
    scriptureText: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.',
    body: [
      'A shepherd cares for, feeds, protects, and guides his sheep. When David wrote this psalm, he understood the deep relationship between a shepherd and his flock. Sheep are prone to wander and easily frightened, yet under the shepherd\'s care, they lack nothing.',
      'God knows exactly what you need before you even ask. He leads you to places of rest and restoration when you are weary. Trust His leadership, even when the path seems narrow or steep.'
    ],
    prayer: 'Lord, thank You for being my Shepherd. Guide my steps today, lead me beside peaceful waters, and restore my soul when I feel overwhelmed. Amen.',
    reflection: 'Are you trying to shepherd your own life, or are you letting the Good Shepherd lead?',
    actionPoints: [
      'Reflect on how God has provided for your needs this past month.',
      'Commit to following His guidance even when it goes against your personal preferences.',
      'Pray for spiritual leaders who help shepherd others.'
    ]
  },
  {
    id: 'dev-7',
    category: 'Prayer Devotional',
    title: 'Effective Prayer',
    date: '2026-07-07', // Future Day
    readingTime: 8,
    scriptureRef: 'James 5:16',
    scriptureText: 'Therefore, confess your sins to one another and pray for one another, that you may be healed. The prayer of a righteous person has great power as it is working.',
    body: [
      'Prayer is not a religious ritual; it is a direct line of communication with the Ruler of heaven and earth. Righteousness is not about perfection, but about being in right standing with God through Christ.',
      'When a righteous person prays, heaven moves. Your prayers are powerful and effective. Do not doubt that God hears you and is actively working on your behalf.'
    ],
    prayer: 'Father, thank You that my prayers matter to You. I pray with confidence today, believing that You hear me and will answer according to Your perfect will. Amen.',
    reflection: 'Do you pray expecting answers, or do you pray out of routine?',
    actionPoints: [
      'Create a prayer list of family and friends and commit to praying for them daily.',
      'Confess any hidden blocks or sins to God, requesting His cleansing grace.',
      'Write down a prayer request and date it to track answers over time.'
    ]
  },
  {
    id: 'dev-8',
    category: '2026 Devotional',
    title: 'A New Season of Growth',
    date: '2026-07-08', // Future Day
    readingTime: 12,
    scriptureRef: 'Galatians 6:9',
    scriptureText: 'And let us not grow weary of doing good, for in due season we will reap, if we do not give up.',
    body: [
      'Growth takes time. In agriculture, there is a season for planting, a season for watering, and finally, a season for harvesting. Much of our spiritual walk is spent in the quiet, hidden seasons of planting and watering.',
      'It is easy to become discouraged when we do not see immediate results. But God promises that a harvest is coming. Keep doing good, keep praying, keep reading His Word, and do not lose heart.'
    ],
    prayer: 'Lord, give me endurance for the season I am in. Help me not to grow weary, but to stay faithful in the quiet routines of spiritual growth. I trust Your harvest timing. Amen.',
    reflection: 'What area of spiritual service or growth are you tempted to quit right now?',
    actionPoints: [
      'Encourage someone else who seems weary in their spiritual journey.',
      'Identify one small habit of discipline you can commit to for the next 30 days.',
      'Praise God in advance for the harvest He is bringing.'
    ]
  }
];

export const MOCK_BIBLE: BibleBook[] = [
  {
    name: 'Genesis',
    testament: 'Old',
    chapters: [
      {
        chapter: 1,
        verses: [
          { verse: 1, text: 'In the beginning, God created the heavens and the earth.' },
          { verse: 2, text: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.' },
          { verse: 3, text: 'And God said, "Let there be light," and there was light.' },
          { verse: 4, text: 'And God saw that the light was good. And God separated the light from the darkness.' },
          { verse: 5, text: 'God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.' }
        ]
      },
      {
        chapter: 2,
        verses: [
          { verse: 1, text: 'Thus the heavens and the earth were finished, and all the host of them.' },
          { verse: 2, text: 'And on the seventh day God finished his work that he had done, and he rested on the seventh day from all his work that he had done.' },
          { verse: 3, text: 'So God blessed the seventh day and made it holy, because on it God rested from all his work that he had done in creation.' }
        ]
      }
    ]
  },
  {
    name: 'Psalms',
    testament: 'Old',
    chapters: [
      {
        chapter: 23,
        verses: [
          { verse: 1, text: 'The Lord is my shepherd; I shall not want.' },
          { verse: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.' },
          { verse: 3, text: 'He restores my soul. He leads me in paths of righteousness for his name\'s sake.' },
          { verse: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
          { verse: 5, text: 'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.' },
          { verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.' }
        ]
      },
      {
        chapter: 46,
        verses: [
          { verse: 1, text: 'God is our refuge and strength, a very present help in trouble.' },
          { verse: 10, text: 'Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!' }
        ]
      }
    ]
  },
  {
    name: 'John',
    testament: 'New',
    chapters: [
      {
        chapter: 1,
        verses: [
          { verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
          { verse: 2, text: 'He was in the beginning with God.' },
          { verse: 3, text: 'All things were made through him, and without him was not any thing made that was made.' },
          { verse: 4, text: 'In him was life, and the life was the light of men.' },
          { verse: 5, text: 'The light shines in the darkness, and the darkness has not overcome it.' }
        ]
      },
      {
        chapter: 3,
        verses: [
          { verse: 16, text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.' },
          { verse: 17, text: 'For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.' }
        ]
      }
    ]
  },
  {
    name: 'Matthew',
    testament: 'New',
    chapters: [
      {
        chapter: 6,
        verses: [
          { verse: 25, text: 'Therefore I tell you, do not be anxious about your life, what you will eat or what you will drink, nor about your body, what you will wear. Is not life more than food, and the body more than clothing?' },
          { verse: 33, text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.' },
          { verse: 34, text: 'Therefore do not be anxious about tomorrow, for tomorrow will be anxious for itself. Sufficient for the day is its own trouble.' }
        ]
      }
    ]
  },
  {
    name: 'Romans',
    testament: 'New',
    chapters: [
      {
        chapter: 8,
        verses: [
          { verse: 28, text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.' },
          { verse: 31, text: 'What then shall we say to these things? If God is for us, who can be against us?' },
          { verse: 38, text: 'For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers,' },
          { verse: 39, text: 'nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.' }
        ]
      }
    ]
  }
];

export const MOCK_QUOTES = [
  { text: "Faith is taking the first step even when you don't see the whole staircase.", author: "Martin Luther King Jr." },
  { text: "God does not call the qualified, He qualifies the called.", author: "Unknown" },
  { text: "Prayer is not overcoming God's reluctance; it is laying hold of His willingness.", author: "Martin Luther" },
  { text: "The size of your candle determines the size of your shadow. Dwell in the Son.", author: "Unknown" }
];
