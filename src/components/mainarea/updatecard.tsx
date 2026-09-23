import type { FC } from 'react';

interface UpdateCardProps {
  initials: string;
  heading: string;
  subject: string;
  senddate: string;
}

const UpdateCard: FC<UpdateCardProps> = ({ initials, heading, subject, senddate }) => {
  return (
    <div
      id="updatecardbtn"
      className="relative w-full md:w-[60%] h-16 md:h-20 mx-auto grid grid-cols-[20%_80%] rounded-lg overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02]"
    >
      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto my-auto">
        {initials}
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center text-center px-3 md:px-5 font-sans overflow-hidden">
        <h1 className="w-full font-semibold text-white text-lg md:text-base truncate text-left">
          {heading}
        </h1>
        <p className="w-full mt-1 text-gray-300 text-xs md:text-lg truncate text-left">
          {subject}
        </p>
      </div>

      <span  className="absolute top-2 right-3 z-10 text-xs text-white">
        {senddate}
      </span>
    </div>
  );
};

export default UpdateCard;