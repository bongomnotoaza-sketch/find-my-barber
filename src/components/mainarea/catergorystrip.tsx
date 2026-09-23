import CategoryCard from "./catergorycard";

type Category = {
  image: string;
  title: string;
};

type CategoryStripProps = {
  categories?: Category[];
};

const defaultCategories: Category[] = [
  {
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
    title: "Haircuts",
  },
  {
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
    title: "Beards",
  },
  {
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df",
    title: "Styling",
  },
  {
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0d4b1f1e",
    title: "Color",
  },
  {
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70",
    title: "Shaving",
  },
];

export default function CategoryStrip({
  categories = defaultCategories,
}: CategoryStripProps) {
  return (
    <div className="w-full h-[15%] bg-white/5 py-2">
      <div className="flex flex-row gap-2 overflow-x-auto px-4 scrollbar-hide">
        {categories.map((category, index) => (
          <CategoryCard
            key={`${category.title}-${index}`}
            image={category.image}
            title={category.title}
          />
        ))}
      </div>
    </div>
  );
}