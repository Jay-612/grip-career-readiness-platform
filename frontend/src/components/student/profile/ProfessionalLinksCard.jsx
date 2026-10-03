import React from 'react';
import {
  Globe,
  ExternalLink,
  Edit3,
  Link2,
  Code2
} from 'lucide-react';
import Button from '../../common/Button';

export const ProfessionalLinksCard = ({
  links = {},
  onEditLinks = () => {},
}) => {
  const linkItems = [
    {
      id: 'github',
      label: 'GitHub',
      url: links.github || '',
      placeholder: 'github.com/username',
      display: links.github ? links.github.replace(/^https?:\/\//i, '') : 'Add GitHub profile',
      color: 'hover:text-slate-900',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: links.linkedin || '',
      placeholder: 'linkedin.com/in/username',
      display: links.linkedin ? links.linkedin.replace(/^https?:\/\//i, '') : 'Add LinkedIn profile',
      color: 'hover:text-blue-600',
    },
    {
      id: 'portfolio',
      label: 'Portfolio Website',
      url: links.portfolio || '',
      placeholder: 'portfolio.dev',
      display: links.portfolio ? links.portfolio.replace(/^https?:\/\//i, '') : 'Add personal portfolio',
      color: 'hover:text-indigo-600',
    },
    {
      id: 'leetcode',
      label: 'LeetCode / Coding Profile',
      url: links.leetcode || '',
      placeholder: 'leetcode.com/username',
      display: links.leetcode ? links.leetcode.replace(/^https?:\/\//i, '') : 'Add coding profile',
      color: 'hover:text-amber-600',
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4" aria-label="Professional Links & Portfolios">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Professional Links
          </h2>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={onEditLinks}
          leftIcon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />}
          className="text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Edit Links
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {linkItems.map((item) => {
          const hasUrl = !!item.url;

          return hasUrl ? (
            <a
              key={item.id}
              href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between gap-2 text-xs group ${item.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-[11px] text-slate-500 font-mono truncate">
                {item.display}
              </span>
            </a>
          ) : (
            <button
              key={item.id}
              type="button"
              onClick={onEditLinks}
              className="p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/20 transition-all duration-150 flex flex-col justify-between gap-2 text-xs text-left group"
            >
              <span className="font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">
                + Add link
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ProfessionalLinksCard;
