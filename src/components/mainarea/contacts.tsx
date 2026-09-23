import { Mail, Phone } from "lucide-react";

type ContactProps = {
  whatsapp?: string;
  phone?: string;
  email?: string;
};

export default function Contact({ whatsapp, phone, email }: ContactProps) {
  return (
    <div className="w-full h-full">
      {whatsapp && (
        <div className="mb-4 flex flex-row items-center">
          <i className="fa-brands fa-whatsapp text-white text-xl" />
          <span className="ml-3 text-sm text-white">{whatsapp}</span>
        </div>
      )}

      {phone && (
        <div className="mb-4 flex flex-row items-center">
          <Phone size={21} color="#ffffff" />
          <span className="ml-3 text-sm text-white">{phone}</span>
        </div>
      )}

      {email && (
        <div className="flex flex-row items-center">
          <Mail size={21} color="#ffffff" />
          <span className="ml-3 text-sm text-white">{email}</span>
        </div>
      )}
    </div>
  );
}