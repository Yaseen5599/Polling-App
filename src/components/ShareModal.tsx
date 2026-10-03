import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, X, Share2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollId: string;
  question: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  pollId,
  question,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const { success } = useToast();

  if (!isOpen) return null;

  const pollUrl = `${window.location.origin}/poll/${pollId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      success('Poll link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = pollUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      success('Poll link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Vote on this poll: "${question}"\n\n${pollUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Vote on this poll: "${question}"\n${pollUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Share This Poll</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anyone with this link can view and cast their vote
            </p>
          </div>
        </div>

        {/* Question excerpt */}
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 line-clamp-2">
          &ldquo;{question}&rdquo;
        </p>

        {/* Link input + Copy */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Shareable Poll Link
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={pollUrl}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-200 focus:outline-none select-all"
              />
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Social share quick links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleShareTwitter}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Share on X (Twitter)
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Share via WhatsApp
            </button>
          </div>

          {/* QR Code toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-1"
            >
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-500" />
                {showQr ? 'Hide QR Code' : 'Show Mobile QR Code'}
              </span>
              <span className="text-[11px] underline">
                {showQr ? 'Close' : 'View'}
              </span>
            </button>

            {showQr && (
              <div className="mt-3 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in">
                <QRCodeSVG value={pollUrl} size={160} level="M" />
                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  Scan to open poll on your phone
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
