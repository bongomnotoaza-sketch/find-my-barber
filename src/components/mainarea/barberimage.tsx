type MainImageProps = {
  image?: string;
};

const defaultImage =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f";

export default function MainImage({ image = defaultImage }: MainImageProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={image}
        className="h-full w-full object-cover"
        alt="Barber shop exterior"
      />
    </div>
  );
}