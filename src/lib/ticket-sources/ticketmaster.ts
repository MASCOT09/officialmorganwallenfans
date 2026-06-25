export interface FetchedShow {
  external_id: string;
  source_name: string;
  source_url: string | null;
  title: string;
  description: string;
  venue: string;
  city: string;
  event_date: string;
  price_cents: number;
  image_url: string | null;
}

interface TicketmasterVenue {
  name?: string;
  city?: { name?: string };
  state?: { stateCode?: string };
}

interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  info?: string;
  pleaseNote?: string;
  dates?: { start?: { dateTime?: string; localDate?: string } };
  priceRanges?: { min?: number; max?: number }[];
  images?: { url: string; width: number }[];
  _embedded?: { venues?: TicketmasterVenue[] };
}

interface TicketmasterResponse {
  _embedded?: { events?: TicketmasterEvent[] };
  page?: { totalPages?: number };
}

function pickImage(images?: TicketmasterEvent["images"]): string | null {
  if (!images?.length) return null;
  const sorted = [...images].sort((a, b) => b.width - a.width);
  return sorted[0]?.url ?? null;
}

function parseEvent(event: TicketmasterEvent): FetchedShow | null {
  const venue = event._embedded?.venues?.[0];
  const dateTime =
    event.dates?.start?.dateTime ??
    (event.dates?.start?.localDate ? `${event.dates.start.localDate}T19:00:00` : null);
  if (!dateTime) return null;

  const cityParts = [venue?.city?.name, venue?.state?.stateCode].filter(Boolean);
  const minPrice = event.priceRanges?.[0]?.min;
  const description =
    [event.info, event.pleaseNote].filter(Boolean).join("\n\n") ||
    "Official Morgan Wallen concert — fan community presale listing.";

  return {
    external_id: event.id,
    source_name: "ticketmaster",
    source_url: event.url ?? null,
    title: event.name,
    description,
    venue: venue?.name ?? "TBA",
    city: cityParts.join(", ") || "TBA",
    event_date: new Date(dateTime).toISOString(),
    price_cents: minPrice ? Math.round(minPrice * 100) : 0,
    image_url: pickImage(event.images),
  };
}

export async function fetchMorganWallenShowsFromTicketmaster(): Promise<FetchedShow[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TICKETMASTER_API_KEY is not set. Get a free key at https://developer.ticketmaster.com/",
    );
  }

  const attractionId = process.env.TICKETMASTER_ATTRACTION_ID ?? "K8vZ9171o1V";
  const shows: FetchedShow[] = [];
  let page = 0;
  const size = 50;
  let totalPages = 1;

  while (page < totalPages && page < 5) {
    const params = new URLSearchParams({
      apikey: apiKey,
      size: String(size),
      page: String(page),
      sort: "date,asc",
      classificationName: "music",
    });

    if (attractionId) {
      params.set("attractionId", attractionId);
    } else {
      params.set("keyword", "Morgan Wallen");
    }

    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
      { next: { revalidate: 0 } },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Ticketmaster API error (${res.status}): ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as TicketmasterResponse;
    totalPages = data.page?.totalPages ?? 1;
    const events = data._embedded?.events ?? [];

    for (const event of events) {
      if (!event.name.toLowerCase().includes("morgan wallen")) continue;
      const parsed = parseEvent(event);
      if (parsed) shows.push(parsed);
    }

    page += 1;
  }

  return shows;
}
