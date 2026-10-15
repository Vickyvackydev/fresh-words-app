export interface Hymn {
  id: string;
  number: number;
  title: string;
  chorus?: string;
  verses: string[];
  category: string;
  author?: string;
  key?: string;
  is_translated?: boolean;
}

export const MOCK_HYMNS: Hymn[] = [
  {
    id: "hymn_1",
    number: 1,
    title: "Holy, Holy, Holy! Lord God Almighty!",
    author: "Reginald Heber (1826)",
    key: "Key: E Major (NICAEA)",
    category: "Adoration and Praise",
    verses: [
      "Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy! Merciful and mighty!\nGod in three Persons, blessed Trinity!",
      "Holy, holy, holy! All the saints adore Thee,\nCasting down their golden crowns around the glassy sea;\nCherubim and seraphim falling down before Thee,\nWhich wert, and art, and evermore shalt be.",
      "Holy, holy, holy! Though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see;\nOnly Thou art holy; there is none beside Thee,\nPerfect in power, in love, and purity.",
      "Holy, holy, holy! Lord God Almighty!\nAll Thy works shall praise Thy name, in earth, and sky, and sea;\nHoly, holy, holy! Merciful and mighty!\nGod in three Persons, blessed Trinity!",
    ],
  },
  {
    id: "hymn_2",
    number: 2,
    title: "Praise, My Soul, the King of Heaven",
    author: "Henry F. Lyte (1834)",
    key: "Key: D Major (PRAISE MY SOUL)",
    category: "Adoration and Praise",
    chorus: "Praise Him! Praise Him! Praise Him! Praise Him!\nPraise the everlasting King.",
    verses: [
      "Praise, my soul, the King of heaven;\nTo His feet thy tribute bring;\nRansomed, healed, restored, forgiven,\nWho like thee His praise should sing?",
      "Praise Him for His grace and favour\nTo our fathers in distress;\nPraise Him still the same forever,\nSlow to chide and swift to bless.",
      "Father-like, He tends and spares us;\nWell our feeble frame He knows;\nIn His hands He gently bears us,\nRescues us from all our foes.",
      "Frail as summer's flower we flourish,\nBlows the wind and it is gone;\nBut while mortals rise and perish,\nGod endures unchanging on.",
      "Angels, help us to adore Him;\nYe behold Him face to face;\nSun and moon, bow down before Him,\nDwellers all in time and space.",
    ],
  },
  {
    id: "hymn_3",
    number: 3,
    title: "Amazing Grace",
    author: "John Newton (1779)",
    key: "Key: G Major (NEW BRITAIN)",
    category: "Atonement and Grace",
    verses: [
      "Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.",
      "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.",
      "Through many dangers, toils and snares,\nI have already come;\n'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.",
      "The Lord has promised good to me,\nHis Word my hope secures;\nHe will my Shield and Portion be,\nAs long as life endures.",
      "When we've been there ten thousand years,\nBright shining as the sun,\nWe've no less days to sing God's praise\nThan when we'd first begun.",
    ],
  },
  {
    id: "hymn_4",
    number: 4,
    title: "Great Is Thy Faithfulness",
    author: "Thomas O. Chisholm (1923)",
    key: "Key: D Major (FAITHFULNESS)",
    category: "Faith and Trust",
    chorus:
      "Great is Thy faithfulness! Great is Thy faithfulness!\nMorning by morning new mercies I see;\nAll I have needed Thy hand hath provided—\nGreat is Thy faithfulness, Lord, unto me!",
    verses: [
      "Great is Thy faithfulness, O God my Father,\nThere is no shadow of turning with Thee;\nThou changest not, Thy compassions, they fail not;\nAs Thou hast been Thou forever wilt be.",
      "Summer and winter, and springtime and harvest,\nSun, moon and stars in their courses above,\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love.",
      "Pardon for sin and a peace that endureth,\nThine own dear presence to cheer and to guide;\nStrength for today and bright hope for tomorrow,\nBlessings all mine, with ten thousand beside!",
    ],
  },
  {
    id: "hymn_5",
    number: 5,
    title: "Blessed Assurance",
    author: "Fanny J. Crosby (1873)",
    key: "Key: D Major (ASSURANCE)",
    category: "Assurance",
    chorus:
      "This is my story, this is my song,\nPraising my Savior all the day long;\nThis is my story, this is my song,\nPraising my Savior all the day long.",
    verses: [
      "Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHier of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.",
      "Perfect submission, perfect delight,\nVisions of rapture now burst on my sight;\nAngels descending, bring from above\nEchoes of mercy, whispers of love.",
      "Perfect submission, all is at rest,\nI in my Savior am happy and blest,\nWatching and waiting, looking above,\nFilled with His goodness, lost in His love.",
    ],
  },
  {
    id: "hymn_6",
    number: 6,
    title: "It Is Well With My Soul",
    author: "Horatio G. Spafford (1873)",
    key: "Key: C Major (VILLE DU HAVRE)",
    category: "Peace and Comfort",
    chorus:
      "It is well with my soul,\nIt is well, it is well with my soul.",
    verses: [
      "When peace like a river, attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\nIt is well, it is well with my soul.",
      "Though Satan should buffet, though trials should come,\nLet this blest assurance control,\nThat Christ has regarded my helpless estate,\nAnd hath shed His own blood for my soul.",
      "My sin—oh, the bliss of this glorious thought!—\nMy sin, not in part but the whole,\nIs nailed to the cross, and I bear it no more,\nPraise the Lord, praise the Lord, O my soul!",
      "And Lord, haste the day when my faith shall be sight,\nThe clouds be rolled back as a scroll;\nThe trump shall resound, and the Lord shall descend,\nEven so, it is well with my soul.",
    ],
  },
  {
    id: "hymn_7",
    number: 7,
    title: "How Great Thou Art",
    author: "Stuart K. Hine (1949)",
    key: "Key: Bb Major (O STORE GUD)",
    category: "Adoration and Praise",
    chorus:
      "Then sings my soul, my Savior God, to Thee,\nHow great Thou art! How great Thou art!\nThen sings my soul, my Savior God, to Thee,\nHow great Thou art! How great Thou art!",
    verses: [
      "O Lord my God, when I in awesome wonder,\nConsider all the worlds Thy hands have made;\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.",
      "When through the woods, and forest glades I wander,\nAnd hear the birds sing sweetly in the trees;\nWhen I look down, from lofty mountain grandeur\nAnd see the brook, and feel the gentle breeze.",
      "And when I think, that God, His Son not sparing;\nSent Him to die, I scarce can take it in;\nThat on the cross, my burden gladly bearing,\nHe bled and died to take away my sin.",
      "When Christ shall come, with shout of acclamation,\nAnd take me home, what joy shall fill my heart!\nThen I shall bow, in humble adoration,\nAnd then proclaim: 'My God, how great Thou art!'",
    ],
  },
  {
    id: "hymn_8",
    number: 8,
    title: "Praise Him! Praise Him!",
    author: "Fanny J. Crosby (1869)",
    key: "Key: Ab Major (ALLEN)",
    category: "Adoration and Praise",
    chorus:
      "Praise Him! Praise Him! Tell of His excellent greatness;\nPraise Him! Praise Him! Ever in joyful song!",
    verses: [
      "Praise Him! Praise Him! Jesus, our blessed Redeemer!\nSing, O Earth, His wonderful love proclaim!\nHail Him! Hail Him! Highest archangels in glory;\nStrength and honor give to His holy name!\nLike a shepherd, Jesus will guard His children,\nIn His arms He carries them all day long.",
      "Praise Him! Praise Him! Jesus, our blessed Redeemer!\nFor our sins He suffered, and bled, and died;\nHe, our Rock, our hope of eternal salvation,\nHail Him! Hail Him! Jesus the Crucified.\nSound His praises! Jesus who bore our sorrows,\nLove unbounded, wonderful, deep and strong.",
      "Praise Him! Praise Him! Jesus, our blessed Redeemer!\nHeavenly portals loud with hosannas ring!\nJesus, Savior, reigneth forever and ever;\nCrown Him! Crown Him! Prophet, and Priest, and King!\nChrist is coming! Over the globe victorious,\nPower and glory unto the Lord belong.",
    ],
  },
  {
    id: "hymn_9",
    number: 9,
    title: "Rock of Ages, Cleft for Me",
    author: "Augustus M. Toplady (1776)",
    key: "Key: Bb Major (TOPLADY)",
    category: "Atonement and Grace",
    verses: [
      "Rock of Ages, cleft for me,\nLet me hide myself in Thee;\nLet the water and the blood,\nFrom Thy wounded side which flowed,\nBe of sin the double cure,\nSave from wrath and make me pure.",
      "Not the labors of my hands\nCan fulfill Thy law's demands;\nCould my zeal no respite know,\nCould my tears forever flow,\nAll for sin could not atone;\nThou must save, and Thou alone.",
      "Nothing in my hand I bring,\nSimply to the cross I cling;\nNaked, come to Thee for dress;\nHelpless, look to Thee for grace;\nFoul, I to the fountain fly;\nWash me, Savior, or I die.",
      "While I draw this fleeting breath,\nWhen mine eyes shall close in death,\nWhen I soar to worlds unknown,\nSee Thee on Thy judgment throne,\nRock of Ages, cleft for me,\nLet me hide myself in Thee.",
    ],
  },
  {
    id: "hymn_10",
    number: 10,
    title: "O Worship the King",
    author: "Robert Grant (1833)",
    key: "Key: G Major (LYONS)",
    category: "Adoration and Praise",
    verses: [
      "O worship the King, all glorious above,\nO gratefully sing His power and His love;\nOur Shield and Defender, the Ancient of Days,\nPavilion'd in splendor, and girded with praise.",
      "O tell of His might, O sing of His grace,\nWhose robe is the light, whose canopy space;\nHis chariots of wrath the deep thunderclouds form,\nAnd dark is His path on the wings of the storm.",
      "Thy bountiful care, what tongue can recite?\nIt breathes in the air, it shines in the light;\nIt streams from the hills, it descends to the plain,\nAnd sweetly distils in the dew and the rain.",
      "Frail children of dust, and feeble as frail,\nIn Thee do we trust, nor find Thee to fail;\nThy mercies, how tender, how firm to the end,\nOur Maker, Defender, Redeemer, and Friend!",
    ],
  },
];
