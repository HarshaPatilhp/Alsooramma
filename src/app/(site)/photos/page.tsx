'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  History, 
  Sparkles, 
  Building2, 
  Calendar, 
  Layers, 
  HeartHandshake 
} from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'old-pics' | 'mathaji' | 'prathistapana' | 'alankara' | 'aradhana' | 'temple';
  src: string;
  caption: string;
  year?: string;
}

export const allGalleryPhotos: GalleryPhoto[] = [
  // ===================== 1. RARE HISTORICAL ARCHIVES (Old Pics) =====================
  {
    id: 'old-1',
    title: 'Aradhana Prasada Seva (1976)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Aradhana%20Prasada_1976.png',
    caption: 'Devotees participating in the sacred Aradhana Prasada distribution in 1976.',
    year: '1976'
  },
  {
    id: 'old-2',
    title: 'Aradhana Celebrations in 1970s',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Aradhana%20in%2070s.png',
    caption: 'Historic gathering of devotees celebrating Sri Raghavendra Swamy Aradhana during the 1970s.',
    year: '1970s'
  },
  {
    id: 'old-3',
    title: 'Aradhana Ratha Seva with Sri Thambehalli Swamigalu',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Aradhana_Ratha_Sri%20Thambehalli%20Swamigalu.png',
    caption: 'Sacred Aradhana Ratha Utsava graced by the divine presence of Sri Thambehalli Swamigalu.',
    year: '1970s'
  },
  {
    id: 'old-4',
    title: 'Arrival of Sri Satyapramoda Theertharu (1977)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Arrival%20of%20Satyapramoda%20Theertharu_1977.png',
    caption: 'Historic arrival and welcome of H.H. Sri Satyapramoda Theertha Swamiji of Uttaradi Mutt in 1977.',
    year: '1977'
  },
  {
    id: 'old-5',
    title: 'Historic Seva Devotees (1970)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Flower%20Merchant%201970.png',
    caption: 'Early dedicated devotees and flower merchant offerings for the mutt pooja in 1970.',
    year: '1970'
  },
  {
    id: 'old-6',
    title: 'Padapuja to Udupi Swamigalus (1978)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Padapuja%20to%20Udupi%20Swamigalus_1978.png',
    caption: 'Sacred Padapooja offered to the revered Swamijis of Udupi Ashta Mutts in 1978.',
    year: '1978'
  },
  {
    id: 'old-7',
    title: 'Padapuje of Mulubagilu Mutt Swamigalu',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Padapuje%20Mulubagilu%20Mutt%20Swamigalu.png',
    caption: 'Padapuje ceremony in reverence to the revered Pontiff of Sripadaraja Mutt (Mulubagilu).',
    year: '1970s'
  },
  {
    id: 'old-8',
    title: 'Padapuje to Sri Satyapramoda Theertharu (1977)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Padapuje%20to%20Satyapramoda%20Theertharu_1977.png',
    caption: 'Mathaji Ulsooramma and devotees performing Padapuje to H.H. Sri Satyapramoda Theertha Swamiji in 1977.',
    year: '1977'
  },
  {
    id: 'old-9',
    title: 'Samasthana Puje of Sri SatyaMadhava Theertharu (1979)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Samasthana%20Puje%20of%20Sri%20SatyaMadhava%20Theertharu_1979.png',
    caption: 'Samasthana Pooja rituals performed by H.H. Sri Satyamadhava Theertharu in 1979.',
    year: '1979'
  },
  {
    id: 'old-10',
    title: 'Sri Vishweshwara Theertharu during Aradhana (1980)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Sri%20Vishweshwara%20Theertharu_In%20Aradhana_1980.png',
    caption: 'H.H. Sri Vishwesha Theertha Swamiji (Pejavara Mutt) gracing the Aradhana Mahotsava in 1980.',
    year: '1980'
  },
  {
    id: 'old-11',
    title: 'Theertha Prasada by Sri SatyaMadhava Theertharu (1979)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/Theertha%20Given%20by%20Sri%20SatyaMadhava%20Theertharu_1979.png',
    caption: 'Devotees receiving sacred Theertha from H.H. Sri Satyamadhava Theertharu in 1979.',
    year: '1979'
  },
  {
    id: 'old-12',
    title: 'With Mulubagilu Mutt Swamigalu',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/With%20Mulubagilu%20Mutt%20Swamigalu.png',
    caption: 'Divine assembly with the revered Pontiff of Mulubagilu Mutt.',
    year: '1970s'
  },
  {
    id: 'old-13',
    title: 'Blessings with Swamigalu (1977)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/With%20Swamigalu_1977.png',
    caption: 'Historical blessing moment of Mathaji Ulsooramma with revered Swamijis in 1977.',
    year: '1977'
  },
  {
    id: 'old-14',
    title: 'Revered Gathering with Swamijis (1977)',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/With%20Swamigalus_1977.png',
    caption: 'Holy gathering of revered Swamijis and trustees in 1977.',
    year: '1977'
  },
  {
    id: 'old-15',
    title: 'With Sri Vishwesha Theertharu and Sri Vidyabhushana',
    category: 'old-pics',
    src: '/images/gallary/Old%20Pics/With%20Vishewesha%20Theertharu%20and%20Sri%20Vidyabhushan.png',
    caption: 'Mathaji Ulsooramma with Pejavara Sri Vishwesha Theertha Swamiji and eminent singer Sri Vidyabhushana.',
    year: 'Historic'
  },

  // ===================== 2. MATHAJI ULSOORAMMA SACRED MOMENTS =====================
  {
    id: 'mat-1',
    title: 'Mathaji at Mantralaya Moola Brindavana (Feb 2006)',
    category: 'mathaji',
    src: '/images/gallary/photos/Matahaji%20UlsoorAmma%20at%20Mantralaya%20Moola%20Brindavana%20in%20Feb2006.jpg',
    caption: 'Mathaji Ulsooramma offering deep prayers at the sacred Moola Brindavana in Mantralaya, Feb 2006.',
    year: '2006'
  },
  {
    id: 'mat-2',
    title: 'Receiving Sujayasree Award from Mantralaya (2006)',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20UlsoorAmma%20Receiving%20Sujayasree%20Awards%20from%20Mantralaya%20in%20Feb%202006.JPG',
    caption: 'Mathaji Ulsooramma receiving the prestigious Sujayasree Award from Sri Raghavendra Swamy Mutt Mantralaya.',
    year: '2006'
  },
  {
    id: 'mat-3',
    title: 'Mathaji with Sri Subhudhendra Theertharu (Poorvashrama)',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20With%20Poorvashrama%20of%20Sri%20Subhudeendra%20Theertharu%20in%20Feb%202006.jpg',
    caption: 'Mathaji Ulsooramma with the Poorvashrama of current Mantralaya Peetadhipathi H.H. Sri Subhudhendra Theertha Swamiji in Feb 2006.',
    year: '2006'
  },
  {
    id: 'mat-4',
    title: 'Mathaji with Ammaluamma in Kumbhakonam',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20with%20Ammaluamma%20in%20Kumbhakonam.jpg',
    caption: 'Mathaji Ulsooramma during her holy pilgrimage with Ammaluamma in Kumbhakonam.',
    year: 'Pilgrimage'
  },
  {
    id: 'mat-5',
    title: 'Mathaji Offering Prayers at Sanctum',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20Offering%20Her%20Prayers.JPG',
    caption: 'Devotional offering of prayers by Mathaji Ulsooramma inside the Sanctum Sanctorum.',
    year: '2012'
  },
  {
    id: 'mat-6',
    title: 'Mathaji Performing Go Pooja during Aradhana (2012)',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20Performing%20Goh%20Puje%20During%20Rayaru%20Aaradhana%20in%202012.JPG',
    caption: 'Mathaji performing the sacred Go Pooja ceremony during Rayaru Aradhana in 2012.',
    year: '2012'
  },
  {
    id: 'mat-7',
    title: 'Mathaji Sharing the History of the Mutt',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20Talking%20About%20Mutt_s%20Background.JPG',
    caption: 'Mathaji narrating the divine inspiration and history behind founding the Mutt in Vidyaranyapura.',
    year: '2012'
  },
  {
    id: 'mat-8',
    title: 'Inspecting Rayaru Brindavana at Bidadi (Aug 2012)',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20UlsoorAmma%20Inspecting%20Rayaru%20Brindavana%20in%20Bidadi_06Aug2012.JPG',
    caption: 'Mathaji personally inspecting the sculpted Rayaru Brindavana in Bidadi on 06 August 2012 before sthapana.',
    year: '2012'
  },
  {
    id: 'mat-9',
    title: 'Mathaji in Garbhagudi Prior to Prathistapane',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20UlsoorAmma%20in%20Gharbhagudi%20Prior%20to%20Prathistapane.JPG',
    caption: 'Mathaji inside the new Garbhagudi preparing the sacred sanctum prior to Prathistapana.',
    year: '2012'
  },
  {
    id: 'mat-10',
    title: 'Mathaji on Chala Prathistapana Day (15 Aug 2012)',
    category: 'mathaji',
    src: '/images/gallary/photos/Mathaji%20UlsoorAmma%20on%2015Aug2012.JPG',
    caption: 'Mathaji Ulsooramma blessing devotees during the auspicious Prathistapana on 15 August 2012.',
    year: '2012'
  },

  // ===================== 3. BRINDAVANA PRATHISTAPANA & CONSTRUCTION (2012) =====================
  {
    id: 'pra-1',
    title: 'Announcement of Chala Brindavana Prathistapana',
    category: 'prathistapana',
    src: '/images/gallary/photos/Announcement%20of%20Chala%20Brindavana%20Prathistapana.JPG',
    caption: 'Auspicious public announcement and invitations for Chala Brindavana Prathistapana in 2012.',
    year: '2012'
  },
  {
    id: 'pra-2',
    title: 'Garbhagudi Construction in Vidyaranyapura (10 Aug 2012)',
    category: 'prathistapana',
    src: '/images/gallary/photos/Construction%20of%20Garbhagudi%20at%20Vidyaranyapura%20Mutt%20Area_10%20Aug%202012.JPG',
    caption: 'Early foundation and civil construction work of Garbhagudi in Vidyaranyapura.',
    year: '2012'
  },
  {
    id: 'pra-3',
    title: 'Garbhagudi Structure Development (12 Aug 2012)',
    category: 'prathistapana',
    src: '/images/gallary/photos/Construction%20of%20Garbhagudi%20at%20Vidyaranyapura%20Mutt%20Area_12%20Aug%202012.JPG',
    caption: 'Construction team completing the inner temple sanctuary in August 2012.',
    year: '2012'
  },
  {
    id: 'pra-4',
    title: 'Preparing Peeta for Rayaru Brindavana Sthapane',
    category: 'prathistapana',
    src: '/images/gallary/photos/Preparing%20Peeta%20for%20Rayaru%20Brindavana%20Sthapane%20on%2013th%20Aug%202012.JPG',
    caption: 'Vedic Acharyas preparing the sacred Peeta on 13 August 2012 for the Brindavana installation.',
    year: '2012'
  },
  {
    id: 'pra-5',
    title: 'Rayaru Brindavana Before Prathistapane Ceremonies',
    category: 'prathistapana',
    src: '/images/gallary/photos/Vidyaranyapura%20Rayaru%20Brindavana_Before%20Prathistapane%20Ceremonies.JPG',
    caption: 'The sacred stone Brindavana sanctified before the formal Prathistapana homams.',
    year: '2012'
  },
  {
    id: 'pra-6',
    title: 'Homam on Chala Brindavana Prathistapana (15 Aug 2012)',
    category: 'prathistapana',
    src: '/images/gallary/photos/Homam%20on%20Chala%20Brindavana%20Prathistapane%20on%2015th%20Aug%202012.JPG',
    caption: 'Grand Vedic Homas and Yagnas performed on the auspicious installation day, 15 August 2012.',
    year: '2012'
  },
  {
    id: 'pra-7',
    title: 'Chala Brindavana Prathistapana Ceremony (15 Aug 2012)',
    category: 'prathistapana',
    src: '/images/gallary/photos/Chala%20Brindavana%20Prathistapana%20Cermony_15Aug2012.JPG',
    caption: 'Sacred Prathistapana rituals led by Vedic scholars and witnessed by hundreds of devotees.',
    year: '2012'
  },
  {
    id: 'pra-8',
    title: 'First Maha Abhisheka on 15 Aug 2012',
    category: 'prathistapana',
    src: '/images/gallary/photos/First%20Abhisheka%20on%2015Aug%202012.JPG',
    caption: 'The very first sacred Abhisheka performed upon Sri Rayaru Brindavana on 15 August 2012.',
    year: '2012'
  },
  {
    id: 'pra-9',
    title: 'First Alankara After Chala Prathishtapane',
    category: 'prathistapana',
    src: '/images/gallary/photos/First%20Alankara%20After%20Chala%20Prathishtapane%20on%2015Aug2012.JPG',
    caption: 'Divine first floral and tulasi alankara performed following the sthapana ceremony.',
    year: '2012'
  },
  {
    id: 'pra-10',
    title: 'First Padapuje of Sri Prahlada Rajaru',
    category: 'prathistapana',
    src: '/images/gallary/photos/First%20Padapuje%20of%20Sri%20Prahlada%20Rajaru.JPG',
    caption: 'The initial sacred Padapooja performed for the Utsava Murti of Sri Prahlada Rajaru.',
    year: '2012'
  },
  {
    id: 'pra-11',
    title: 'Devotees Taking Darshan on Prathistapana Day',
    category: 'prathistapana',
    src: '/images/gallary/photos/Devotees%20Taking%20Darshan%20on%2015Aug2012.JPG',
    caption: 'Large gathering of devotees taking early morning darshan on 15 August 2012.',
    year: '2012'
  },
  {
    id: 'pra-12',
    title: 'Maha Prasadam Distribution on 15 Aug 2012',
    category: 'prathistapana',
    src: '/images/gallary/photos/Devotees%20Partaking%20Prasadam%20on%2015Aug2012.JPG',
    caption: 'Grand Annadanam seva organized for thousands of devotees on Prathistapana day.',
    year: '2012'
  },
  {
    id: 'pra-13',
    title: 'Moving Brindavana to Newly Constructed Garbhagudi',
    category: 'prathistapana',
    src: '/images/gallary/photos/Brindavana%20Being%20Moved%20to%20Newly%20Constructed%20Gharbhagudi.JPG',
    caption: 'Sacred procession moving the Brindavana into the sanctified Garbhagudi structure.',
    year: '2012'
  },
  {
    id: 'pra-14',
    title: 'Finalising Brindavana in Current Location',
    category: 'prathistapana',
    src: '/images/gallary/photos/Brindavana%20Being%20Finalised%20in%20Current%20Location.JPG',
    caption: 'Alignment and architectural finalisation of Sri Raghavendra Swamy Brindavana at its current location.',
    year: '2012'
  },

  // ===================== 4. DIVINE ALANKARAS & UTSAVAMS =====================
  {
    id: 'ala-1',
    title: 'Alankara during Rayaru Aradhana in 2012',
    category: 'alankara',
    src: '/images/gallary/photos/Alankara%20During%20Rayaru%20Aaradhana%20in%202012.JPG',
    caption: 'Magnificent golden & floral alankara adorned for Rayaru Aradhana Mahotsava in 2012.',
    year: '2012'
  },
  {
    id: 'ala-2',
    title: 'Special Alankara on 26 Dec 2012',
    category: 'alankara',
    src: '/images/gallary/photos/Alankara%20on%2026Dec2012.jpg',
    caption: 'Intricate garland and tulasi vana alankara performed on 26 December 2012.',
    year: '2012'
  },
  {
    id: 'ala-3',
    title: 'Special Alankara on 06 Jan 2013',
    category: 'alankara',
    src: '/images/gallary/photos/Alanakara%20on%2006Jan2013.JPG',
    caption: 'Divine alankara and deepa seva on 06 January 2013.',
    year: '2013'
  },
  {
    id: 'ala-4',
    title: 'Alankara on 23 Oct 2012',
    category: 'alankara',
    src: '/images/gallary/photos/Alanakara%20on%2023Oct2012.JPG',
    caption: 'Dazzling festive alankara with sacred silver kireeta and padukas.',
    year: '2012'
  },
  {
    id: 'ala-5',
    title: 'Pallaki Utsava on 06 Jan 2013',
    category: 'alankara',
    src: '/images/gallary/photos/Pallaki%20Utsava%20on%20%206Jan2013.jpg',
    caption: 'Grand Pallaki Utsavam of Sri Prahlada Rajaru around the Mutt premises.',
    year: '2013'
  },
  {
    id: 'ala-6',
    title: 'Vishesha Pallaki Utsava during Aradhana 2012',
    category: 'alankara',
    src: '/images/gallary/photos/Vishesha%20Pallaki%20Utsava%20During%20Aradhana%20in%202012.JPG',
    caption: 'Decorated floral Pallaki procession accompanied by bhajans and veda gosham during Aradhana 2012.',
    year: '2012'
  },
  {
    id: 'ala-7',
    title: 'Maha Mangalarathi on 28 Dec 2012',
    category: 'alankara',
    src: '/images/gallary/photos/Mangalaarthi%20on%2028Dec2012.jpg',
    caption: 'Devotees witnessing the divine evening Maha Mangalarathi on 28 December 2012.',
    year: '2012'
  },
  {
    id: 'ala-8',
    title: 'Prathime of Sri Guru Rayaru',
    category: 'alankara',
    src: '/images/gallary/photos/Prathime%20of%20Sri%20Guru%20Rayaru.JPG',
    caption: 'Sacred Prathime idol of Sri Raghavendra Teertharu installed with holy rituals.',
    year: '2012'
  },
  {
    id: 'ala-9',
    title: 'Sri Prahlada Rajaru Utsava Murti',
    category: 'alankara',
    src: '/images/gallary/photos/Sri%20Prahlada%20Rajaru.JPG',
    caption: 'Close-up darshan of the consecrated Sri Prahlada Rajaru deity.',
    year: '2012'
  },
  {
    id: 'ala-10',
    title: 'Traditional Deities of Sri Rama, Seetha Devi and Prana Devaru',
    category: 'alankara',
    src: '/images/gallary/photos/Traditional%20Home%20Dieties%20of%20Srirama,%20Seetha%20Devi%20and%20Prana%20Devaru.JPG',
    caption: 'Revered ancestral deities of Sri Rama, Seetha Devi, and Sri Mukhyaprana Devaru at the Mutt.',
    year: 'Heritage'
  },

  // ===================== 5. ARADHANA & COMMUNITY SEVAS =====================
  {
    id: 'ara-1',
    title: 'Alankaras during Rayaru Aradhana in 2010',
    category: 'aradhana',
    src: '/images/gallary/photos/Alankaras%20During%20Rayaru%20Aaradhana%20in%202010.JPG',
    caption: 'Special flower decoration and lighting during the 2010 Aradhana celebrations.',
    year: '2010'
  },
  {
    id: 'ara-2',
    title: 'Cultural Program during Rayaru Aradhana 2010',
    category: 'aradhana',
    src: '/images/gallary/photos/Cutural%20Program%20During%20Rayaru%20Aradhana%20in%202010.JPG',
    caption: 'Classical music and Haridasa devotional sangeetha program organized for Aradhana.',
    year: '2010'
  },
  {
    id: 'ara-3',
    title: 'Sri Jagannatha Dasara Tamburi Brought to 2012 Aradhana',
    category: 'aradhana',
    src: '/images/gallary/photos/Sri%20Satyanarayana%20Achar%20Brininging%20Sri%20Jagganatha%20Dasara%20Thumburi%20to%202012%20Aradhana.JPG',
    caption: 'Sri Satyanarayana Achar carrying the sacred historic Tamburi of Sri Jagannatha Dasaru to the 2012 Aradhana.',
    year: '2012'
  },
  {
    id: 'ara-4',
    title: 'Brahmanara Pankthi Items during 2010 Aradhana',
    category: 'aradhana',
    src: '/images/gallary/photos/Items%20for%20Alankara%20Brahmanara%20Pankthi%20in%202010%20Rayaru%20Aradhana.JPG',
    caption: 'Special ceremonial arrangements for the sacred Brahmanara Pankthi during 2010 Aradhana.',
    year: '2010'
  },
  {
    id: 'ara-5',
    title: 'Volunteer Sri Rama Rao Preparing Prasadam (Jan 2013)',
    category: 'aradhana',
    src: '/images/gallary/photos/Sri%20Rama%20Rao%20-%20Volunteer%20Devotee%20Preparing%20Prasadam%20in%20Jan%202013.JPG',
    caption: 'Dedicated Swayamsevak Sri Rama Rao preparing holy Annadanam prasadam in the Mutt kitchen.',
    year: '2013'
  },
  {
    id: 'ara-6',
    title: 'Maha Theertha Prasada Seva in Jan 2013',
    category: 'aradhana',
    src: '/images/gallary/photos/Theertha%20Prasada%20in%20Jan%202013.JPG',
    caption: 'Devotees relishing the consecrated Tirtha Prasada meal in the temple dining hall.',
    year: '2013'
  },
  {
    id: 'ara-7',
    title: 'Early Days Bhajana Mandali',
    category: 'aradhana',
    src: '/images/gallary/photos/Early%20Days%20Bhajana%20Mandali.JPG',
    caption: 'Dedicated singers of Vidyaranyapura Bhajana Mandali performing Dasara Padagalu.',
    year: '2012'
  },
  {
    id: 'ara-8',
    title: 'Early Sacred Well for Poojas',
    category: 'aradhana',
    src: '/images/gallary/photos/Early%20Days%20Well%20For%20Pujas.JPG',
    caption: 'The sacred pure water well utilized for daily Nirmalya and Abhisheka pooja rites.',
    year: '2012'
  },
  {
    id: 'ara-9',
    title: 'Sri Raghavendra Swamy Brindavana (Jan 2013)',
    category: 'aradhana',
    src: '/images/gallary/photos/Vidyaranyapura%20Sri%20Raghavendra%20Swamy%20Brindavana_Jan%202013.JPG',
    caption: 'The divine Brindavana radiating with spirituality in January 2013.',
    year: '2013'
  }
];

