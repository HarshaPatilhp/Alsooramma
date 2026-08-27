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
    title: 'Om',
    sanskrit: 'ॐ',
    english: 'Om',
    meaning: 'The primordial sound, the essence of ultimate reality, encompassing all existence.',
    category: 'Sacred Sounds'
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
    title: 'Shiva Panchakshari',
    sanskrit: 'नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय। नित्याय शुद्धाय दिगम्बराय तस्मै ऽनकाराय नमः शिवाय॥',
    english: 'Nagendra Haraya Trilochanaaya Bhasmangaragaya Maheshvaraaya. Nityaaya Shuddhaaya Digambaraaya Tasmai "Na" Karaaya Namah Shivaaya.',
    meaning: 'Salutations to Shiva who wears serpent as garland, three-eyed one, smeared with ash, the great lord, eternal, pure, sky-clad, the letter "Na".',
    category: 'Shivite Prayers'
  },
  {
    id: 8,
    title: 'Durga Kavacha Opening',
    sanskrit: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे॥',
    english: 'Om Aim Hreem Kleem Chamundayai Vichche.',
    meaning: 'The armor of Goddess Durga protects from all directions and evils.',
    category: 'Protective Prayers'
  },
  {
    id: 9,
    title: 'Ram Raksha Stotra Opening',
    sanskrit: 'श्रीराम रक्षा स्तोत्रम्। चारु माला कदम्बमुकुटम् मणिभूषित किंकिणीकम्। शोभितं दंद शुक तिलकं रघुनंदनम्॥',
    english: 'Sri Ram Raksha Stotram. Charu Mala Kadamba Mukutam Manibhushita Kinkineekam. Shobhitam Danda Shuk Tilakam Raghu Nandanam.',
    meaning: 'Sri Rama Raksha Stotra. Adorned with beautiful garland and Kadamba flower crown, decorated with jewels and tinkling bells, adorned with danda and parrot tilaka, the delight of Raghu.',
    category: 'Protective Prayers'
  },
  {
    id: 10,
    title: 'Ganesh Gayatri',
    sanskrit: 'ॐ एकदंताय विद्महे वक्रतुण्डाय धीमहि तन्नो दन्तिः प्रचोदयात्॥',
    english: 'Om Ekadantaya Vidmahe Vakratundaya Dhimahi Tanno Dantih Prachodayat.',
    meaning: 'We meditate on the single-tusked one, with curved trunk. May that tusk inspire our intellect.',
    category: 'Ganesh Prayers'
  },
  {
    id: 11,
    title: 'Saraswati Gayatri',
    sanskrit: 'ॐ महासरस्वत्यै विद्महे ब्रह्मपुत्र्यै धीमहि तन्नो देवी प्रचोदयात्॥',
    english: 'Om Mahasaraswatyai Vidmahe Brahmaputryai Dhimahi Tanno Devi Prachodayat.',
    meaning: 'We meditate on the great Saraswati, daughter of Brahma. May that goddess inspire our intellect.',
    category: 'Goddess Prayers'
  },
  {
    id: 12,
    title: 'Aditya Hridayam Opening',
    sanskrit: 'आदित्य हृदयं पुण्यं सर्व शत्रु विनाशनम्। जयावहं जपेन्नित्यं अक्षयं परमं शिवम्॥',
    english: 'Aditya Hridayam Punyam Sarva Shatru Vinashanam. Jayavaham Japennityam Akshayam Paramam Shivam.',
    meaning: 'The sacred Aditya Hridayam destroys all enemies. Chanting it daily brings victory and eternal bliss.',
    category: 'Solar Prayers'
  },
  {
    id: 13,
    title: 'Purusha Suktam Opening',
    sanskrit: 'सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात्। स भूमिं विश्वतो वृत्वा अत्यतिष्ठद्दशाङ्गुलम्॥',
    english: 'Sahasra Shirsha Purushah Sahasrakshah Sahasrapat. Sa Bhumim Vishvato Vritva Atyatishthad Dashangulam.',
    meaning: 'The Purusha has thousand heads, thousand eyes, thousand feet. He pervades the earth in all directions and extends ten fingers beyond.',
    category: 'Vedic Hymns'
  },
  {
    id: 14,
    title: 'Rudram Opening',
    sanskrit: 'नमस्ते रुद्रमन्यव उतोत इष्वे नमः। नमस्ते अस्तु धन्वने बाहुभ्यामुत ते नमः॥',
    english: 'Namaste Rudramanyava Utota Ishave Namah. Namaste Astu Dhanvane Bahubhyamuta Te Namah.',
    meaning: 'Salutations to the fierce Rudra and to his arrow. Salutations to his bow and to both his arms.',
    category: 'Rudra Prayers'
  },
  {
    id: 15,
    title: 'Mahamrityunjaya Mantra',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
    english: 'Om Tryambakam Yajamahe Sugandhim Pushti Vardhanam. Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat.',
    meaning: 'We worship the three-eyed one (Shiva) who is fragrant and nourishes all beings. May he liberate us from death as a cucumber is liberated from its stalk.',
    category: 'Healing Prayers'
  }
];

export default function SlokasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Slokas</h1>
          <p className="text-xl md:text-2xl mb-8">
            Sacred Verses & Divine Prayers
          </p>
          <p className="text-lg text-orange-100 max-w-3xl mx-auto">
            Discover the profound wisdom and spiritual power of ancient Sanskrit slokas,
            mantras, and devotional hymns that connect us to the divine.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Divine Wisdom</h2>
            <p className="text-lg text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
              Slokas are sacred verses that contain profound spiritual wisdom, mantras for protection,
              and hymns of devotion. Regular chanting of these verses brings peace, prosperity, and
              spiritual enlightenment to our lives.
            </p>
          </div>

          {/* Sloka Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {Array.from(new Set(slokas.map(sloka => sloka.category))).map((category, index) => (
              <div key={index} className="bg-orange-50 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-orange-800 text-sm">{category}</h3>
              </div>
            ))}
          </div>

          {/* Slokas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {slokas.map((sloka) => (
              <div key={sloka.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                  <h3 className="text-xl font-bold text-white mb-1">{sloka.title}</h3>
                  <p className="text-orange-100 text-sm">{sloka.category}</p>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">SANSKRIT</h4>
                    <p className="text-lg text-gray-800 font-medium leading-relaxed text-center">
                      {sloka.sanskrit}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">TRANSLITERATION</h4>
                    <p className="text-gray-700 italic text-center">
                      {sloka.english}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">MEANING</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {sloka.meaning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chanting Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Preparation</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Clean and sacred environment</li>
                  <li>• Pure thoughts and intentions</li>
                  <li>• Early morning or evening time</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Practice</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Clear pronunciation</li>
                  <li>• Focus on meaning</li>
                  <li>• Regular daily practice</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Benefits</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Mental peace and clarity</li>
                  <li>• Spiritual growth</li>
                  <li>• Divine blessings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
