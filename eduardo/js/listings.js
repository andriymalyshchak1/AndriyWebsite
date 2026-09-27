/*
  Sample listing data for the home search page.
  Replace with an IDX / MLS feed for live inventory.

  img / gallery values are Unsplash photo IDs (https://images.unsplash.com/photo-<id>).
  status: 'sale' | 'rent'  (rent prices are monthly)
  days:   days since listed (drives "Newest" sort and the "New" badge)
*/
window.ED_LISTINGS = [
  {
    id: 'westlake-hill-country-modern', title: 'Hill Country Modern', hood: 'Westlake Hills', city: 'Austin', zip: '78746',
    lat: 30.2966, lng: -97.8028, status: 'sale', price: 3250000, type: 'House', beds: 5, baths: 5.5, sqft: 5420, lot: 0.62, year: 2021, days: 3,
    img: '1600596542815-ffad4c1539a9', gallery: ['1600607687939-ce8a6c25118c', '1600566753086-00f18fb6b3ea'],
    blurb: 'Walls of glass open to a resort-style pool deck, with an Eanes ISD address and a five-minute drive to downtown.'
  },
  {
    id: 'barton-creek-pool-estate', title: 'Contemporary Pool Estate', hood: 'Barton Creek', city: 'Austin', zip: '78735',
    lat: 30.2860, lng: -97.8580, status: 'sale', price: 4195000, type: 'House', beds: 6, baths: 6, sqft: 6180, lot: 1.1, year: 2019, days: 12,
    img: '1613490493576-7fde63acd811', gallery: ['1600573472550-8090b5e0745e', '1600607687644-c7171b42498f'],
    blurb: 'A gated retreat with a 60-foot lap pool, a detached casita, and greenbelt views from nearly every room.'
  },
  {
    id: 'mueller-modern-townhome', title: 'Mueller Modern Townhome', hood: 'Mueller', city: 'Austin', zip: '78723',
    lat: 30.2990, lng: -97.7050, status: 'sale', price: 785000, type: 'Townhouse', beds: 3, baths: 3.5, sqft: 2140, lot: 0.06, year: 2020, days: 1,
    img: '1600566753190-17f0baa2a6c3', gallery: ['1618221195710-dd6b41faaea6', '1484154218962-a197022b5858'],
    blurb: 'Steps from Mueller Lake Park and the Saturday farmers market, with a rooftop terrace and a two-car garage.'
  },
  {
    id: 'tarrytown-contemporary', title: 'Tarrytown Contemporary', hood: 'Tarrytown', city: 'Austin', zip: '78703',
    lat: 30.2960, lng: -97.7690, status: 'sale', price: 1650000, type: 'House', beds: 4, baths: 3, sqft: 3050, lot: 0.24, year: 2016, days: 20,
    img: '1628744448840-55bdb2497bd4', gallery: ['1600210492486-724fe5c67fb0', '1556911220-bff31c812dba'],
    blurb: 'Warm wood and stone on a quiet, tree-lined street minutes from Lake Austin and West Sixth.'
  },
  {
    id: 'cedar-park-family-modern', title: 'Cedar Park Family Modern', hood: 'Cedar Park', city: 'Cedar Park', zip: '78613',
    lat: 30.5052, lng: -97.8203, status: 'sale', price: 615000, type: 'House', beds: 4, baths: 3, sqft: 2860, lot: 0.21, year: 2018, days: 6,
    img: '1600047509807-ba8f99d2cdde', gallery: ['1616486338812-3dadae4b4ace', '1600566753086-00f18fb6b3ea'],
    blurb: 'An open plan with a game room upstairs and a covered patio overlooking a big, flat backyard.'
  },
  {
    id: 'lakeway-lakeside-contemporary', title: 'Lakeside Contemporary', hood: 'Lakeway', city: 'Lakeway', zip: '78734',
    lat: 30.3632, lng: -97.9795, status: 'sale', price: 2375000, type: 'House', beds: 5, baths: 4.5, sqft: 4300, lot: 0.8, year: 2017, days: 9,
    img: '1580587771525-78b9dba3b914', gallery: ['1600607687939-ce8a6c25118c', '1600607687644-c7171b42498f'],
    blurb: 'Sunset views over Lake Travis, an infinity-edge pool, and a short golf-cart ride to the marina.'
  },
  {
    id: 'rainey-street-high-rise', title: 'Rainey Street High-Rise', hood: 'Rainey Street', city: 'Austin', zip: '78701',
    lat: 30.2585, lng: -97.7385, status: 'sale', price: 925000, type: 'Condo', beds: 2, baths: 2, sqft: 1310, lot: 0, year: 2019, days: 4,
    img: '1582407947304-fd86f028f716', gallery: ['1522708323590-d24dbb6b0267', '1560448204-e02f11c3d0e2'],
    blurb: 'A 30th-floor corner unit with floor-to-ceiling windows, concierge service, and Lady Bird Lake out the door.'
  },
  {
    id: 'seaholm-district-loft', title: 'Seaholm District Loft', hood: 'Downtown Austin', city: 'Austin', zip: '78701',
    lat: 30.2677, lng: -97.7530, status: 'rent', price: 3900, type: 'Condo', beds: 1, baths: 1, sqft: 860, lot: 0, year: 2016, days: 2,
    img: '1464938050520-ef2270bb8ce8', gallery: ['1502672260266-1c1ef2d93688', '1493809842364-78817add7ffb'],
    blurb: 'Walk to Whole Foods flagship, the Central Library, and the hike-and-bike trail from this bright loft.'
  },
  {
    id: 'travis-heights-bungalow', title: 'Travis Heights Bungalow', hood: 'Travis Heights', city: 'Austin', zip: '78704',
    lat: 30.2480, lng: -97.7430, status: 'sale', price: 1195000, type: 'House', beds: 3, baths: 2, sqft: 1780, lot: 0.18, year: 1948, days: 15,
    img: '1480074568708-e7b720bb3f09', gallery: ['1586023492125-27b2c045efd7', '1484154218962-a197022b5858'],
    blurb: 'A lovingly updated classic a few blocks from South Congress, with original hardwoods and a deep front porch.'
  },
  {
    id: 'zilker-modern-duplex', title: 'Zilker Modern Duplex', hood: 'Zilker', city: 'Austin', zip: '78704',
    lat: 30.2600, lng: -97.7700, status: 'sale', price: 1480000, type: 'Multi-Family', beds: 6, baths: 5, sqft: 3400, lot: 0.2, year: 2022, days: 8,
    img: '1523217582562-09d0def993a6', gallery: ['1600210492486-724fe5c67fb0', '1618221195710-dd6b41faaea6'],
    blurb: 'Two 3-bedroom units near Barton Springs: live in one and lease the other, or hold both as rentals.'
  },
  {
    id: 'hyde-park-craftsman', title: 'Hyde Park Craftsman', hood: 'Hyde Park', city: 'Austin', zip: '78751',
    lat: 30.3050, lng: -97.7290, status: 'rent', price: 4200, type: 'House', beds: 3, baths: 2, sqft: 1650, lot: 0.15, year: 1925, days: 5,
    img: '1449844908441-8829872d2607', gallery: ['1493809842364-78817add7ffb', '1586023492125-27b2c045efd7'],
    blurb: 'Historic charm with modern systems, a short bike ride to UT campus and the Duval Street cafes.'
  },
  {
    id: 'east-austin-townhome', title: 'East Side Townhome', hood: 'East Austin', city: 'Austin', zip: '78702',
    lat: 30.2640, lng: -97.7200, status: 'sale', price: 699000, type: 'Townhouse', beds: 2, baths: 2.5, sqft: 1520, lot: 0.05, year: 2021, days: 11,
    img: '1600585154526-990dced4db0d', gallery: ['1522708323590-d24dbb6b0267', '1616486338812-3dadae4b4ace'],
    blurb: 'Clean lines and a private rooftop deck in the middle of East Cesar Chavez restaurants and coffee shops.'
  },
  {
    id: 'allandale-farmhouse', title: 'Allandale Farmhouse', hood: 'Allandale', city: 'Austin', zip: '78757',
    lat: 30.3400, lng: -97.7440, status: 'sale', price: 875000, type: 'House', beds: 3, baths: 2, sqft: 1900, lot: 0.25, year: 1962, days: 25,
    img: '1570129477492-45c003edd2be', gallery: ['1600566753086-00f18fb6b3ea', '1484154218962-a197022b5858'],
    blurb: 'A wraparound porch, mature oaks, and a quarter-acre lot in one of Central Austin\'s most walkable pockets.'
  },
  {
    id: 'circle-c-family-home', title: 'Circle C Family Home', hood: 'Circle C Ranch', city: 'Austin', zip: '78739',
    lat: 30.1930, lng: -97.8850, status: 'sale', price: 745000, type: 'House', beds: 4, baths: 3, sqft: 2950, lot: 0.2, year: 2004, days: 14,
    img: '1592595896551-12b371d546d5', gallery: ['1616486338812-3dadae4b4ace', '1556911220-bff31c812dba'],
    blurb: 'Top-rated schools, community pools, and the Veloway and Wildflower Center close by.'
  },
  {
    id: 'georgetown-stone-traditional', title: 'Stone Traditional', hood: 'Georgetown', city: 'Georgetown', zip: '78628',
    lat: 30.6333, lng: -97.6770, status: 'sale', price: 529000, type: 'House', beds: 4, baths: 2.5, sqft: 2620, lot: 0.22, year: 2015, days: 7,
    img: '1605276374104-dee2a0ed3cd6', gallery: ['1618221195710-dd6b41faaea6', '1600210492486-724fe5c67fb0'],
    blurb: 'Solid stone and brick construction a short drive from the historic Georgetown square.'
  },
  {
    id: 'round-rock-two-story', title: 'Round Rock Two-Story', hood: 'Round Rock', city: 'Round Rock', zip: '78664',
    lat: 30.5083, lng: -97.6789, status: 'sale', price: 489000, type: 'House', beds: 4, baths: 2.5, sqft: 2410, lot: 0.17, year: 2012, days: 3,
    img: '1568605114967-8130f3a36994', gallery: ['1493809842364-78817add7ffb', '1484154218962-a197022b5858'],
    blurb: 'Move-in ready with a new roof, fresh paint, and quick access to Dell Diamond and I-35.'
  },
  {
    id: 'pflugerville-new-build', title: 'New Construction with Pool', hood: 'Pflugerville', city: 'Pflugerville', zip: '78660',
    lat: 30.4394, lng: -97.6200, status: 'sale', price: 459000, type: 'House', beds: 4, baths: 3, sqft: 2380, lot: 0.16, year: 2025, days: 1,
    img: '1564013799919-ab600027ffc6', gallery: ['1616486338812-3dadae4b4ace', '1600566753086-00f18fb6b3ea'],
    blurb: 'Brand-new build with builder warranty, a backyard pool, and energy-efficient everything.'
  },
  {
    id: 'liberty-hill-farmhouse', title: 'Liberty Hill Farmhouse', hood: 'Liberty Hill', city: 'Liberty Hill', zip: '78642',
    lat: 30.6649, lng: -97.9225, status: 'sale', price: 649000, type: 'House', beds: 4, baths: 3, sqft: 2780, lot: 1.0, year: 2020, days: 10,
    img: '1583608205776-bfd35f0d9f83', gallery: ['1586023492125-27b2c045efd7', '1618221195710-dd6b41faaea6'],
    blurb: 'A full acre with room for a shop or garden, and wide-open Hill Country skies.'
  },
  {
    id: 'leander-modern-rental', title: 'Leander Modern Rental', hood: 'Leander', city: 'Leander', zip: '78641',
    lat: 30.5788, lng: -97.8531, status: 'rent', price: 2650, type: 'House', beds: 4, baths: 2.5, sqft: 2300, lot: 0.15, year: 2017, days: 4,
    img: '1531971589569-0d9370cbe1e5', gallery: ['1600210492486-724fe5c67fb0', '1493809842364-78817add7ffb'],
    blurb: 'Near the MetroRail station and Leander ISD schools, with a fenced yard and a two-car garage.'
  },
  {
    id: 'bee-cave-hilltop-estate', title: 'Hilltop Estate', hood: 'Bee Cave', city: 'Bee Cave', zip: '78738',
    lat: 30.3085, lng: -97.9450, status: 'sale', price: 1895000, type: 'House', beds: 5, baths: 4.5, sqft: 4650, lot: 0.9, year: 2018, days: 18,
    img: '1512917774080-9991f1c4c750', gallery: ['1600573472550-8090b5e0745e', '1600607687939-ce8a6c25118c'],
    blurb: 'Indoor-outdoor living around a glass-tiled pool, minutes from the Hill Country Galleria.'
  },
  {
    id: 'spanish-oaks-resort-home', title: 'Resort-Style Modern', hood: 'Spanish Oaks', city: 'Bee Cave', zip: '78738',
    lat: 30.3190, lng: -97.9200, status: 'sale', price: 5750000, type: 'House', beds: 6, baths: 7.5, sqft: 7800, lot: 1.8, year: 2022, days: 5,
    img: '1613977257363-707ba9348227', gallery: ['1600607687644-c7171b42498f', '1600573472550-8090b5e0745e'],
    blurb: 'A private golf-community estate with a wine room, home theater, and an outdoor kitchen built for hosting.'
  },
  {
    id: 'dripping-springs-ranch', title: 'Hill Country Ranch Home', hood: 'Dripping Springs', city: 'Dripping Springs', zip: '78620',
    lat: 30.1902, lng: -98.0867, status: 'sale', price: 1250000, type: 'House', beds: 4, baths: 3.5, sqft: 3600, lot: 5.0, year: 2014, days: 22,
    img: '1558036117-15d82a90b9b1', gallery: ['1586023492125-27b2c045efd7', '1616486338812-3dadae4b4ace'],
    blurb: 'Five acres with sweeping views, an ag exemption, and wineries and breweries just down the road.'
  },
  {
    id: 'dripping-springs-a-frame', title: 'Hill Country A-Frame', hood: 'Dripping Springs', city: 'Dripping Springs', zip: '78620',
    lat: 30.2300, lng: -98.1300, status: 'rent', price: 3100, type: 'House', beds: 2, baths: 1, sqft: 1100, lot: 2.1, year: 2021, days: 6,
    img: '1601918774946-25832a4be0d6', gallery: ['1502672260266-1c1ef2d93688', '1493809842364-78817add7ffb'],
    blurb: 'A cozy architect-designed getaway tucked into the trees, fully furnished and ready to move in.'
  },
  {
    id: 'westlake-pool-villa', title: 'Westlake Pool Villa', hood: 'Westlake', city: 'Austin', zip: '78746',
    lat: 30.2850, lng: -97.8150, status: 'sale', price: 2890000, type: 'House', beds: 5, baths: 4, sqft: 4800, lot: 0.7, year: 2008, days: 16,
    img: '1599809275671-b5942cabc7a2', gallery: ['1600607687939-ce8a6c25118c', '1600573472550-8090b5e0745e'],
    blurb: 'A Mediterranean-inspired retreat with a fire-bowl pool, spa, and a terrace made for sunsets.'
  },
  {
    id: 'lake-austin-contemporary', title: 'Lake Austin Contemporary', hood: 'River Place', city: 'Austin', zip: '78730',
    lat: 30.3440, lng: -97.8250, status: 'sale', price: 3650000, type: 'House', beds: 5, baths: 5.5, sqft: 5200, lot: 1.2, year: 2020, days: 2,
    img: '1600585154340-be6161a56a0c', gallery: ['1600607687644-c7171b42498f', '1556911220-bff31c812dba'],
    blurb: 'Dramatic modern architecture under a canopy of heritage oaks, close to Lake Austin boat ramps.'
  },
  {
    id: 'manor-townhome-rental', title: 'Manor Townhome', hood: 'Manor', city: 'Manor', zip: '78653',
    lat: 30.3405, lng: -97.5569, status: 'rent', price: 2150, type: 'Townhouse', beds: 3, baths: 2.5, sqft: 1650, lot: 0.04, year: 2022, days: 9,
    img: '1600566753190-17f0baa2a6c3', gallery: ['1522708323590-d24dbb6b0267', '1560448204-e02f11c3d0e2'],
    blurb: 'A low-maintenance, nearly-new townhome with quick access to the Tesla Gigafactory and SH-130.'
  }
];
