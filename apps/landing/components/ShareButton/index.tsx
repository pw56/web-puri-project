"use client";

import Image from "next/image";
import styles from "./index.module.css";

type ShareService = "x" | "instagram" | "line" | "mail";

interface ShareButtonProps {
  service: ShareService;
  shareMessage: string;
  shareUrl: string;
}

export default function ShareButton({
  service,
  shareMessage,
  shareUrl,
}: ShareButtonProps) {
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(shareUrl);

  // 共有リンク
  const shareLinks = {
    x: `https://x.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    instagram: `https://www.instagram.com/?text=${encodeMessage}&url=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?text=${encode}&url=${encodedUrl}`,
    mail: `mailto:?subject=${encodedMessage}&body=${encodedMessage}%0D%0A${encodedUrl}`,
  };

  const icons = {
    x: "/share-icons/x.svg",
    instagram: "/share-icons/instagram.svg",
    line: "/share-icons/line.svg",
    mail: "/share-icons/mail.svg",
  };

  return (
    <a
      href={shareLinks[service]}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
    >
      <Image
        src={icons[service]}
        alt={`${service} icon`}
        width={20}
        height={20}
      />
      <span>
        {service === "x" && "Xで共有"}
        {service === "instagram" && "Instagramで共有"}
        {service === "line" && "LINEで共有"}
        {service === "mail" && "メールで共有"}
      </span>
    </a>
  );
}
