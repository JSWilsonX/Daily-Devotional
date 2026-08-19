import { BookOpen, Compass, Book, Anchor, Smile } from "lucide-react";
import { Devotional, DevotionalProfile, VoiceProfile } from "../types";

export const PRONUNCIATION_REPLACEMENTS: Record<string, string> = {
  LIVE_VERB: "liv",
  LIVE_ADJECTIVE: "live",
  READ_PRESENT: "reed",
  READ_PAST: "red",
  LEAD_VERB: "leed",
  LEAD_METAL: "led",
  WIND_AIR: "wind",
  WIND_TURN: "wynd",
  TEAR_RIP: "tare",
  TEAR_CRY: "teer",
  BASS_MUSIC: "base",
  BASS_FISH: "bass",
  CLOSE_NEAR: "klohs",
  CLOSE_SHUT: "cloze",
  MINUTE_TIME: "minnit",
  MINUTE_TINY: "mynewt",
  OBJECT_NOUN: "objekt",
  OBJECT_VERB: "ubjekt",
  RECORD_NOUN: "rekurd",
  RECORD_VERB: "rikord",
  PRESENT_NOUN: "present",
  PRESENT_VERB: "prescent"
};

export const DEVOTIONAL_PROFILES: DevotionalProfile[] = [
  {
    id: "classic",
    name: "Classic / Original",
    description: "Ellen White's authentic, reverent 19th-century text verbatim",
    icon: BookOpen,
    badge: ""
  },
  {
    id: "clear_modern",
    name: "Clear & Modern",
    description: "Dignified, respectful, and articulate modern English with active phrasing",
    icon: Compass,
    badge: "Professional Adult"
  },
  {
    id: "easy_reading",
    name: "Easy Reading",
    description: "A highly accessible version using clear language, simplified vocabulary, and direct sentence structures for easy comprehension.",
    badge: "Simplified English",
    icon: Book
  },
  {
    id: "young_adult",
    name: "Young Adult",
    description: "An authentic, thought-provoking adaptation that reframes scriptural themes around modern culture, ethics, and identity.",
    badge: "Collegiate & YA",
    icon: Compass
  },
  {
    id: "teens_youth",
    name: "Teens & Youth",
    description: "An engaging, supportive message that translates spiritual principles into the real-world experiences and peer dynamics of middle and high schoolers.",
    badge: "Middle & High School",
    icon: Anchor
  },
  {
    id: "kids_primary",
    name: "Kids & Primary",
    description: "An enthusiastic, story-driven journey that brings lessons to life for young minds using concrete examples and rich sensory details.",
    badge: "Early Elementary",
    icon: Smile
  }
];

export const PROFILE_VOICE_CONFIGS: Record<string, VoiceProfile> = {
  classic: {
    rate: 0.85,
    pitch: 0.85,
    genderPref: "male"
  },
  clear_modern: {
    rate: 1.0,
    pitch: 1.0,
    genderPref: "female"
  },
  easy_reading: {
    rate: 0.9,
    pitch: 1.0,
    genderPref: "female"
  },
  young_adult: {
    rate: 1.0,
    pitch: 1.0,
    genderPref: "any"
  },
  teens_youth: {
    rate: 1.02,
    pitch: 1.05,
    genderPref: "any"
  },
  kids_primary: {
    rate: 0.95,
    pitch: 1.1,
    genderPref: "female"
  }
};

export const UNREAD_BOOKS_ORDER = [
  "blj", // To Be Like Jesus
  "flb", // The Faith I Live By
  "mar", // Maranatha
  "yrp", // Ye Shall Receive Power
  "wgd", // With God at Dawn
  "tmk", // That I May Know Him
  "sd",  // Sons and Daughters of God
  "ohc", // Our High Calling
  "cc",  // Conflict and Courage
  "ag",  // God's Amazing Grace
  "lhu", // Lift Him Up
  "rc",  // Reflecting Christ
  "mlt", // My Life Today
  "hp",  // In Heavenly Places
  "jnn", // Jesus, Name Above All Names
  "rre", // Radiant Religion
  "tdg", // This Day with God
  "ul",  // The Upward Look
  "ofc", // Our Father Cares
  "ctr", // Christ Triumphant
  "fh",  // From the Heart
  "hb"   // Homeward Bound
];

