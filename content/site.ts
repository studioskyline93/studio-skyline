export type Testimonial = {
  quote: string;
  author: string;
  company?: string;
};

export const SITE = {
    name: "Studio Skyline Graphics Pvt. Ltd.",
    city: "New Delhi",
    tagline: "Premium packaging & print production.",
    intro:
      "We manufacture premium fancy boxes, paper bags, invitation cards, stationery, and high-quality book printing for brands that care about detail.",
    highlight:
      "From concept to manufacturing. Clean finishes, precise color, premium materials.",
    email: "studioskyline93@gmail.com.com",
    phone: "+91-9810264240",
    addressLine: "Okhla Industrial Area, New Delhi",
    socials: {
      instagram: "https://instagram.com/",
      youtube: "https://youtube.com/",
    },
  };
  
  export const CLIENTS = [
    "Needledust",
    "— Add client 1",
    "— Add client 2",
  ];
  
  // ===============================
// WORK COLLECTIONS (MP4 ONLY)
// ===============================

export type WorkVideo = {
  src: string;      // /work/<slug>/videos/xxx.mp4
  title?: string;
  note?: string;
};

export type WorkCollection = {
  slug: string;
  index: string;    // "01", "02" etc
  title: string;
  subtitle?: string;
  description?: string;
  videos: WorkVideo[];
};

export const WORK_COLLECTIONS: WorkCollection[] = [
  {
    slug: "premium-fancy-boxes",
    index: "01",
    title: "Premium Fancy Boxes",
    subtitle: "Rigid boxes • Luxury finishing",
    description:
      "Rigid boxes with premium wraps, foil stamping, embossing, and custom inserts.",
    videos: [
      {
        src: "/work/premium-fancy-boxes/videos/box-01.mp4",
        title: "Magnetic box reveal",
      },
      {
        src: "/work/premium-fancy-boxes/videos/box-02.mp4",
        title: "Foil and emboss detail",
      },
      {
        src: "/work/premium-fancy-boxes/videos/box-03.mp4",
        title: "Magnetic box reveal",
      },
      {
        src: "/work/premium-fancy-boxes/videos/box-04.mp4",
        title: "Foil and emboss detail",
      },
    ],
  },
  {
    slug: "paper-bags",
    index: "02",
    title: "Paper Bags",
    subtitle: "Luxury paper bags",
    description:
      "Premium paper bags with reinforced handles and clean finishing.",
    videos: [
      {
        src: "/work/paper-bags/videos/bag-01.mp4",
        title: "Handle and structure",
      },
      {
        src: "/work/paper-bags/videos/bag-02.mp4",
        title: "Handle and structure",
      },
      {
        src: "/work/paper-bags/videos/bag-03.mp4",
        title: "Handle and structure",
      },
    ],
  },
  {
    slug: "books-catalogues",
    index: "03",
    title: "Books & Catalogues",
    subtitle: "Print • Bind • Finish",
    description:
      "High-quality book printing, catalogues, and premium binding.",
    videos: [   
      {
        src: "/work/books-catalogues/videos/book-01.mp4",
      title: "Handle and structure",
    },
    {
      src: "/work/books-catalogues/videos/book-02.mp4",
      title: "Handle and structure",
    },
    {
      src: "/work/books-catalogues/videos/book-03.mp4",
      title: "Handle and structure",
    },
  ],
  },
  {
    slug: "packaging-acc",
    index: "04",
    title: "Packaging & Accessories",
    subtitle: "Alternate finishes",
    description:
      "Variant designs of premium fancy boxes with different materials and finishes.",
    videos: [
      {
        src: "/work/packaging-acc/videos/pack-01.mp4",
        title: "Handle and structure",
      },
      {
        src: "/work/packaging-acc/videos/pack-02.mp4",
        title: "Handle and structure",
      },
      {
        src: "/work/packaging-acc/videos/pack-03.mp4",
        title: "Handle and structure",
      },
    ],
  },
  {
    slug: "stationery",
    index: "05",
    title: "Stationery",
    subtitle: "Cards • Letterheads • Envelopes",
    description:
      "Premium stationery production with attention to material and detail.",
    videos: [
      {
        src: "/work/stationery/videos/stationery-01.mp4",
        title: "Handle and structure",
      },
      {
        src: "/work/stationery/videos/stationery-02.mp4",
        title: "Handle and structure",
      },
      {
        src: "/work/stationery/videos/stationery-03.mp4",
        title: "Handle and structure",
      },
    ],
  },
  
];


  
  export type VideoItem = {
    title: string;
    youtubeId: string;
    note?: string;
  };
  
  export const VIDEOS: VideoItem[] = [
    {
      title: "Studio Film",
      youtubeId: "sGJJgBfHy5E",
      note: "Manufacturing + finishing highlights",
    },
  ];
  
  // content/site.ts

  export const PAGES = {
    productionHouse: {
      slug: "production-house",
      menuLabel: "Production House",
      title: "Production House",
      subtitle: "Machines • Finishing • Packaging",
      hero: {
        media: [
          {
            type: "video",
            src: "/production-house/hero/videos/machine-01.mp4",
            alt: "Machine running",
          },
          {
            type: "photo",
            src: "/production-house/hero/photos/packaging-01.jpg",
            alt: "Packaging detail",
          },
          {
            type: "video",
            src: "/production-house/hero/videos/packaging-01.mp4",
            alt: "Packaging line",
          },
        ],
      },
    },
  } as const;
  
  export type HeroMediaItem =
    | { type: "video"; src: string; alt?: string }
    | { type: "photo"; src: string; alt?: string };
  
export const getProductionHouseMedia = () => PAGES.productionHouse.hero.media;

export const TESTIMONIALS = [
  {
    quote:
      "Studio Skyline consistently delivers premium quality. The finishing and attention to detail are exceptional.",
    author: "Brand Director",
    company: "Luxury Fashion Brand",
  },
  {
    quote:
      "From concept to manufacturing, the process is smooth and reliable. Highly recommended.",
    author: "Founder",
    company: "Packaging Studio",
  },
  {
    quote:
      "Clean production, precise color, and excellent communication throughout.",
    author: "Marketing Lead",
    company: "Consumer Goods Brand",
  },
];

