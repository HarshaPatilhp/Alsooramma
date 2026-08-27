import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Slokas | Mathaji Ulsooramma Sri Raghavendra Swamy Mutt',
  description: 'Traditional Hindu slokas and prayers for spiritual practice and devotion',
};

interface Sloka {
  id: number;
  title: string;
  sanskrit: string;
  english: string;
  meaning: string;
  category: string;
}

const slokas: Sloka[] = [
  {
    id: 1,
    title: 'Gayatri Mantra',
    sanskrit: 'ॐ भूर्भुवः स्वः। तत् सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥',
    english: 'Om Bhur Bhuva Svaha. Tat Savitur Varenyam Bhargo Devasya Dhimahi. Dhiyo Yo Nah Prachodayat.',
    meaning: 'We meditate on the effulgent glory of the divine Light may he inspire our intellect.',
    category: 'Vedic Mantras'
  },
  {
    id: 2,
    title: 'Sri Raghavendra Guru Stotra',
    sanskrit: 'पूज्याय राघवेंद्राय सत्यधर्मरताय च। भजतां कल्पवृक्षाय नमतां कामधेनवे॥',
    english: 'Pujyaya Raghavendraya Satya Dharma Rataya Cha. Bhajatam Kalpavrikshaya Namatam Kamadhenave.',
    meaning: 'I bow to Sri Raghavendra Swamy, who is devoted to truth and righteousness, who is like a wish-fulfilling Kalpavriksha tree and Kamadhenu to all who surrender to him.',
    category: 'Guru Stotras'
  },
  {
    id: 3,
    title: 'Shanti Mantra',
    sanskrit: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
    english: 'Sarve Bhavantu Sukhinah Sarve Santu Niramayah. Sarve Bhadrani Pashyantu Ma Kashchid Duhkha Bhag Bhavet.',
    meaning: 'May all beings be happy. May all beings be free from disease. May all beings see auspiciousness. May no one suffer.',
    category: 'Peace Prayers'
  },
  {
    id: 4,
    title: 'Vishnu Sahasranama Opening',
    sanskrit: 'विश्वं विष्णुर्वषट्कारो भूतभव्यभवत्प्रभुः। भूतकृद् भूतभृद् भावा भूतात्मा भूतभावनः॥',
    english: 'Vishvam Vishnur Vashatkaro Bhuta-Bhavya-Bhavat-Prabhuh. Bhutakrud Bhutabhird Bhava Bhutatma Bhutabhavanah.',
    meaning: 'The Lord Vishnu is the universe, the sacrifice, the lord of past, present and future, the creator, sustainer and destroyer.',
    category: 'Divine Names'
  },
  {
    id: 5,
    title: 'Hanuman Chalisa Opening',
    sanskrit: 'श्रीगुरु चरण सरोज रज निजमन मुकुरु सुधारि। बरनऊँ रघुबर बिमल जसु जो दायकु फल चारि॥',
    english: 'Sri Guru Charan Saroj Raj Nij Man Mukur Sudhari. Barnau Raghubar Bimal Jasu Jo Dayaku Phal Chari.',
    meaning: 'I cleanse the mirror of my mind with the pollen of the lotus feet of Sri Guru. I describe the glory of Sri Raghuvir, which bestows the four fruits of life.',
    category: 'Devotional Hymns'
  },
  {
    id: 6,
    title: 'Lakshmi Ashtottara Opening',
    sanskrit: 'ॐ महालक्ष्म्यै नमः। ॐ श्रीमहालक्ष्म्यै नमः। ॐ पद्मालयै नमः। ॐ पद्महस्तायै नमः॥',
    english: 'Om Mahalakshmyai Namah. Om Shrimahalakshmyai Namah. Om Padmalayai Namah. Om Padmahastayai Namah.',
    meaning: 'Salutations to Mahalakshmi, Shrimahalakshmi, one who resides in lotus, one with lotus in hand.',
    category: 'Goddess Prayers'
  },
  {
    id: 7,
    title: 'Ganesh Gayatri',
    sanskrit: 'ॐ एकदंताय विद्महे वक्रतुण्डाय धीमहि तन्नो दन्तिः प्रचोदयात्॥',
    english: 'Om Ekadantaya Vidmahe Vakratundaya Dhimahi Tanno Dantih Prachodayat.',
    meaning: 'We meditate on the single-tusked one, with curved trunk. May that tusk inspire our intellect.',
    category: 'Ganesh Prayers'
  },
  {
    id: 8,
    title: 'Mahamrityunjaya Mantra',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
    english: 'Om Tryambakam Yajamahe Sugandhim Pushti Vardhanam. Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat.',
    meaning: 'We worship the three-eyed Lord who is fragrant and nourishes all beings. May he liberate us from mortality into immortality.',
    category: 'Healing Prayers'
  }
];

export default function SlokasPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Vedic Chanting
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Sacred Slokas & Mantras</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Discover the profound spiritual power of ancient Sanskrit slokas, Vedic hymns, and daily prayers
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-16 space-y-12">
        {/* Slokas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {slokas.map((sloka) => (
            <div 
              key={sloka.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col group hover:-translate-y-1"
            >
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex items-center justify-between">
                <h3 className="text-lg font-black">{sloka.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                  {sloka.category}
                </span>
              </div>
              
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-slate-800/80 border border-orange-100 dark:border-slate-700/60 text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1.5">
                    Sanskrit
                  </h4>
                  <p className="text-lg sm:text-xl font-serif font-bold text-gray-900 dark:text-amber-200 leading-relaxed">
                    {sloka.sanskrit}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                    Transliteration
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic font-mono leading-relaxed">
                    {sloka.english}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 mt-auto">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                    Meaning
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {sloka.meaning}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chanting Guidelines */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Daily Chanting Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Preparation</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 font-medium">
                <li>• Clean and quiet prayer corner</li>
                <li>• Pure thoughts and devotion</li>
                <li>• Best practiced at sunrise (Brahma Muhurta)</li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Practice</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 font-medium">
                <li>• Clear Sanskrit pronunciation</li>
                <li>• Contemplate on the inner meaning</li>
                <li>• Regular daily recitation</li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Benefits</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 font-medium">
                <li>• Mental serenity and peace</li>
                <li>• Enhanced memory and focus</li>
                <li>• Divine grace of Guru Raghavendra</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