const categoryTabs = [
  { id: 'all', label: 'All Photos', icon: Layers },
  { id: 'old-pics', label: 'Rare Old Pics (1970-80s)', icon: History },
  { id: 'mathaji', label: 'Mathaji Ulsooramma', icon: HeartHandshake },
  { id: 'prathistapana', label: 'Prathistapane & Construction', icon: Building2 },
  { id: 'alankara', label: 'Alankaras & Utsavams', icon: Sparkles },
  { id: 'aradhana', label: 'Aradhana & Sevas', icon: Calendar },
];

export default function Photos() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const filteredPhotos = useMemo(() => {
    return allGalleryPhotos.filter(photo => {
      const matchesCat = selectedCategory === 'all' || photo.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        photo.title.toLowerCase().includes(q) ||
        photo.caption.toLowerCase().includes(q) ||
        (photo.year && photo.year.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % filteredPhotos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-orange-100 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Mutt Photo Archives
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Photo Gallery & Historical Archives</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Explore the divine journey, rare 1970s archival photographs, Mathaji Ulsooramma's sacred moments, and Prathistapana celebrations.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8">
        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categoryTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              const count = tab.id === 'all' 
                ? allGalleryPhotos.length 
                : allGalleryPhotos.filter(p => p.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setActivePhotoIndex(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20 scale-105'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search photo archives..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-slate-800">
            <p className="text-gray-500 dark:text-gray-400 text-base font-semibold">No photos match the selected criteria.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => setActivePhotoIndex(idx)}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col group cursor-pointer hover:-translate-y-1.5"
              >
                {/* Photo Thumbnail Container */}
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-100 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.photo-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }
                    }}
                  />

                  <div className="photo-fallback hidden flex-col items-center justify-center p-4 text-center">
                    <Sparkles className="w-8 h-8 text-amber-500 mb-1" />
                    <span className="text-xs text-gray-500 font-semibold">{photo.title}</span>
                  </div>

                  {/* Year or Category Badge */}
                  {photo.year && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md border border-amber-400/30">
                      {photo.year}
                    </div>
                  )}

                  {/* Hover Overlay Zoom Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
                      <Maximize2 size={18} />
                    </div>
                  </div>
                </div>

                {/* Caption Card */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed mt-auto">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-2.5 rounded-full z-20 cursor-pointer transition-all"
          >
            <X size={20} />
          </button>

          {/* Previous Button */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full z-20 cursor-pointer transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next Button */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full z-20 cursor-pointer transition-all"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Modal Content */}
          <div 
            className="max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px] sm:min-h-[500px] max-h-[70vh] overflow-hidden">
              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                className="max-w-full max-h-[70vh] object-contain select-none"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {activePhoto.year && (
                    <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {activePhoto.year}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    {activePhoto.category.replace('-', ' ')}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">{activePhoto.title}</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">{activePhoto.caption}</p>
              </div>

              <div className="text-xs font-mono text-slate-400 self-end sm:self-center">
                {activePhotoIndex !== null ? activePhotoIndex + 1 : 0} / {filteredPhotos.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
