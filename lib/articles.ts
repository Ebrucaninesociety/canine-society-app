// Static editorial content for Slice 1's Edition tab. Slice 3 replaces
// this with a CMS fetch from the magazine site.

export type Article = {
  slug: string;
  category: string;
  title: string;
  dek: string; // editorial standfirst
  body: string;
  city?: string;
};

export const ARTICLES: Article[] = [
  {
    slug: 'roman-atelier',
    category: 'Society',
    title: 'A Roman atelier, opening at noon',
    dek: 'Linen on the table, a small Spinone at the door, the print-run still warm.',
    city: 'Roma',
    body: `The Society does not announce itself. It opens at noon, the linen is on the table, and the small Spinone at the door is the only doorman the room needs.

We meet our printer on Via Condotti. He keeps a paper sample under glass, the way another house would keep a watch. The Sand stock is heavier than last issue, the navy ink more honest, the typeface unchanged.

Issue I is the first. The second is already in our hands.`,
  },
  {
    slug: 'hamburg-walks',
    category: 'Lifestyle',
    title: 'The morning walks of Hamburg',
    dek: 'A long line from the Alster to the Speicherstadt, with a Whippet ahead of the rest.',
    city: 'Hamburg',
    body: `The Alster at six is its own member. The light is German, the pace Italian, and the small group of dogs that move together know one another better than their owners do.

It is a private hour. Coffee from the kiosk at the corner of An der Alster. Croissants from a shop you do not yet know. The Whippet is always ahead.

We will not name the kiosk. The members already know it.`,
  },
  {
    slug: 'the-portrait',
    category: 'Fashion',
    title: 'The portrait, considered',
    dek: 'How we photograph dogs: on cream, with a collar, like an editor.',
    body: `We treat the photograph as a portrait. Cream studio paper. A single collar. No filters, no props beyond what the dog wears every day. A breath of light from the window, not from a flash.

The dog does not perform. The dog sits, the way an editor sits.

This is the discipline of the magazine, brought to the camera.`,
  },
  {
    slug: 'health-and-care',
    category: 'Health & Care',
    title: 'Two coats, considered',
    dek: 'Notes on grooming heritage and short-haired breeds across the seasons.',
    body: `A dog's coat is a calendar. In Munich a Vizsla feels the autumn in the second week of September; in Zürich the Saluki feels it later, in the föhn.

Our notes on weekly care are short and unstrict. Brushing is a quiet half-hour. Bathing is rare. The vet is a person you know by name and visit twice a year, not when the worry is loud.`,
  },
];
