import MusicPlayer from "./searchresult";

type Result = {
  id: number;
  image: string;
  barberName: string;
  bio: string;
};

const defaultResults: Result[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80",
    barberName: "Fresh Cuts",
    bio: "Specialising in fresh fades, sharp lineups, and modern hairstyles.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=500&q=80",
    barberName: "Classic Fades",
    bio: "Classic barbering with clean fades, precise cuts, and attention to detail.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80",
    barberName: "Elite Barbers",
    bio: "Premium grooming, stylish cuts, and personalised service for every client.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80",
    barberName: "The Grooming Spot",
    bio: "Your neighbourhood destination for great haircuts and beard grooming.",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=500&q=80",
    barberName: "Sharp Look",
    bio: "Detailed lineups, modern fades, and fresh styles that stand out.",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80",
    barberName: "Urban Blades",
    bio: "Contemporary barbering inspired by urban culture and individual style.",
  },
];

type ResultsListProps = {
  results?: Result[];
};

export default function ResultsList({
  results = defaultResults,
}: ResultsListProps) {
  return (
    <div className="w-full h-full min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 p-3">
        {results.map((result) => (
          <div
            key={result.id}
            className="w-full aspect-[3/4] min-w-0"
          >
            <MusicPlayer
              image={result.image}
              barberName={result.barberName}
              bio={result.bio}
            />
          </div>
        ))}
      </div>
    </div>
  );
}