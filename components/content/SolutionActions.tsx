"use client";

import { Bookmark, Share2, Flag, Printer, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  contentType: "exercise";
  contentId: string;
  shareUrl: string;
  shareTitle: string;
  pdfTargetId?: string;
  pdfFilename?: string;
};

export function SolutionActions({
  contentType,
  contentId,
  shareUrl,
  shareTitle,
  pdfTargetId,
  pdfFilename,
}: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookmarks");
      const bookmarks: Array<{ type: string; id: string }> = raw
        ? JSON.parse(raw)
        : [];
      setBookmarked(
        bookmarks.some((b) => b.type === contentType && b.id === contentId)
      );
    } catch {
      // ignore corrupt storage
    }
  }, [contentType, contentId]);

  const toggleBookmark = () => {
    try {
      const raw = localStorage.getItem("bookmarks");
      const bookmarks: Array<{ type: string; id: string }> = raw
        ? JSON.parse(raw)
        : [];
      const next = bookmarked
        ? bookmarks.filter(
            (b) => !(b.type === contentType && b.id === contentId)
          )
        : [...bookmarks, { type: contentType, id: contentId }];
      localStorage.setItem("bookmarks", JSON.stringify(next));
      setBookmarked(!bookmarked);
    } catch {
      setBookmarked((b) => !b);
    }
  };

  const share = async () => {
    const data = { title: shareTitle, url: shareUrl };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore
    }
  };

  const print = async () => {
    if (downloading) return;
    if (!pdfTargetId) {
      window.print();
      return;
    }
    const target = document.getElementById(pdfTargetId);
    if (!target) {
      window.print();
      return;
    }
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 32;
      const usableWidth = pageWidth - margin * 2;
      const ratio = usableWidth / canvas.width;
      const imgHeight = canvas.height * ratio;
      let position = margin;
      let remaining = imgHeight;
      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
      remaining -= pageHeight - margin * 2;
      while (remaining > 0) {
        pdf.addPage();
        position = margin - (imgHeight - remaining);
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
        remaining -= pageHeight - margin * 2;
      }
      const filename = (pdfFilename ?? shareTitle).replace(/[^\w\-\s.]/g, "").trim() || "solution";
      pdf.save(`${filename}.pdf`);
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="no-print flex flex-nowrap items-center justify-center gap-1.5 sm:flex-wrap sm:justify-start sm:gap-2">
      <ActionButton
        onClick={toggleBookmark}
        active={bookmarked}
        label={bookmarked ? "Bookmarked" : "Bookmark"}
        shortLabel={bookmarked ? "Saved" : "Save"}
        icon={Bookmark}
      />
      <ActionButton onClick={share} label="Share" icon={Share2} />
      <ActionButton
        onClick={print}
        label={downloading ? "Saving..." : "Print / PDF"}
        shortLabel={downloading ? "Saving" : "PDF"}
        icon={downloading ? Loader2 : Printer}
        spinning={downloading}
        disabled={downloading}
      />
      <a
        href={`/feedback?type=${contentType}&id=${contentId}`}
        className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong bg-surface px-2.5 text-xs font-medium text-fg-muted transition-colors hover:border-danger/40 hover:bg-danger-soft hover:text-danger sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
      >
        <Flag aria-hidden className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="sm:hidden">Report</span>
        <span className="hidden sm:inline">Report error</span>
      </a>
    </div>
  );
}

function ActionButton({
  onClick,
  active,
  label,
  shortLabel,
  icon: Icon,
  spinning,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  spinning?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border-strong bg-surface text-fg-muted hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "h-3.5 w-3.5 sm:h-4 sm:w-4",
          spinning && "animate-spin"
        )}
      />
      {shortLabel ? (
        <>
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
