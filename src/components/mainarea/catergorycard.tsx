type CategoryCardProps = {
  image: string;
  title: string;
};

export default function CategoryCard({ image, title }: CategoryCardProps) {
  return (
    <button
      type="button"
      className="w-24 flex flex-col items-center rounded-2xl p-2 active:bg-white/10"
    >
      <img src={image} className="h-16 w-16 rounded-full object-cover" alt={title} />

      <span className="mt-2 text-center text-sm font-medium text-white">
        {title}
      </span>
    </button>
  );
}