export const dailyDevotionals: Devotional[] = [
  {
    id: "ohc",
    title: "Our High Calling",
    cover: "https://media2.egwwritings.org/covers/81_s.jpg",
    link: "https://whiteestate.org/devotional/ohc/",
    description: "This devotional classic calls readers to holiness, spiritual maturity, and a deeper commitment to Christ. It explores faith, temptation, salvation, and the challenges of wealth, criticism, and suffering."
  },
  {
    id: "fh",
    title: "From the Heart",
    cover: "https://media2.egwwritings.org/covers/12210_s.jpg",
    link: "https://whiteestate.org/devotional/fh/",
    description: "These messages were written to guide searching hearts toward Jesus and prepare believers for His soon return. They offer encouragement, wisdom, and gentle correction for a closer walk with God."
  },
  {
    id: "ul",
    title: "The Upward Look",
    cover: "https://media2.egwwritings.org/covers/147_s.jpg",
    link: "https://whiteestate.org/devotional/ul/",
    description: "This devotional keeps the reader's eyes fixed on Jesus as both example and source of saving grace. Its reflections lift the heart heavenward and strengthen faith step by step."
  },
  {
    id: "tmk",
    title: "That I May Know Him",
    cover: "https://media2.egwwritings.org/covers/126_s.jpg",
    link: "https://whiteestate.org/devotional/tmk/",
    description: "These readings invite readers into a fuller knowledge of God through warm, personal messages and intimate reflections. They reveal the heart of prayer, devotion, and a life centered on Christ."
  },
  {
    id: "rc",
    title: "Reflecting Christ",
    cover: "https://media2.egwwritings.org/covers/89_s.jpg",
    link: "https://whiteestate.org/devotional/rc/",
    description: "A Christ-centered devotional that encourages believers to walk in the footsteps of Jesus. It highlights the beauty of a life shaped by His character and love."
  },
  {
    id: "ctr",
    title: "Christ Triumphant",
    cover: "https://media2.egwwritings.org/covers/9_s.jpg",
    link: "https://whiteestate.org/devotional/ctr/",
    description: "These daily readings draw from the great controversy theme and focus on God's power to overcome. They strengthen hope by pointing to the triumph of Christ over evil."
  },
  {
    id: "cc",
    title: "Conflict and Courage",
    cover: "https://media2.egwwritings.org/covers/17_s.jpg",
    link: "https://whiteestate.org/devotional/cc/",
    description: "This devotional traces decisive moments in salvation history and shows how the past still speaks to the present. It offers counsel, courage, and hope for faithful living today."
  },
  {
    id: "ag",
    title: "God's Amazing Grace",
    cover: "https://media2.egwwritings.org/covers/33_s.jpg",
    link: "https://whiteestate.org/devotional/ag/",
    description: "These reflections invite readers to experience the peace and strength that come from daily communion with God. They celebrate grace as the power that changes the heart and shapes the life."
  },
  {
    id: "hp",
    title: "In Heavenly Places",
    cover: "https://media2.egwwritings.org/covers/38_s.jpg",
    link: "https://whiteestate.org/devotional/hp/",
    description: "This collection brings readers into a deeper understanding of Christ's character and the work of heaven. It encourages a life of devotion, surrender, and holy fellowship with God."
  },
  {
    id: "lhu",
    title: "Lift Him Up",
    cover: "https://media2.egwwritings.org/covers/44_s.jpg",
    link: "https://whiteestate.org/devotional/lhu/",
    description: "These reflections center on Jesus as Teacher, Healer, King, and Redeemer. They call readers to behold Him more clearly and be transformed by His likeness."
  },
  {
    id: "mar",
    title: "Maranatha",
    cover: "https://media2.egwwritings.org/covers/74_s.jpg",
    link: "https://whiteestate.org/devotional/mar/",
    description: "This devotional focuses on the blessed hope of Christ's soon return. It stirs longing for deliverance and renewed faith in the promises of God."
  },
  {
    id: "mlt",
    title: "My Life Today",
    cover: "https://media2.egwwritings.org/covers/79_s.jpg",
    link: "https://whiteestate.org/devotional/mlt/",
    description: "These readings touch nearly every area of the Christian life with warmth and practical insight. They remind readers of God's fatherly love and the call to live fully for Him."
  },
  {
    id: "ofc",
    title: "Our Father Cares",
    cover: "https://media2.egwwritings.org/covers/80_s.jpg",
    link: "https://whiteestate.org/devotional/ofc/",
    description: "This devotional explores the Father's love for His children and the comfort of being held by Him. It encourages trust, gratitude, and hope in the midst of life's struggles."
  },
  {
    id: "blj",
    title: "To Be Like Jesus",
    cover: "https://media2.egwwritings.org/covers/151_s.jpg",
    link: "https://whiteestate.org/devotional/blj/",
    description: "These devotionals call believers into deeper fellowship with God and a life shaped by Christ's likeness. They invite readers to walk closely with the Shepherd and follow Him day by day."
  },
  {
    id: "flb",
    title: "The Faith I Live By",
    cover: "https://media2.egwwritings.org/covers/131_s.jpg",
    link: "https://whiteestate.org/devotional/flb/",
    description: "This devotional is devoted to the foundational truths of Scripture and the doctrines that strengthen faith. It offers daily reflection that is both inspiring and instructive."
  },
  {
    id: "hb",
    title: "Homeward Bound",
    cover: "https://media2.egwwritings.org/covers/12862_s.jpg",
    link: "https://whiteestate.org/devotional/hb/",
    description: "These readings encourage surrender, victory in Christ, and hope as believers journey toward home. They reflect major themes of faith, holiness, and the great controversy."
  },
  {
    id: "rre",
    title: "Radiant Religion",
    cover: "https://media2.egwwritings.org/covers/14039_s.jpg",
    link: "https://whiteestate.org/devotional/rre/",
    description: "This early devotional collection reflects the spiritual life of earnest discipleship. It offers a foundational look at living with radiant faith and purpose."
  },
  {
    id: "sd",
    title: "Sons and Daughters of God",
    cover: "https://media2.egwwritings.org/covers/102_s.jpg",
    link: "https://whiteestate.org/devotional/sd/",
    description: "These reflections invite readers to pursue the highest standard of spiritual attainment in Christ. They emphasize the cross, holiness, and the dignity of belonging to God."
  },
  {
    id: "tdg",
    title: "This Day with God",
    cover: "https://media2.egwwritings.org/covers/149_s.jpg",
    link: "https://whiteestate.org/devotional/tdg/",
    description: "This devotional is arranged by the day they were written, giving the reader a personal and historical glimpse into Ellen White's counsel. It offers encouragement, wisdom, and hope."
  },
  {
    id: "wgd",
    title: "With God at Dawn",
    cover: "https://media2.egwwritings.org/covers/13940_s.jpg",
    link: "https://whiteestate.org/devotional/wgd/",
    description: "These readings begin the day with spiritual focus and renewed commitment to God. They are designed to help readers meet each morning with reverence and purpose."
  },
  {
    id: "yrp",
    title: "Ye Shall Receive Power",
    cover: "https://media2.egwwritings.org/covers/153_s.jpg",
    link: "https://whiteestate.org/devotional/yrp/",
    description: "A devotional that highlights the promise and power of the Holy Spirit in everyday discipleship. It encourages readers to welcome His presence and cooperate with His work."
  },
  {
    id: "jnn",
    title: "Jesus, Name Above All Names",
    cover: "https://media2.egwwritings.org/covers/14150_s.jpg",
    link: "https://whiteestate.org/devotional/jnn/",
    description: "This devotional explores the many names of Jesus and draws readers into deeper love for Him. It offers a fresh, intimate way to behold the Savior each day."
  }
];
