import type {Photo} from './domain';

export type PropertyPhoto=Photo&{id:number;category:'Living areas'|'Bedrooms'|'Kitchens'|'Bathrooms'|'Outdoors';caption:string};
const entries:[string,PropertyPhoto['category'],string][]=[
  ['living-tv-and-seating','Living areas','TV wall & seating'],
  ['living-reverse-angle-overview','Living areas','Living room · reverse view'],
  ['living-second-tv-wall','Living areas','Second lounge · TV wall'],
  ['living-second-seating','Living areas','Second lounge · seating'],
  ['studio-lounge-overview','Living areas','Studio lounge'],
  ['bedroom-gold-upholstered','Bedrooms','Gold upholstered bedroom'],
  ['bedroom-full-room','Bedrooms','Bedroom · full-room view'],
  ['bedroom-neutral-wide','Bedrooms','Neutral bedroom'],
  ['bedroom-gold-bed-wide','Bedrooms','Gold bedroom · wider view'],
  ['bedroom-gray-bed','Bedrooms','Gray upholstered bedroom'],
  ['kitchen-white-overview','Kitchens','White kitchen'],
  ['kitchen-single-sink','Kitchens','Single sink & worktop'],
  ['kitchen-wood-overview','Kitchens','Wood-finish kitchen'],
  ['kitchen-double-sink','Kitchens','Double sink & worktop'],
  ['bathroom-toilet-basin','Bathrooms','Bathroom · basin & toilet'],
  ['bathroom-shower-toilet','Bathrooms','Bathroom · shower view'],
  ['bathroom-second-toilet-basin','Bathrooms','Second bathroom'],
  ['exterior-entrance','Outdoors','Property entrance'],
  ['patio-dining-view','Outdoors','Patio dining area'],
  ['patio-full-angle','Outdoors','Patio · full view'],
];
const descriptions=[
  'Living area with brown upholstered seating, a marble-pattern TV wall, round coffee tables and a warm chandelier.',
  'Reverse view of the living room with the back of a brown sofa, matching chairs and the TV feature wall.',
  'Second living area facing a TV set into a dark slatted feature wall, with round tables and a marble-pattern floor.',
  'Second lounge with a long upholstered sofa, three dark doors and a ceiling chandelier.',
  'Studio seating area with a brown sofa, wall-mounted TV, small round table and the bed visible in the foreground.',
  'Bedroom with a gold diamond-tufted headboard, black-and-white patterned bedding, mustard bed runner and curtains.',
  'Bedroom with a gold headboard, circular-pattern bedding, wall-mounted TV and recessed ceiling lighting.',
  'Bedroom with a pale upholstered bed, light patterned bedding, wall fan and a black chair in the foreground.',
  'Gold upholstered bed with black-and-white patterned bedding, a round side table and mustard curtains.',
  'Bed with a gray button-tufted headboard and dark bedding with white and gold branch-like patterns.',
  'White kitchen with an extractor hood, gas hob, microwave, pale cabinets and marble-pattern wall tiles.',
  'Single stainless-steel sink with a curved tap beside a brown worktop and gray wall tiles.',
  'Wood-finish kitchen with a gas cooker, black extractor hood, brown worktop and a sink beneath a window.',
  'Double stainless-steel sink with a curved tap, brown worktop and light wood upper cabinets.',
  'Bathroom with a white toilet, basin cabinet, wall mirror and light marble-pattern tiles.',
  'Tiled bathroom with a white toilet, handheld shower and a high window.',
  'Second bathroom with a white toilet, rectangular basin, handheld shower and chevron-pattern flooring.',
  'Exterior entrance with a dark front door, wood-finish side door and gray textured walls.',
  'Outdoor patio with a large brown umbrella, dark dining furniture, green artificial turf and a red walkway.',
  'Angled patio view showing the umbrella, dining furniture, swing seat, green turf and red walkway.',
];
export const propertyPhotos:PropertyPhoto[]=entries.map(([name,category,caption],index)=>({id:index+1,src:`/images/boujeelux-${String(index+1).padStart(2,'0')}-${name}.webp`,category,caption,alt:descriptions[index],illustrative:false}));
// These matching living-room views are property-wide, not a confirmed unit assignment.
export const residencePhotos:Photo[]=propertyPhotos.slice(0,2).map(p=>({...p,scope:'property-wide'}));
// The archive explicitly identifies photo 05 as the studio. Other room-to-unit
// assignments remain unconfirmed, so all 20 are also in the property-wide gallery.
export const studioPhotos:Photo[]=[propertyPhotos[4]];
