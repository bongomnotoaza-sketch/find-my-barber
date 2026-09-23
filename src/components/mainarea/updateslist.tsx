import UpdateCard from './updatecard';
import updateCards from './updatecardsdata';

export default function UpdatesList() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {updateCards.map((card, index) => (
        <UpdateCard
          key={index}
          initials={card.initials}
          heading={card.heading}
          subject={card.subject}
          senddate={card.senddate}
        />
      ))}
    </div>
  );
}