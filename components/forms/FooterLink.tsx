import Link from "next/link";
import React from "react";

const FooterLink = ({ text, linkText, href }: FooterLinkProps) => {
  return (
    <div className="text-center pt-4">
      <p>
        <Link href={href} className="footer-link">
          {text} {linkText}
        </Link>
      </p>
    </div>
  );
};

export default FooterLink;
