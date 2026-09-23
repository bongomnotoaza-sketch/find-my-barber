type MainImageProps = {
  images?: string[];
};

const defaultImages = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
];

export default function MainImage({ images = defaultImages }: MainImageProps) {
  const displayImages = images.slice(0, 5);

  return (
    <div className="relative h-full w-full">
      <div className="flex flex-row h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {displayImages.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            className="h-full w-full flex-shrink-0 snap-center object-cover"
            alt={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}