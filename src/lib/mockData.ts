export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  content: string;
}

export const NEWS_DATABASE: NewsItem[] = [
  {
    id: 1,
    slug: "distribution-vietnam",
    title: "Ameko Gaming Products are now distributed in Vietnam",
    date: "25 September, 2025",
    category: "Business",
    excerpt:
      "Ameko has entered a distribution agreement with GearVN, making their artisan keyboards and accessories available to resellers across Vietnam.",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554094/G8A-25100-2_image017-1_acu2rz.png",
    content: `
      <p class="lead">Ameko has entered a distribution agreement with GearVN, making their gaming peripherals available to resellers across Vietnam.</p>
      
      <h3>Expanding to Southeast Asia</h3>
      <p>Ameko has grown rapidly over the past years and is continuing to expand their distribution network in 2025. The Swedish gaming gear specialists have now entered Vietnam by partnering with GearVN, who will act as a master distributor.</p>
      
      <p>“Vietnam is a key market for us, with a passionate community of mechanical keyboard enthusiasts. GearVN is the perfect partner to help us bring our artisan products to this vibrant market,” says CEO of Ameko.</p>
    `,
  },

  {
    id: 2,
    slug: "m8-wireless-intro",
    title: "Ameko Introduces M8 Wireless Gaming Mouse",
    date: "29 July, 2025",
    category: "Product Launch",
    excerpt:
      "A new, uniquely designed mouse is coming this November. Meet the new M8 from Ameko, featuring an ultra-low front design.",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    content: `
      <p class="lead">A new, uniquely designed mouse is coming this November. Meet the new M8 from Ameko.</p>
      
      <h3>Unique Low-Front Design</h3>
      <p>The M8 Wireless is not your standard symmetrical mouse. It features a button height of only 4mm at the front, allowing you to move your fingers closer to the pad for more precision and control.</p>
      
      <h3>Hardware Specs</h3>
      <ul>
        <li><strong>Sensor:</strong> Pixart 3395</li>
        <li><strong>Weight:</strong> 55 grams</li>
        <li><strong>Battery:</strong> Up to 75 hours</li>
      </ul>
    `,
  },

  {
    id: 3,
    slug: "heroic-partnership",
    title: "Ameko Partners with Heroic Esports",
    date: "16 August, 2025",
    category: "Esports",
    excerpt:
      "Swedish gaming gear specialists Ameko team up with one of the most prominent esports organizations in the Nordics, Heroic.",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554094/20250729_Cherry_MX8.3_16x9-scaled_g3xnph.jpg",
    content: `
      <p class="lead">Swedish gaming gear specialists Ameko team up with one of the most prominent esports organizations in the Nordics, Heroic.</p>
      <p>As top contenders globally with the number one CS:GO team in Denmark, Norwegian esports organization Heroic has rapidly grown to become a household name. Today, Heroic announced a partnership with Ameko.</p>
    `,
  },

  {
    id: 4,
    slug: "jlingz-partnership",
    title: "Jesse Lingard and JLINGZ Esports partner with Ameko",
    date: "12 May, 2025",
    category: "Partnership",
    excerpt:
      "Manchester United's Jesse Lingard and his esports organization JLINGZ have entered a partnership with gaming gear specialists Ameko.",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    content: `
      <p class="lead">Manchester United's Jesse Lingard and his esports organization JLINGZ have entered a partnership with gaming gear specialists Ameko.</p>
      <p>Professional footballer Jesse Lingard entered the competitive gaming scene in 2021, launching his own esports organization JLINGZ. Since then, the organization has grown to house teams and players in Rainbow 6, FIFA and Halo.</p>
    `,
  },

  {
    id: 5,
    slug: "big-announcement",
    title: "Ameko's Big Announcement: Custom Artisan Keycaps",
    date: "04 April, 2025",
    category: "Community",
    excerpt:
      "Multiple new products are introduced as Ameko reveals the upcoming additions to their range of esports equipment.",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
    content: `
      <p class="lead">Multiple new products are introduced as Ameko reveals the upcoming additions to their range of esports equipment.</p>
      <h3>Community Collaboration</h3>
      <p>We are now announcing the launch of a number of highly anticipated artisan keycaps designed by the community's top creators. This marks the beginning of our open platform initiative.</p>
    `,
  },
];
